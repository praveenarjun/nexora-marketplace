package com.shopease.orderservice.publisher;

import com.shopease.orderservice.config.RabbitMQConfig;
import com.shopease.orderservice.event.OrderCancelledEvent;
import com.shopease.orderservice.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("Publishing Order Created Event for Order Number: {}", event.getOrderNumber());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "order.created", event);
    }

    public void publishOrderCancelledEvent(OrderCancelledEvent event) {
        log.info("Publishing Order Cancelled Event for Order Number: {}", event.getOrderNumber());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "order.cancelled", event);
    }
}
