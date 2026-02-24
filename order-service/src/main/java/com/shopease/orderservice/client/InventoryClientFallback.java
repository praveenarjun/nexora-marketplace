package com.shopease.orderservice.client;

import com.shopease.orderservice.dto.ReservationRequest;
import com.shopease.orderservice.dto.ReservationResponse;
import com.shopease.orderservice.dto.StockCheckRequest;
import com.shopease.orderservice.dto.StockCheckResponse;
import com.shopease.orderservice.exception.ServiceUnavailableException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InventoryClientFallback implements InventoryClient {

    @Override
    public List<StockCheckResponse> checkStock(List<StockCheckRequest> requests) {
        throw new ServiceUnavailableException("Inventory service is currently unavailable for stock checks.");
    }

    @Override
    public ReservationResponse reserveStock(ReservationRequest request) {
        throw new ServiceUnavailableException("Inventory service is currently unavailable for reservations.");
    }

    @Override
    public void releaseStock(Long productId, Integer quantity) {
        // Log locally or queue for later since service is down. For now, exception.
        throw new ServiceUnavailableException("Inventory service is currently unavailable for stock release.");
    }
}
