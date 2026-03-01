package com.shopease.productservice.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String sku;
    private String name;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private BigDecimal costPrice;
    private String status;
    private Integer quantity;
    private Integer lowStockThreshold;
    private String brand;
    private Double weightGrams;
    private Long categoryId;
    private String categoryName;
    private boolean featured;
    private String badge;
    private Double rating;
    private Integer reviewsCount;
    private Set<String> highlights;
    private Set<String> tags;
    // Renamed from 'images' to 'imageUrls' to match frontend type
    private List<String> imageUrls;
    // Computed fields: derived from quantity and lowStockThreshold
    private boolean inStock;
    private boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
