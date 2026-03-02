package com.shopease.productservice.repository;

import com.shopease.productservice.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.lang.NonNull;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<Product> {
    @Override
    @NonNull
    @EntityGraph(attributePaths = { "category", "images", "highlights", "tags" })
    Page<Product> findAll(@NonNull org.springframework.data.jpa.domain.Specification<Product> spec,
            @NonNull Pageable pageable);

    @Override
    @NonNull
    @EntityGraph(attributePaths = { "category", "images", "highlights", "tags" })
    Page<Product> findAll(@NonNull Pageable pageable);

    @EntityGraph(attributePaths = { "category", "images", "highlights", "tags" })
    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    long countByCategoryId(Long categoryId);

    @EntityGraph(attributePaths = { "category", "images", "highlights", "tags" })
    Page<Product> findByFeaturedTrue(Pageable pageable);

    @EntityGraph(attributePaths = { "category", "images", "highlights", "tags" })
    @Query("SELECT p FROM Product p WHERE p.quantity <= COALESCE(p.lowStockThreshold, 5)")
    Page<Product> findLowStockProducts(Pageable pageable);
}
