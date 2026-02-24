package com.shopease.productservice.repository.spec;

import com.shopease.productservice.domain.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterProducts(
            String search,
            Long categoryId,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String status,
            Boolean inStock,
            Boolean featured) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.toLowerCase() + "%";
                Predicate nameLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), searchLike);
                // COALESCE prevents NPE when description is NULL in the database
                Predicate descLike = criteriaBuilder.like(
                        criteriaBuilder.lower(
                                criteriaBuilder.coalesce(root.get("description"), "")),
                        searchLike);
                predicates.add(criteriaBuilder.or(nameLike, descLike));
            }

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            if (StringUtils.hasText(brand)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("brand")), brand.toLowerCase()));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (StringUtils.hasText(status)) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            } else {
                // Default to NOT ARCHIVED/DELETED if status not specified?
                // User requirement: "Get all products" usually implies active ones, but
                // "filter" might want specific status.
                // If status is not provided, we should probably exclude DELETED products at
                // least.
                // Let's assume standard behavior excludes DELETED.
                predicates.add(criteriaBuilder.notEqual(root.get("status"), "DELETED"));
                predicates.add(criteriaBuilder.notEqual(root.get("status"), "ARCHIVED"));
            }

            if (inStock != null && inStock) {
                predicates.add(criteriaBuilder.greaterThan(root.get("quantity"), 0));
            }

            if (featured != null) {
                predicates.add(criteriaBuilder.equal(root.get("featured"), featured));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
