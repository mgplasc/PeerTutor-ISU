package com.peertutor.controller;

import com.peertutor.dto.AvailabilitySlotDto;
import com.peertutor.service.TutorAvailabilityService;
import com.peertutor.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/availability")
public class TutorAvailabilityController {

    @Autowired
    private TutorAvailabilityService availabilityService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/slots")
    public ResponseEntity<?> addSlot(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> payload) {
        try {
            UUID tutorId = getUserIdFromHeader(authHeader);
            LocalDate date = LocalDate.parse(payload.get("date"));
            LocalTime startTime = LocalTime.parse(payload.get("startTime"));
            LocalTime endTime = LocalTime.parse(payload.get("endTime"));
            AvailabilitySlotDto slot = availabilityService.addAvailabilitySlot(tutorId, date, startTime, endTime);
            return ResponseEntity.ok(slot);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/slots")
    public ResponseEntity<?> getSlots(@RequestHeader("Authorization") String authHeader) {
        try {
            UUID tutorId = getUserIdFromHeader(authHeader);
            List<AvailabilitySlotDto> slots = availabilityService.getAvailableSlotsForTutor(tutorId);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<?> deleteSlot(
            @PathVariable UUID slotId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            UUID tutorId = getUserIdFromHeader(authHeader);
            availabilityService.deleteAvailabilitySlot(slotId, tutorId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private UUID getUserIdFromHeader(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<?> getTutorSlotsByDate(
            @PathVariable UUID tutorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<AvailabilitySlotDto> slots = availabilityService.getAvailableSlotsForTutorOnDate(tutorId, date);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}