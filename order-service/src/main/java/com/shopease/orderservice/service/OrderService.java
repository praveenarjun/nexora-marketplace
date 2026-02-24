package com.shopease.orderservice.service;

import com.shopease.orderservice.client.InventoryClient;
import com.shopease.orderservice.client.ProductClient;
import com.shopease.orderservice.domain.Order;
import com.shopease.orderservice.domain.OrderItem;
import com.shopease.orderservice.domain.OrderStatus;
import com.shopease.orderservice.dto.*;
import com.shopease.orderservice.dto.ApiResponse;
import com.shopease.orderservice.event.OrderCancelledEvent;
import com.shopease.orderservice.event.OrderCreatedEvent;
import com.shopease.orderservice.exception.InsufficientStockException;
import com.shopease.orderservice.exception.OrderNotFoundException;
import com.shopease.orderservice.publisher.OrderEventPublisher;
import com.shopease.orderservice.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;
    private final OrderEventPublisher orderEventPublisher;

    @Transactional
    @CircuitBreaker(name = "orderService", fallbackMethod = "placeOrderFallback")
    @Retry(name = "orderService")
    public OrderResponse placeOrder(OrderRequest request, Long userId) {
        log.info("Initiating order placement for user {}", userId);
        String orderNumber = "SE-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<StockCheckRequest> stockCheckRequests = new ArrayList<>();

        // 1 & 2. Build OrderItems & Validate Products
        for (OrderItemRequest itemReq : request.getItems()) {
            ApiResponse<ProductResponse> response = productClient.getProductById(itemReq.getProductId());
            if (response == null || !response.isSuccess() || response.getData() == null) {
                log.error("Failed to retrieve product Details for product ID: {}", itemReq.getProductId());
                throw new IllegalStateException("Product not found or unavailable: " + itemReq.getProductId());
            }
            ProductResponse product = response.getData();

            BigDecimal subtotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);

            stockCheckRequests.add(StockCheckRequest.builder()
                    .productId(itemReq.getProductId())
                    .quantity(itemReq.getQuantity())
                    .build());
        }

        // 3. Check Stock
        log.info("Checking stock availability for order {}", orderNumber);
        List<StockCheckResponse> stockStatus = inventoryClient.checkStock(stockCheckRequests);

        // 4. Validate if any out of stock
        boolean anyOutOfStock = stockStatus.stream().anyMatch(status -> !status.getInStock());
        if (anyOutOfStock) {
            log.error("Insufficient stock for order {}", orderNumber);
            throw new InsufficientStockException("One or more items are out of stock. Cannot proceed with the order.");
        }

        // 5. Reserve Stock
        log.info("Reserving stock for order {}", orderNumber);
        ReservationRequest reservationRequest = ReservationRequest.builder().items(stockCheckRequests).build();
        ReservationResponse reservationResponse = inventoryClient.reserveStock(reservationRequest);

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .status(OrderStatus.CREATED)
                .totalAmount(totalAmount)
                .shippingAddress(request.getShippingAddress())
                .reservationId(reservationResponse.getReservationId())
                .items(new ArrayList<>())
                .build();

        // Bidirectional mapping setup
        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        try {
            // 7. Save Order
            order = orderRepository.save(order);
            log.info("Order {} successfully saved to database.", orderNumber);

            // 8. Publish Event
            OrderCreatedEvent event = OrderCreatedEvent.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .userId(order.getUserId())
                    .totalAmount(order.getTotalAmount())
                    .itemCount(order.getItems().size())
                    .shippingAddress(order.getShippingAddress())
                    .timestamp(LocalDateTime.now())
                    .build();
            orderEventPublisher.publishOrderCreatedEvent(event);

            return mapToOrderResponse(order);
        } catch (Exception e) {
            // Compensating Transaction
            log.error("Failed to save order/publish event. Triggering compensating release for reservation {}",
                    reservationResponse.getReservationId(), e);
            for (OrderItem item : orderItems) {
                try {
                    inventoryClient.releaseStock(item.getProductId(), item.getQuantity());
                } catch (Exception ex) {
                    log.error("Failed to release stock for product {} during compensation!", item.getProductId(), ex);
                }
            }
            throw new IllegalStateException("Failed to process order completely. Assured inventory rollback.", e);
        }
    }

    public OrderResponse placeOrderFallback(OrderRequest request, Long userId, Throwable t) {
        log.error("Fallback activated for user {} due to: {}", userId, t.getMessage());
        throw new IllegalStateException(
                "Order service is currently degraded or its dependencies are unavailable. Please try again later. Cause: "
                        + t.getMessage());
    }

    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new IllegalStateException("You do not have permission to cancel this order");
        }

        if (!order.getStatus().isCancellable()) {
            throw new IllegalStateException("Order cannot be cancelled in its current status: " + order.getStatus());
        }

        log.info("Releasing stock for cancelled order: {}", order.getOrderNumber());
        for (OrderItem item : order.getItems()) {
            inventoryClient.releaseStock(item.getProductId(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        OrderCancelledEvent event = OrderCancelledEvent.builder()
                .orderNumber(order.getOrderNumber())
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .build();
        orderEventPublisher.publishOrderCancelledEvent(event);
        log.info("Order {} cancelled successfully.", order.getOrderNumber());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new IllegalStateException("You do not have permission to view this order");
        }

        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build()).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .cancelledAt(order.getCancelledAt())
                .build();
    }
}
