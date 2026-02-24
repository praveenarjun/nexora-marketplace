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

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

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
}
