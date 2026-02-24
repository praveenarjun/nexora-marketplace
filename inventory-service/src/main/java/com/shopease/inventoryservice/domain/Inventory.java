package com.shopease.inventoryservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long productId;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer lowStockThreshold = 10;

    private LocalDateTime lastRestockedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper methods
    public int getAvailableQuantity() {
        return (this.quantity != null ? this.quantity : 0) - (this.reservedQuantity != null ? this.reservedQuantity : 0);
    }

    public boolean isInStock(int requestedQty) {
        return getAvailableQuantity() >= requestedQty;
    }

    public boolean isLowStock() {
        return getAvailableQuantity() <= (this.lowStockThreshold != null ? this.lowStockThreshold : 10);
    }
}
