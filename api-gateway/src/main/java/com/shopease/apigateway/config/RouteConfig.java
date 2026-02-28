package com.shopease.apigateway.config;

import com.shopease.apigateway.filter.AuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

@Configuration
public class RouteConfig {

        private final AuthenticationFilter authFilter;

        public RouteConfig(AuthenticationFilter authFilter) {
                this.authFilter = authFilter;
        }

        @Bean
        public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
                return builder.routes()
                                // --- PUBLIC ROUTES (No Auth Required) ---
                                .route("auth-service-public", r -> r
                                                .path("/api/auth/**")
                                                .uri("lb://user-service"))
                                .route("oauth2-auth-public", r -> r
                                                .path("/oauth2/**")
                                                .uri("lb://user-service"))
                                .route("oauth2-login-public", r -> r
                                                .path("/login/oauth2/**")
                                                .uri("lb://user-service"))
                                .route("product-service-public-get", r -> r
                                                .method(HttpMethod.GET)
                                                .and()
                                                .path("/api/products/**")
                                                .filters(f -> f.rewritePath("/api/products(?<segment>.*)",
                                                                "/api/v1/products${segment}"))
                                                .uri("lb://product-service"))
                                .route("category-service-public-get", r -> r
                                                .method(HttpMethod.GET)
                                                .and()
                                                .path("/api/categories/**")
                                                .filters(f -> f.rewritePath("/api/categories(?<segment>.*)",
                                                                "/api/v1/categories${segment}"))
                                                .uri("lb://product-service"))

                                // --- PROTECTED ROUTES (Auth Required) ---
                                .route("product-service-protected", r -> r
                                                .method(HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH,
                                                                HttpMethod.DELETE)
                                                .and()
                                                .path("/api/products/**")
                                                .filters(f -> f
                                                                .rewritePath("/api/products(?<segment>.*)",
                                                                                "/api/v1/products${segment}")
                                                                .filter(authFilter.apply(
                                                                                new AuthenticationFilter.Config())))
                                                .uri("lb://product-service"))
                                .route("category-service-protected", r -> r
                                                .method(HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH,
                                                                HttpMethod.DELETE)
                                                .and()
                                                .path("/api/categories/**")
                                                .filters(f -> f
                                                                .rewritePath("/api/categories(?<segment>.*)",
                                                                                "/api/v1/categories${segment}")
                                                                .filter(authFilter.apply(
                                                                                new AuthenticationFilter.Config())))
                                                .uri("lb://product-service"))

                                .route("order-service-protected", r -> r
                                                .path("/api/orders/**")
                                                .filters(f -> f
                                                                .filter(authFilter.apply(
                                                                                new AuthenticationFilter.Config()))
                                                                .circuitBreaker(c -> c.setName("orderServiceCB")
                                                                                .setFallbackUri("forward:/fallback/order")))
                                                .uri("lb://order-service"))

                                .route("user-service-protected", r -> r
                                                .path("/api/users/**")
                                                .filters(f -> f.filter(
                                                                authFilter.apply(new AuthenticationFilter.Config())))
                                                .uri("lb://user-service"))

                                .route("inventory-service-protected", r -> r
                                                .path("/api/inventory/**")
                                                .filters(f -> f.filter(
                                                                authFilter.apply(new AuthenticationFilter.Config())))
                                                .uri("lb://inventory-service"))

                                .build();
        }
}
