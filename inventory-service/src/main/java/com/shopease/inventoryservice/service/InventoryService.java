package com.shopease.inventoryservice.service;

import com.shopease.inventoryservice.domain.Inventory;
import com.shopease.inventoryservice.dto.*;
import com.shopease.inventoryservice.exception.InsufficientStockException;
import com.shopease.inventoryservice.exception.InventoryNotFoundException;
import com.shopease.inventoryservice.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public List<StockCheckResponse> checkStock(List<StockCheckRequest> requests) {
        return requests.stream().map(req -> {
            Inventory inventory = inventoryRepository.findByProductId(req.getProductId())
                    .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + req.getProductId()));
            
            return StockCheckResponse.builder()
                    .productId(req.getProductId())
                    .requestedQuantity(req.getQuantity())
                    .availableQuantity(inventory.getAvailableQuantity())
                    .inStock(inventory.isInStock(req.getQuantity()))
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponse reserveStock(ReservationRequest request) {
        String reservationId = UUID.randomUUID().toString();
        log.info("Attempting reservation: {}", reservationId);

        for (ReservationItemRequest item : request.getItems()) {
            Inventory inventory = inventoryRepository.findByProductId(item.getProductId())
                    .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + item.getProductId()));

            if (!inventory.isInStock(item.getQuantity())) {
                throw new InsufficientStockException("Insufficient stock for product: " + item.getProductId() +
                        ". Available: " + inventory.getAvailableQuantity() + ", Requested: " + item.getQuantity());
            }

            inventory.setReservedQuantity(inventory.getReservedQuantity() + item.getQuantity());
            inventoryRepository.save(inventory);
        }

        log.info("Successfully reserved stock for reservation: {}", reservationId);
        return ReservationResponse.builder()
                .reservationId(reservationId)
                .status("RESERVED")
                .build();
    }

    @Transactional
    public void releaseStock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + productId));

        if (inventory.getReservedQuantity() >= quantity) {
            inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
            inventoryRepository.save(inventory);
            log.info("Released {} reserved items for product: {}", quantity, productId);
        } else {
            log.warn("Attempting to release more stock than reserved for product: {}", productId);
        }
    }

    @Transactional
    public void confirmDeduction(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + productId));

        if (inventory.getReservedQuantity() >= quantity && inventory.getQuantity() >= quantity) {
            inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
            inventory.setQuantity(inventory.getQuantity() - quantity);
            inventoryRepository.save(inventory);
            
            log.info("Confirmed deduction of {} items for product: {}", quantity, productId);

            if (inventory.isLowStock()) {
                log.warn("LOW STOCK WARNING! Product {} is running low. Available qty: {}", productId, inventory.getAvailableQuantity());
            }
        } else {
            throw new InsufficientStockException("Cannot confirm deduction. Invalid quantity metrics for product: " + productId);
        }
    }

    @Transactional
    public void restock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId).orElse(null);

        if (inventory == null) {
            inventory = Inventory.builder()
                    .productId(productId)
                    .quantity(quantity)
                    .reservedQuantity(0)
                    .lowStockThreshold(10)
                    .lastRestockedAt(LocalDateTime.now())
                    .build();
        } else {
            inventory.setQuantity(inventory.getQuantity() + quantity);
            inventory.setLastRestockedAt(LocalDateTime.now());
        }

        inventoryRepository.save(inventory);
        log.info("Restocked {} items for product: {}", quantity, productId);
    }

    @Transactional(readOnly = true)
    public InventoryResponse getInventory(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + productId));
                
        return InventoryResponse.builder()
                .productId(inventory.getProductId())
                .quantity(inventory.getQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .availableQuantity(inventory.getAvailableQuantity())
                .lowStockThreshold(inventory.getLowStockThreshold())
                .inStock(inventory.getAvailableQuantity() > 0)
                .build();
    }
}
