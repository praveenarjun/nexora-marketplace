package com.shopease.notificationservice.listener;

import com.shopease.notificationservice.config.RabbitMQConfig;
import com.shopease.notificationservice.dto.UserRegisteredEvent;
import com.shopease.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventListener {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.REGISTRATION_QUEUE)
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("📧 Welcome email triggered for user: {}", event.getEmail());
        emailService.sendWelcomeEmail(
                event.getEmail(),
                event.getFirstName());
    }

    @RabbitListener(queues = RabbitMQConfig.PASSWORD_RESET_QUEUE)
    public void handlePasswordReset(com.shopease.notificationservice.dto.PasswordResetEvent event) {
        log.info("🔑 Password reset OTP email triggered for user: {}", event.getEmail());
        emailService.sendPasswordResetOtpEmail(
                event.getEmail(),
                event.getOtp());
    }
}
