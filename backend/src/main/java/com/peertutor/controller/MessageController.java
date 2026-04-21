package com.peertutor.controller;

import com.peertutor.dto.ConversationDto;
import com.peertutor.dto.MessageDto;
import com.peertutor.service.MessageService;
import com.peertutor.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // GET /api/messages/conversations — get all conversations for logged-in user
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(
            @RequestHeader("Authorization") String authHeader) {
        UUID userId = getUserIdFromHeader(authHeader);
        List<ConversationDto> conversations = messageService.getConversationsForUser(userId);
        return ResponseEntity.ok(conversations);
    }

    // GET /api/messages/conversations/{id} — get a conversation with messages
    @GetMapping("/conversations/{id}")
    public ResponseEntity<?> getConversation(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = getUserIdFromHeader(authHeader);
            ConversationDto conversation = messageService.getConversation(id, userId);
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // POST /api/messages/conversations/{id}/send — send a message
    @PostMapping("/conversations/{id}/send")
    public ResponseEntity<?> sendMessage(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {
        try {
            UUID senderId = getUserIdFromHeader(authHeader);
            String content = body.get("content");
            if (content == null || content.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Message content cannot be empty");
                return ResponseEntity.badRequest().body(error);
            }
            MessageDto message = messageService.sendMessage(id, senderId, content.trim());
            return new ResponseEntity<>(message, HttpStatus.CREATED);
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
