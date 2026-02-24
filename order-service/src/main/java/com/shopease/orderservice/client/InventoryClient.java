package com.shopease.orderservice.client;

import com.shopease.orderservice.dto.ReservationRequest;
import com.shopease.orderservice.dto.ReservationResponse;
import com.shopease.orderservice.dto.StockCheckRequest;
import com.shopease.orderservice.dto.StockCheckResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "inventory-service", fallback = InventoryClientFallback.class)
public interface InventoryClient {

    @PostMapping("/api/inventory/check")
    List<StockCheckResponse> checkStock(@RequestBody List<StockCheckRequest> requests);

    @PostMapping("/api/inventory/reserve")
    ReservationResponse reserveStock(@RequestBody ReservationRequest request);

    @PostMapping("/api/inventory/release")
    void releaseStock(@RequestParam("productId") Long productId, @RequestParam("quantity") Integer quantity);
}
