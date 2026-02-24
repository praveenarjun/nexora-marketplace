package com.shopease.userservice.controller;

import com.shopease.userservice.dto.UpdateProfileRequest;
import com.shopease.userservice.dto.UserProfileResponse;
import com.shopease.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @GetMapping("/internal/{userId}")
    public ResponseEntity<UserProfileResponse> getInternalUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getInternalUserById(userId));
    }
}
