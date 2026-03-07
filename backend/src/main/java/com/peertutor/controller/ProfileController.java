// Profile controller to handle profile-related endpoints for both students and tutors
package com.peertutor.controller;

import com.peertutor.dto.*;
import com.peertutor.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProfiles(@PathVariable UUID userId) {
        try {
            ProfileResponse response = profileService.getUserProfiles(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/student/{userId}")
    public ResponseEntity<?> updateStudentProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody StudentProfileUpdateRequest request) {
        try {
            ProfileResponse.StudentProfileDto updated = 
                profileService.updateStudentProfile(userId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/tutor/{userId}")
    public ResponseEntity<?> updateTutorProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody TutorProfileUpdateRequest request) {
        try {
            ProfileResponse.TutorProfileDto updated = 
                profileService.updateTutorProfile(userId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/student/{userId}")
    public ResponseEntity<?> createStudentProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody StudentProfileUpdateRequest request) {
        try {
            ProfileResponse.StudentProfileDto created = 
                profileService.createStudentProfile(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

@PostMapping("/tutor/{userId}")
    public ResponseEntity<?> createTutorProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody TutorProfileUpdateRequest request) {
        try {
            ProfileResponse.TutorProfileDto created = 
                profileService.createTutorProfile(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}