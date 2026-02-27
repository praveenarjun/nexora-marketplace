package com.shopease.userservice.controller;

import com.shopease.userservice.dto.AuthResponse;
import com.shopease.userservice.dto.LoginRequest;
import com.shopease.userservice.dto.RegisterRequest;
import com.shopease.userservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody com.shopease.userservice.dto.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("If the email exists, an OTP has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody com.shopease.userservice.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password successfully reset. You can now login.");
    }
}
