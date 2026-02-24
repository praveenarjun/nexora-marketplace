package com.shopease.orderservice.controller;

import com.shopease.orderservice.dto.OrderRequest;
import com.shopease.orderservice.dto.OrderResponse;
import com.shopease.orderservice.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@RequestHeader("X-User-Id") Long userId,
                                                    @Valid @RequestBody OrderRequest request) {
        return new ResponseEntity<>(orderService.placeOrder(request, userId), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@RequestHeader("X-User-Id") Long userId,
                                                      @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId, userId));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@RequestHeader("X-User-Id") Long userId,
                                            @PathVariable Long orderId) {
        orderService.cancelOrder(orderId, userId);
        return ResponseEntity.ok().build();
    }
}
