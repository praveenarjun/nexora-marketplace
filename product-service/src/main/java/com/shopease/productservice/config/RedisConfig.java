package com.shopease.productservice.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class RedisConfig {
    // Default configuration provided by Spring Boot is sufficient for basic use
    // cases.
    // Can be customized here if needed (e.g., TTL).
}
