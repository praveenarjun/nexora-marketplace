package com.shopease.productservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Schema(description = "Request body for updating an existing product — all fields are optional")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {

    @Schema(description = "New display name for the product", example = "Apple iPhone 15 Pro Max")
    private String name;

    @Schema(description = "Full product description", example = "Updated description with new features.")
    private String description;

    @Schema(description = "Short one-line description", example = "Bigger screen, longer battery life.")
    private String shortDescription;

    @Schema(description = "New selling price in USD", example = "1099.99")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @Schema(description = "Crossed-out 'was' price", example = "1199.99")
    private BigDecimal compareAtPrice;

    @Schema(description = "Internal cost price", example = "850.00")
    private BigDecimal costPrice;

    @Schema(description = "New status: ACTIVE | DRAFT | INACTIVE | ARCHIVED", example = "ACTIVE")
    private String status;

    @Schema(description = "Updated inventory quantity", example = "50")
    private Integer quantity;

    @Schema(description = "Low-stock alert threshold", example = "10")
    private Integer lowStockThreshold;

    @Schema(description = "Brand or manufacturer", example = "Apple")
    private String brand;

    @Schema(description = "Weight in grams", example = "221.0")
    private Double weightGrams;

    @Schema(description = "Category ID", example = "3")
    private Long categoryId;

    @Schema(description = "Mark as featured product", example = "true")
    private Boolean featured;

    @Schema(description = "Searchable tags", example = "[\"smartphone\", \"apple\", \"pro-max\"]")
    private Set<String> tags;

    @Schema(description = "Image URLs", example = "[\"https://cdn.example.com/iphone15-promax.jpg\"]")
    private Set<String> images;
}
