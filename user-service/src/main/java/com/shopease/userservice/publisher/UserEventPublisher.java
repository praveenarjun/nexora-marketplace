package com.shopease.userservice.publisher;

import com.shopease.userservice.config.RabbitMQConfig;
import com.shopease.userservice.event.PasswordResetEvent;
import com.shopease.userservice.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserRegisteredEvent(UserRegisteredEvent event) {
        try {
            log.info("Publishing User Registered Event for user: {}", event.getEmail());
            // Routing key prefix 'user.' matches the topic binding 'user.*'
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "user.registered", event);
            log.info("✅ user.registered event published for user: {}", event.getEmail());
        } catch (AmqpException e) {
            // Best-effort — user is saved to DB. Notification won't fire but registration
            // succeeds.
            log.error("⚠️ Failed to publish user.registered event for {}", event.getEmail(), e);
        }
    }

    public void publishPasswordResetEvent(PasswordResetEvent event) {
        try {
            log.info("Publishing Password Reset Event for user: {}", event.getEmail());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "user.passwordreset", event);
            log.info("✅ user.passwordreset event published for user: {}", event.getEmail());
        } catch (AmqpException e) {
            log.error("⚠️ Failed to publish user.passwordreset event for {}", event.getEmail(), e);
        }
    }
}
