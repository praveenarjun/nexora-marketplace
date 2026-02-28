package com.shopease.userservice.security;

import com.shopease.userservice.domain.Role;
import com.shopease.userservice.domain.User;
import com.shopease.userservice.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import com.shopease.userservice.event.UserRegisteredEvent;
import com.shopease.userservice.publisher.UserEventPublisher;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final UserEventPublisher userEventPublisher;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            // GitHub might not return email if it's private, or might return it
            // differently.
            // Simplified handling for demonstration purposes.
            String login = oAuth2User.getAttribute("login");
            email = login + "@github.com";
        }

        String name = oAuth2User.getAttribute("name");
        if (name == null) {
            name = "OAuth User";
        }

        String[] nameParts = name.split(" ", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        // Check if user exists
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            log.info("Existing user logged in via OAuth2: {}", email);
        } else {
            // Register new user
            user = User.builder()
                    .email(email)
                    .password(UUID.randomUUID().toString()) // Dummy complex password
                    .firstName(firstName)
                    .lastName(lastName)
                    .address("Not Provided") // Default address for OAuth users
                    .role(Role.CUSTOMER)
                    .build();
            user = userRepository.save(user);
            log.info("New user registered via OAuth2: {}", email);

            // Publish event for welcome email
            userEventPublisher.publishUserRegisteredEvent(UserRegisteredEvent.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .timestamp(LocalDateTime.now())
                    .build());
        }

        // Generate JWT token
        String token = jwtProvider.generateToken(user);

        // Include user details in the redirect for the frontend to ingest easily
        // In a strictly secure app, you might just send the token and have the frontend
        // fetch /api/users/me
        String redirectUrl = frontendUrl + "/login/oauth2-success?token=" + token +
                "&email=" + user.getEmail() +
                "&firstName=" + user.getFirstName() +
                "&lastName=" + user.getLastName() +
                "&role=" + user.getRole().name() +
                "&userId=" + user.getId();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
