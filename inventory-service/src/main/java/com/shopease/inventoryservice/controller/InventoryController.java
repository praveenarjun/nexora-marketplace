package com.shopease.inventoryservice.controller;

import com.shopease.inventoryservice.dto.*;
import com.shopease.inventoryservice.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/check")
    public ResponseEntity<List<StockCheckResponse>> checkStock(@Valid @RequestBody List<StockCheckRequest> requests) {
        return ResponseEntity.ok(inventoryService.checkStock(requests));
    }

    @PostMapping("/reserve")
    public ResponseEntity<ReservationResponse> reserveStock(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(inventoryService.reserveStock(request));
    }

    @PostMapping("/release")
    public ResponseEntity<Void> releaseStock(@RequestParam("productId") Long productId, @RequestParam("quantity") Integer quantity) {
        inventoryService.releaseStock(productId, quantity);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmDeduction(@RequestParam("productId") Long productId, @RequestParam("quantity") Integer quantity) {
        inventoryService.confirmDeduction(productId, quantity);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/restock")
    public ResponseEntity<Void> restock(@RequestParam("productId") Long productId, @RequestParam("quantity") Integer quantity) {
        inventoryService.restock(productId, quantity);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable("productId") Long productId) {
        return ResponseEntity.ok(inventoryService.getInventory(productId));
    }
}
