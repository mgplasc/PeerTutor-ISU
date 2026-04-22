package com.peertutor.controller;

import com.peertutor.dto.FeedbackRequest;
import com.peertutor.service.FeedbackService;
import com.peertutor.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/session/{sessionId}")
    public ResponseEntity<?> submitFeedback(
            @PathVariable UUID sessionId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody FeedbackRequest request) {
        try {
            UUID studentId = getUserIdFromHeader(authHeader);
            feedbackService.submitFeedback(sessionId, studentId, request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private UUID getUserIdFromHeader(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}