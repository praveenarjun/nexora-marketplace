package com.shopease.orderservice.publisher;

import com.shopease.orderservice.config.RabbitMQConfig;
import com.shopease.orderservice.event.OrderCancelledEvent;
import com.shopease.orderservice.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreatedEvent(OrderCreatedEvent event) {
        try {
            log.info("Publishing Order Created Event for Order Number: {}", event.getOrderNumber());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "order.created", event);
            log.info("✅ order.created event published for order: {}", event.getOrderNumber());
        } catch (AmqpException e) {
            // Best-effort — order is saved to DB. Notification won't fire but order
            // succeeds.
            log.error("⚠️ Failed to publish order.created event for {}", event.getOrderNumber(), e);
        }
    }

    public void publishOrderCancelledEvent(OrderCancelledEvent event) {
        try {
            log.info("Publishing Order Cancelled Event for Order Number: {}", event.getOrderNumber());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "order.cancelled", event);
            log.info("✅ order.cancelled event published for order: {}", event.getOrderNumber());
        } catch (AmqpException e) {
            log.error("⚠️ Failed to publish order.cancelled event for {}", event.getOrderNumber(), e);
        }
    }
}
