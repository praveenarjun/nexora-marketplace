package com.shopease.productservice.repository;

import com.shopease.productservice.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<Product> {
    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    long countByCategoryId(Long categoryId);

    Page<Product> findByFeaturedTrue(Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.quantity <= COALESCE(p.lowStockThreshold, 5)")
    Page<Product> findLowStockProducts(Pageable pageable);
}
