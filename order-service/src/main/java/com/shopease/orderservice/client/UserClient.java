package com.shopease.orderservice.client;

import com.shopease.orderservice.dto.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${USER_SERVICE_URL:http://user-service:8081}")
public interface UserClient {

    @GetMapping("/api/users/internal/{userId}")
    UserProfileResponse getUserById(@PathVariable("userId") Long userId);
}
