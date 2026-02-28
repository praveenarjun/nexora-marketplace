package com.shopease.notificationservice.listener;

import com.shopease.notificationservice.config.RabbitMQConfig;
import com.shopease.notificationservice.dto.OrderCancelledEvent;
import com.shopease.notificationservice.dto.OrderCreatedEvent;
import com.shopease.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("📧 Order confirmation for order #{}", event.getOrderNumber());
        emailService.sendOrderConfirmation(
                event.getCustomerEmail(),
                event.getCustomerName(),
                event.getOrderNumber(),
                event.getTotalAmount(),
                event.getShippingAddress());
    }

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("📧 Cancellation notice for order #{}", event.getOrderNumber());
        emailService.sendOrderCancellation(
                event.getCustomerEmail(),
                event.getCustomerName(),
                event.getOrderNumber());
    }
}
