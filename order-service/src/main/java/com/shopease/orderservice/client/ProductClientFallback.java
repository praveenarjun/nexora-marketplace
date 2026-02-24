package com.shopease.orderservice.client;

import com.shopease.orderservice.dto.ProductResponse;
import com.shopease.orderservice.dto.ApiResponse;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public ApiResponse<ProductResponse> getProductById(Long id) {
        ProductResponse fallbackResponse = ProductResponse.builder()
                .id(id)
                .name("Unavailable")
                .description("Product information is currently unavailable")
                .price(BigDecimal.ZERO)
                .build();

        return ApiResponse.<ProductResponse>builder()
                .success(false)
                .message("Fallback product response")
                .data(fallbackResponse)
                .build();
    }
}
