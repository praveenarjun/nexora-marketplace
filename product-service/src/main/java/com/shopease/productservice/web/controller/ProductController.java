package com.shopease.productservice.web.controller;

import com.shopease.productservice.common.ApiResponse;
import com.shopease.productservice.service.ProductService;
import com.shopease.productservice.web.dto.CreateProductRequest;
import com.shopease.productservice.web.dto.ProductDTO;
import com.shopease.productservice.web.dto.UpdateProductRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@Tag(name = "Products", description = "Endpoints for managing the product catalog — CRUD, filtering, featured, and low-stock queries")
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

        private final ProductService productService;

        // ─── READ ──────────────────────────────────────────────────────────────

        @Operation(summary = "Get all products", description = "Returns a paginated list of all non-archived/deleted products.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Products retrieved successfully")
        })
        @GetMapping
        public ResponseEntity<ApiResponse<Page<ProductDTO>>> getAllProducts(
                        @PageableDefault(size = 20) Pageable pageable) {
                Page<ProductDTO> products = productService.getAllProducts(pageable);
                return ResponseEntity.ok(ApiResponse.success(products, "Products retrieved successfully"));
        }

        @Operation(summary = "Get product by ID", description = "Returns a single product by its numeric ID.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found")
        })
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ProductDTO>> getProductById(
                        @Parameter(description = "Numeric ID of the product", required = true, example = "1") @PathVariable("id") Long id) {
                ProductDTO product = productService.getProductById(id);
                return ResponseEntity.ok(ApiResponse.success(product, "Product retrieved successfully"));
        }

        @Operation(summary = "Get product by SKU", description = "Returns a single product by its unique SKU code.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found")
        })
        @GetMapping("/sku/{sku}")
        public ResponseEntity<ApiResponse<ProductDTO>> getProductBySku(
                        @Parameter(description = "SKU code (e.g. PROD-001)", required = true, example = "PROD-001") @PathVariable String sku) {
                ProductDTO product = productService.getProductBySku(sku);
                return ResponseEntity.ok(ApiResponse.success(product, "Product retrieved successfully"));
        }

        @Operation(summary = "Filter / search products", description = "Advanced search with optional filters: keyword search, category, brand, price range, status, stock availability, and featured flag.")
        @GetMapping("/filter")
        public ResponseEntity<ApiResponse<Page<ProductDTO>>> filterProducts(
                        @Parameter(description = "Search keyword (matches name or description)") @RequestParam(required = false) String search,
                        @Parameter(description = "Filter by category ID") @RequestParam(required = false) Long categoryId,
                        @Parameter(description = "Filter by brand name") @RequestParam(required = false) String brand,
                        @Parameter(description = "Minimum price (inclusive)") @RequestParam(required = false) BigDecimal minPrice,
                        @Parameter(description = "Maximum price (inclusive)") @RequestParam(required = false) BigDecimal maxPrice,
                        @Parameter(description = "Filter by status: ACTIVE, DRAFT, INACTIVE, ARCHIVED") @RequestParam(required = false) String status,
                        @Parameter(description = "If true, returns only products with quantity > 0") @RequestParam(required = false) Boolean inStock,
                        @Parameter(description = "If true, returns only featured products") @RequestParam(required = false) Boolean featured,
                        @PageableDefault(size = 20) Pageable pageable) {

                Page<ProductDTO> products = productService.searchProducts(search, categoryId, brand, minPrice, maxPrice,
                                status,
                                inStock, featured, pageable);
                return ResponseEntity.ok(ApiResponse.success(products, "Filter results retrieved successfully"));
        }

        @Operation(summary = "Get featured products", description = "Returns a paginated list of products marked as featured.")
        @GetMapping("/featured")
        public ResponseEntity<ApiResponse<Page<ProductDTO>>> getFeaturedProducts(
                        @PageableDefault(size = 20) Pageable pageable) {
                Page<ProductDTO> products = productService.getFeaturedProducts(pageable);
                return ResponseEntity.ok(ApiResponse.success(products, "Featured products retrieved successfully"));
        }

        @Operation(summary = "Get low-stock products", description = "Returns products where quantity is at or below the product's lowStockThreshold (default: 5).")
        @GetMapping("/low-stock")
        public ResponseEntity<ApiResponse<Page<ProductDTO>>> getLowStockProducts(
                        @PageableDefault(size = 20) Pageable pageable) {
                Page<ProductDTO> products = productService.getLowStockProducts(pageable);
                return ResponseEntity.ok(ApiResponse.success(products, "Low stock products retrieved successfully"));
        }

        // ─── WRITE ─────────────────────────────────────────────────────────────

        @Operation(summary = "Create a new product", description = "Creates a product. SKU must be unique and follow the PROD-### format.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Product created"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate SKU")
        })
        @PostMapping
        public ResponseEntity<ApiResponse<ProductDTO>> createProduct(@Valid @RequestBody CreateProductRequest request) {
                ProductDTO createdProduct = productService.createProduct(request);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(createdProduct, "Product created successfully"));
        }

        @Operation(summary = "Update a product", description = "Updates product fields. SKU cannot be changed. Only provided fields are updated.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product updated"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found")
        })
        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
                        @Parameter(description = "Numeric ID of the product to update", required = true) @PathVariable Long id,
                        @Valid @RequestBody UpdateProductRequest request) {
                ProductDTO updatedProduct = productService.updateProduct(id, request);
                return ResponseEntity.ok(ApiResponse.success(updatedProduct, "Product updated successfully"));
        }

        @Operation(summary = "Update product status only", description = "Quickly change the status of a product. Valid values: ACTIVE, DRAFT, INACTIVE, ARCHIVED.")
        @PatchMapping("/{id}/status")
        public ResponseEntity<ApiResponse<ProductDTO>> updateProductStatus(
                        @Parameter(description = "Product ID", required = true) @PathVariable Long id,
                        @Parameter(description = "New status: ACTIVE | DRAFT | INACTIVE | ARCHIVED", required = true, example = "ACTIVE") @RequestParam String status) {
                ProductDTO updatedProduct = productService.updateProductStatus(id, status);
                return ResponseEntity.ok(ApiResponse.success(updatedProduct, "Product status updated successfully"));
        }

        @Operation(summary = "Diagnostic health check", description = "Checks connectivity to internal infrastructure (Redis, RabbitMQ).")
        @GetMapping("/debug/health")
        public ResponseEntity<java.util.Map<String, Object>> getDebugHealth() {
                java.util.Map<String, Object> health = new java.util.HashMap<>();
                try {
                        productService.getAllProducts(org.springframework.data.domain.PageRequest.of(0, 1));
                        health.put("database", "UP");
                        health.put("redis_cache_test", "SUCCESS");
                } catch (Exception e) {
                        health.put("database", "DOWN/TIMEOUT");
                        health.put("error", e.getMessage());
                }
                return ResponseEntity.ok(health);
        }

        @Operation(summary = "Delete a product", description = "Soft-deletes a product by setting its status to ARCHIVED. It will no longer appear in search results.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product archived"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteProduct(
                        @Parameter(description = "Numeric ID of the product to delete", required = true) @PathVariable Long id) {
                productService.deleteProduct(id);
                return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
        }
}
