package com.peertutor.controller;

import com.peertutor.dto.BookSessionRequest;
import com.peertutor.dto.SessionDto;
import com.peertutor.service.SessionService;
import com.peertutor.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // POST /api/sessions — student books a session
    @PostMapping
    public ResponseEntity<?> bookSession(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody BookSessionRequest request) {
        try {
            UUID studentId = getUserIdFromHeader(authHeader);
            SessionDto session = sessionService.bookSession(studentId, request);
            return new ResponseEntity<>(session, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // GET /api/sessions — get all sessions for the logged-in user
    @GetMapping
    public ResponseEntity<List<SessionDto>> getSessions(
            @RequestHeader("Authorization") String authHeader) {
        UUID userId = getUserIdFromHeader(authHeader);
        List<SessionDto> sessions = sessionService.getSessionsForUser(userId);
        return ResponseEntity.ok(sessions);
    }

    // GET /api/sessions/{id} — get a single session
    @GetMapping("/{id}")
    public ResponseEntity<?> getSession(@PathVariable UUID id) {
        return sessionService.getSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/sessions/{id}/confirm — tutor confirms a session
    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirmSession(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            UUID tutorId = getUserIdFromHeader(authHeader);
            SessionDto session = sessionService.confirmSession(id, tutorId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // POST /api/sessions/{id}/decline — tutor declines a session
    @PostMapping("/{id}/decline")
    public ResponseEntity<?> declineSession(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            UUID tutorId = getUserIdFromHeader(authHeader);
            SessionDto session = sessionService.declineSession(id, tutorId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private UUID getUserIdFromHeader(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
