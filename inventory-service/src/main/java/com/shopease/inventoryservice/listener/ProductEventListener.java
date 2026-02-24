package com.shopease.inventoryservice.listener;

import com.shopease.inventoryservice.domain.Inventory;
import com.shopease.inventoryservice.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductEventListener {

    private final InventoryRepository inventoryRepository;

    @RabbitListener(queues = "${shopease.rabbitmq.inventory.queue:inventory.product.queue}")
    public void handleProductCreatedEvent(Map<String, Object> eventPayload) {
        log.info("Received Product Created Event: {}", eventPayload);
        
        try {
            if (eventPayload.containsKey("productId")) {
                Long productId = ((Number) eventPayload.get("productId")).longValue();

                // Check if it already exists, gracefully ignore if it does
                if (inventoryRepository.findByProductId(productId).isEmpty()) {
                    Inventory newInventory = Inventory.builder()
                            .productId(productId)
                            .quantity(0)
                            .reservedQuantity(0)
                            .lowStockThreshold(10)
                            .build();

                    inventoryRepository.save(newInventory);
                    log.info("Auto-created inventory record for productId: {}", productId);
                }
            } else {
                log.warn("Invalid event payload: missing productId");
            }
        } catch (Exception e) {
            log.error("Failed to process Product Created Event", e);
        }
    }
}
