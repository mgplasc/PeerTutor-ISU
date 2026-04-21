package com.peertutor.controller;

import com.peertutor.dto.TutorProfileDto;
import com.peertutor.service.TutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    @Autowired
    private TutorService tutorService;

    /**
     * GET /api/tutors
     * GET /api/tutors?courseNumber=IT179
     *
     * Returns all tutors, or only tutors who offer courses matching the given
     * courseNumber substring (case-insensitive).
     */
    @GetMapping
    public ResponseEntity<List<TutorProfileDto>> getTutors(
            @RequestParam(required = false) String courseNumber,
            @RequestParam(required = false) String sessionFormat,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean available) {
        List<TutorProfileDto> tutors = tutorService.getTutors(courseNumber, sessionFormat, minRating, maxPrice, available);
        return ResponseEntity.ok(tutors);
    }

    /**
     * GET /api/tutors/{id}
     *
     * Returns a single tutor profile by UUID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TutorProfileDto> getTutorById(@PathVariable UUID id) {
        Optional<TutorProfileDto> tutor = tutorService.getTutorById(id);
        return tutor.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }
}
