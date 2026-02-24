package com.shopease.orderservice.domain;

public enum OrderStatus {
    CREATED,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    public boolean isCancellable() {
        return this == CREATED || this == CONFIRMED;
    }
}
