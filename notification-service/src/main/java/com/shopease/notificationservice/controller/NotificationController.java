package com.shopease.notificationservice.controller;

import com.shopease.notificationservice.dto.CartAbandonedEvent;
import com.shopease.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;

    @PostMapping("/abandoned-cart")
    public ResponseEntity<String> sendAbandonedCartEmail(@RequestBody CartAbandonedEvent event) {
        log.info("📧 Manual triggered abandoned cart email for: {}", event.getEmail());
        emailService.sendAbandonedCartEmail(event.getEmail(), event.getFirstName());
        return ResponseEntity.ok("Abandoned cart email sent successfully to " + event.getEmail());
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Notification service is up and running!");
    }
}
