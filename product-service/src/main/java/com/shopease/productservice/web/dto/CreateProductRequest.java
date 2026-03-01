package com.shopease.productservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Schema(description = "Request body for creating a new product")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @Schema(description = "Unique product SKU code — must match PROD-### pattern", example = "PROD-001", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "SKU is required")
    @com.shopease.productservice.validation.ValidSKU
    private String sku;

    @Schema(description = "Product display name", example = "Apple iPhone 15 Pro", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Name is required")
    private String name;

    @Schema(description = "Full product description", example = "The most powerful iPhone ever with the A17 Pro chip.")
    private String description;

    @Schema(description = "Short one-line description for listings", example = "A17 Pro chip, titanium design, advanced cameras.")
    private String shortDescription;

    @Schema(description = "Selling price in USD", example = "999.99", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @Schema(description = "Crossed-out 'was' price shown beside the selling price", example = "1099.99")
    private BigDecimal compareAtPrice;

    @Schema(description = "Internal cost price (not shown to customers)", example = "750.00")
    private BigDecimal costPrice;

    @Schema(description = "Product status — one of: ACTIVE, DRAFT, INACTIVE, ARCHIVED", example = "ACTIVE", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Status is required")
    private String status;

    @Schema(description = "Current inventory quantity", example = "100")
    private Integer quantity;

    @Schema(description = "Quantity level below which the product is considered low-stock (default: 5)", example = "10")
    private Integer lowStockThreshold;

    @Schema(description = "Brand or manufacturer name", example = "Apple")
    private String brand;

    @Schema(description = "Product weight in grams", example = "187.0")
    private Double weightGrams;

    @Schema(description = "ID of the category this product belongs to", example = "3")
    private Long categoryId;

    @Schema(description = "Whether the product should appear in the featured section", example = "false")
    private boolean featured;

    @Schema(description = "Promotional badge text", example = "NEW")
    private String badge;

    @Schema(description = "Average customer rating", example = "4.5")
    private Double rating;

    @Schema(description = "Total number of reviews", example = "120")
    private Integer reviewsCount;

    @Schema(description = "Key product feature highlights", example = "[\"Highlight 1\", \"Highlight 2\"]")
    private Set<String> highlights;

    @Schema(description = "Set of searchable tags for the product", example = "[\"smartphone\", \"apple\", \"5g\"]")
    private Set<String> tags;

    @Schema(description = "Set of image URLs for the product", example = "[\"https://cdn.example.com/iphone15-front.jpg\"]")
    private Set<String> images;
}
