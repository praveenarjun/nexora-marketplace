package com.shopease.productservice.service.impl;

import com.shopease.productservice.domain.Category;
import com.shopease.productservice.domain.Product;
import com.shopease.productservice.exception.DuplicateResourceException;
import com.shopease.productservice.exception.ResourceNotFoundException;
import com.shopease.productservice.publisher.ProductEventPublisher;
import com.shopease.productservice.repository.CategoryRepository;
import com.shopease.productservice.repository.ProductRepository;
import com.shopease.productservice.service.ProductService;
import com.shopease.productservice.web.dto.CreateProductRequest;
import com.shopease.productservice.web.dto.ProductDTO;
import com.shopease.productservice.web.dto.UpdateProductRequest;
import com.shopease.productservice.web.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final ProductEventPublisher eventPublisher;

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = { "products", "productBySku", "productCatalog" }, allEntries = true)
    public ProductDTO createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product with SKU " + request.getSku() + " already exists");
        }

        Product product = productMapper.toEntity(request);

        // Apply default lowStockThreshold if not provided
        if (product.getLowStockThreshold() == null) {
            product.setLowStockThreshold(5);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        Product savedProduct = productRepository.save(product);
        eventPublisher.publishProductCreated(savedProduct.getId(), savedProduct.getName(), savedProduct.getPrice());
        return productMapper.toDTO(savedProduct);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = { "products", "productBySku", "productCatalog" }, allEntries = true)
    public ProductDTO updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Update fields
        productMapper.updateProductFromRequest(request, product);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        Product updatedProduct = productRepository.save(product);
        eventPublisher.publishProductUpdated(updatedProduct.getId(), updatedProduct.getName(),
                updatedProduct.getPrice());
        return productMapper.toDTO(updatedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "products", key = "#id")
    @io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker(name = "redisCircuitBreaker", fallbackMethod = "getProductByIdFallback")
    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public ProductDTO getProductByIdFallback(Long id, Throwable t) {
        // Fallback method when Redis is down
        return productRepository.findById(id)
                .map(productMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "productBySku", key = "#sku")
    @io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker(name = "redisCircuitBreaker", fallbackMethod = "getProductBySkuFallback")
    public ProductDTO getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .map(productMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
    }

    public ProductDTO getProductBySkuFallback(String sku, Throwable t) {
        // Fallback method when Redis is down
        return productRepository.findBySku(sku)
                .map(productMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
    }

    @Override
    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "productCatalog")
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(productMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "productCatalog")
    public Page<ProductDTO> searchProducts(String search, Long categoryId, String brand, java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice, String status, Boolean inStock, Boolean featured, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Product> spec = com.shopease.productservice.repository.spec.ProductSpecification
                .filterProducts(search, categoryId, brand, minPrice, maxPrice, status, inStock, featured);
        return productRepository.findAll(spec, pageable)
                .map(productMapper::toDTO);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = { "products", "productBySku", "productCatalog" }, allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Soft-delete: set status to ARCHIVED so it is excluded from all filter
        // queries.
        // ProductSpecification already filters out ARCHIVED and DELETED products.
        product.setStatus("ARCHIVED");
        productRepository.save(product);
        eventPublisher.publishProductDeleted(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getFeaturedProducts(Pageable pageable) {
        return productRepository.findByFeaturedTrue(pageable)
                .map(productMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getLowStockProducts(Pageable pageable) {
        return productRepository.findLowStockProducts(pageable)
                .map(productMapper::toDTO);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = { "products", "productBySku", "productCatalog" }, allEntries = true)
    public ProductDTO updateProductStatus(Long id, String status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setStatus(status);
        Product savedProduct = productRepository.save(product);
        return productMapper.toDTO(savedProduct);
    }
}
