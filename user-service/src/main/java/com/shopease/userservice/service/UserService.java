package com.shopease.userservice.service;

import com.shopease.userservice.domain.User;
import com.shopease.userservice.dto.UpdateProfileRequest;
import com.shopease.userservice.dto.UserProfileResponse;
import com.shopease.userservice.exception.UserNotFoundException;
import com.shopease.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId) {
        User user = getUserByIdOrThrow(userId);
        return mapToProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserByIdOrThrow(userId);

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        user = userRepository.save(user);
        log.info("User {} updated profile successfully", user.getEmail());

        return mapToProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getInternalUserById(Long userId) {
        User user = getUserByIdOrThrow(userId);
        return mapToProfileResponse(user);
    }

    private User getUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }
}
