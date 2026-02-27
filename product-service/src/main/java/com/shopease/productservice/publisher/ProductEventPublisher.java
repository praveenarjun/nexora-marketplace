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
        try {
            log.info("📤 Publishing product.created event for product ID: {}", productId);
            Map<String, Object> event = Map.of(
                    "productId", productId,
                    "name", name,
                    "price", price,
                    "eventType", "CREATED");
            rabbitTemplate.convertAndSend(EXCHANGE, "product.created", event);
            log.info("✅ product.created event published for ID: {}", productId);
        } catch (Exception e) {
            // Event publishing is best-effort — product was saved to DB successfully.
            // RabbitMQ may be unavailable or SSL misconfigured. Log and continue.
            log.error("⚠️ Failed to publish product.created event for ID: {} — {}", productId, e.getMessage());
        }
    }

    public void publishProductUpdated(Long productId, String name, BigDecimal price) {
        try {
            log.info("📤 Publishing product.updated event for product ID: {}", productId);
            Map<String, Object> event = Map.of(
                    "productId", productId,
                    "name", name,
                    "price", price,
                    "eventType", "UPDATED");
            rabbitTemplate.convertAndSend(EXCHANGE, "product.updated", event);
            log.info("✅ product.updated event published for ID: {}", productId);
        } catch (Exception e) {
            log.error("⚠️ Failed to publish product.updated event for ID: {} — {}", productId, e.getMessage());
        }
    }

    public void publishProductDeleted(Long productId) {
        try {
            log.info("📤 Publishing product.deleted event for product ID: {}", productId);
            Map<String, Object> event = Map.of(
                    "productId", productId,
                    "eventType", "DELETED");
            rabbitTemplate.convertAndSend(EXCHANGE, "product.deleted", event);
            log.info("✅ product.deleted event published for ID: {}", productId);
        } catch (Exception e) {
            log.error("⚠️ Failed to publish product.deleted event for ID: {} — {}", productId, e.getMessage());
        }
    }
}
