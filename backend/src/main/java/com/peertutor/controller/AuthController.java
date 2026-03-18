package com.peertutor.controller;

import com.peertutor.dto.*;
import com.peertutor.service.UserService;
import com.peertutor.exception.UserRegistrationException;
import com.peertutor.exception.InvalidCredentialsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/auth")  //Make sure it matches the frontend endpoint
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup") 
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            SignupResponse response = userService.signup(signupRequest);
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = userService.login(
                loginRequest.getEmail(), 
                loginRequest.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (InvalidCredentialsException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        boolean exists = userService.checkEmailExists(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", !exists);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = userService.verifyEmail(token);
            if (verified) {
                return ResponseEntity.ok("Email verified successfully! You can now log in.");
            } else {
                return ResponseEntity.badRequest().body("Invalid or expired verification token.");
            }    
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}