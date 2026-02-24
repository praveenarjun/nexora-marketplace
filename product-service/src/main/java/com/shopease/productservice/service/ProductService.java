package com.shopease.productservice.service;

import com.shopease.productservice.web.dto.CreateProductRequest;
import com.shopease.productservice.web.dto.ProductDTO;
import com.shopease.productservice.web.dto.UpdateProductRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductDTO createProduct(CreateProductRequest request);

    ProductDTO updateProduct(Long id, UpdateProductRequest request);

    ProductDTO getProductById(Long id);

    ProductDTO getProductBySku(String sku);

    Page<ProductDTO> getAllProducts(Pageable pageable);

    Page<ProductDTO> searchProducts(String search, Long categoryId, String brand, java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice, String status, Boolean inStock, Boolean featured, Pageable pageable);

    void deleteProduct(Long id);

    Page<ProductDTO> getFeaturedProducts(Pageable pageable);

    Page<ProductDTO> getLowStockProducts(Pageable pageable);

    ProductDTO updateProductStatus(Long id, String status);
}
