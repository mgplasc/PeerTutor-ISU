package com.peertutor.controller;

import com.peertutor.service.UserService;
import com.peertutor.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class DeviceTokenController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/device-token")
    public ResponseEntity<?> registerDeviceToken(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> payload) {
        String token = authHeader.replace("Bearer ", "");
        UUID userId = jwtTokenProvider.getUserIdFromToken(token);
        String deviceToken = payload.get("deviceToken");
        userService.updateDeviceToken(userId, deviceToken);
        return ResponseEntity.ok().build();
    }
}