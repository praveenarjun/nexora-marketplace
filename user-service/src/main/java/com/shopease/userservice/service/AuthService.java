package com.shopease.userservice.service;

import com.shopease.userservice.domain.Role;
import com.shopease.userservice.domain.User;
import com.shopease.userservice.dto.AuthResponse;
import com.shopease.userservice.dto.LoginRequest;
import com.shopease.userservice.dto.RegisterRequest;
import com.shopease.userservice.exception.DuplicateEmailException;
import com.shopease.userservice.exception.InvalidCredentialsException;
import com.shopease.userservice.repository.UserRepository;
import com.shopease.userservice.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;

import com.shopease.userservice.event.UserRegisteredEvent;
import com.shopease.userservice.publisher.UserEventPublisher;
import com.shopease.userservice.dto.ForgotPasswordRequest;
import com.shopease.userservice.dto.ResetPasswordRequest;
import com.shopease.userservice.event.PasswordResetEvent;
import com.shopease.userservice.dto.ResetPasswordRequest;
import com.shopease.userservice.event.PasswordResetEvent;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final UserEventPublisher userEventPublisher;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email " + request.getEmail() + " is already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.CUSTOMER) // Default role for open registration
                .build();

        user = userRepository.save(user);
        log.info("New user registered successfully: {}", user.getEmail());

        // Publish event for welcome email
        userEventPublisher.publishUserRegisteredEvent(UserRegisteredEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .timestamp(LocalDateTime.now())
                .build());

        String token = jwtProvider.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtProvider.generateToken(user);
        log.info("User {} logged in successfully", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("User not found")); // For security, a real app might
                                                                                       // just return success and not
                                                                                       // leak email existence.

        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
        user.setOtpCode(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        userEventPublisher.publishPasswordResetEvent(PasswordResetEvent.builder()
                .email(user.getEmail())
                .otp(otp)
                .timestamp(LocalDateTime.now())
                .build());

        log.info("Forgot password OTP generated for user: {}", user.getEmail());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or OTP"));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())
                || user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);

        log.info("Password successfully reset for user: {}", user.getEmail());
    }
}
