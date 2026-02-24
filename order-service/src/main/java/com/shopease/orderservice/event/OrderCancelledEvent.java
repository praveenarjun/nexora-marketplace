package com.shopease.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderCancelledEvent {
    private String orderNumber;
    private Long userId;
    private LocalDateTime timestamp;
}
