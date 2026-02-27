package com.shopease.userservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisteredEvent {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDateTime timestamp;
}
