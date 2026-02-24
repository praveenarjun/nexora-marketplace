package com.shopease.productservice.publisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE = "shopease.exchange";

    public void publishProductCreated(Long productId, String name, BigDecimal price) {
        log.info("📤 Publishing product.created event for product ID: {}", productId);
        Map<String, Object> event = Map.of(
                "productId", productId,
                "name", name,
                "price", price,
                "eventType", "CREATED"
        );
        rabbitTemplate.convertAndSend(EXCHANGE, "product.created", event);
    }

    public void publishProductUpdated(Long productId, String name, BigDecimal price) {
        log.info("📤 Publishing product.updated event for product ID: {}", productId);
        Map<String, Object> event = Map.of(
                "productId", productId,
                "name", name,
                "price", price,
                "eventType", "UPDATED"
        );
        rabbitTemplate.convertAndSend(EXCHANGE, "product.updated", event);
    }

    public void publishProductDeleted(Long productId) {
        log.info("📤 Publishing product.deleted event for product ID: {}", productId);
        Map<String, Object> event = Map.of(
                "productId", productId,
                "eventType", "DELETED"
        );
        rabbitTemplate.convertAndSend(EXCHANGE, "product.deleted", event);
    }
}
