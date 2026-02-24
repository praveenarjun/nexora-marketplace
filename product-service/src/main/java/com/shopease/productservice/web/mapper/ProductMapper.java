package com.shopease.productservice.web.mapper;

import com.shopease.productservice.domain.Product;
import com.shopease.productservice.web.dto.CreateProductRequest;
import com.shopease.productservice.web.dto.ProductDTO;
import com.shopease.productservice.web.dto.UpdateProductRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    // Map entity's 'images' Set to DTO's 'imageUrls' List
    @Mapping(target = "imageUrls", source = "images")
    // Compute inStock: true if quantity > 0
    @Mapping(target = "inStock", expression = "java(product.getQuantity() != null && product.getQuantity() > 0)")
    // Compute lowStock: true if quantity <= lowStockThreshold (using default of 5
    // if null)
    @Mapping(target = "lowStock", expression = "java(product.getQuantity() != null && product.getQuantity() <= (product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 5))")
    ProductDTO toDTO(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true) // Handled in service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    Product toEntity(CreateProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sku", ignore = true) // SKU should not be updated
    @Mapping(target = "category", ignore = true) // Handled in service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateProductFromRequest(UpdateProductRequest request, @MappingTarget Product product);
}
