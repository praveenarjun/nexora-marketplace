package com.shopease.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockCheckResponse {
    private Long productId;
    private Integer requestedQuantity;
    private Integer availableQuantity;
    private Boolean inStock;
}
