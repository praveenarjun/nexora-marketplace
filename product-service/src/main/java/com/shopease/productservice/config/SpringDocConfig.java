package com.shopease.productservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Configuration
public class SpringDocConfig {

    static {
        // Tell SpringDoc to replace Spring's Pageable with its own internal
        // representation.
        // This prevents it from trying to introspect the complex Pageable interface and
        // crashing.
        SpringDocUtils.getConfig().replaceWithClass(Pageable.class,
                org.springdoc.core.converters.models.Pageable.class);
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Product Catalog Microservice API")
                        .description(
                                "REST API for managing a product catalog with categories, inventory tracking, and stock alerts.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Praveen Challa")
                                .email("praveenarjun@example.com"))
                        .license(new License()
                                .name("MIT License")));
    }
}
