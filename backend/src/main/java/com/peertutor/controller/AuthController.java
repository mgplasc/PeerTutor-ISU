//Controller for handling authentication-related endpoints such as user registration and email verification.
package com.peertutor.controller;

import com.peertutor.dto.AddProfileRequest;
import com.peertutor.dto.ProfileResponse;
import com.peertutor.dto.SignupRequest;
import com.peertutor.dto.SignupResponse;
import com.peertutor.service.AuthService;
import com.peertutor.exception.UserRegistrationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;  

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup") 
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            SignupResponse response = authService.registerUser(signupRequest);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (UserRegistrationException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "An unexpected error occurred");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        boolean exists = authService.checkEmailExists(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", !exists);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = authService.verifyEmail(token);
            if(verified)
            {
                return ResponseEntity.ok("Email verified successfully! You can now log in.");
            }
            else
            {
                return ResponseEntity.badRequest().body("Invalid or expired verification token.");
            }    
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/add-profile")
    public ResponseEntity<?> addProfile(
            @RequestParam UUID userId, 
            @Valid @RequestBody AddProfileRequest request) {
        try {
            ProfileResponse response = authService.addUserProfile(userId, request);
            return ResponseEntity.ok(response);
        } catch (UserRegistrationException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}