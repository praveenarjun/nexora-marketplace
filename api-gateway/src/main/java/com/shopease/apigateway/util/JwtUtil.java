package com.shopease.apigateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class JwtUtil {

    @Value("${jwt.secret:my-very-long-and-secure-jwt-secret-key-that-is-at-least-512-bits-long-so-it-works-with-shopease-microservices}")
    private String secret;

    private SecretKey getSignKey() {
        byte[] keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public void validateToken(final String token) {
        Jwts.parser().verifyWith(getSignKey()).build().parseSignedClaims(token);
    }

    public Claims getClaims(final String token) {
        return Jwts.parser().verifyWith(getSignKey()).build().parseSignedClaims(token).getPayload();
    }
}
