package com.shopease.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.shopease.userservice.security.JwtAuthenticationFilter;
import com.shopease.userservice.security.OAuth2LoginSuccessHandler;
import com.shopease.userservice.security.OAuth2LoginFailureHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @org.springframework.beans.factory.annotation.Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
            OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
            OAuth2LoginFailureHandler oAuth2LoginFailureHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendRedirect(frontendUrl + "/login");
                        }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/users/internal/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler));

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
