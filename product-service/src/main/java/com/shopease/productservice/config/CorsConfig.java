package com.shopease.productservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    // Default origins for local dev + prod; override via app.cors.allowed-origins
    // env var
    @Value("${app.cors.allowed-origins:https://product-catalog-ui.pages.dev,https://catalog.praveen-challa.tech}")
    private List<String> allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // SECURITY FIX: Never fall back to wildcard (*). Use explicit list only.
        // If allowedOrigins is somehow empty, the filter allows nothing (safe default).
        config.setAllowedOriginPatterns(allowedOrigins);

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // ← all paths

        return new CorsFilter(source);
    }
}
