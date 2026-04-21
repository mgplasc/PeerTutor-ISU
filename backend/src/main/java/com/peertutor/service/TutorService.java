package com.peertutor.service;

import com.peertutor.dto.TutorProfileDto;
import com.peertutor.model.TutorProfile;
import com.peertutor.repository.TutorProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TutorService {

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    /**
     * Returns all tutors, or filters by course number if one is provided.
     * The courseNumber param is matched case-insensitively as a substring
     * (e.g. "179" matches "IT 179").
     */
    @Transactional(readOnly = true)
    public List<TutorProfileDto> getTutors(
            String courseNumber,
            String sessionFormat,
            Double minRating,
            Double maxPrice,
            Boolean available) {

        List<TutorProfile> profiles;

        if (courseNumber == null || courseNumber.isBlank()) {
            profiles = tutorProfileRepository.findAll();
        } else {
            profiles = tutorProfileRepository.findByCourseNumberContainingIgnoreCase(courseNumber);
        }

        return profiles.stream()
                .filter(p -> {
                    if (available == null || !available) return true;
                    return Boolean.TRUE.equals(p.getAvailableForOnline())
                        || Boolean.TRUE.equals(p.getAvailableForInPerson());
                })
                .filter(p -> {
                    if (sessionFormat == null || sessionFormat.isBlank()) return true;
                    return switch (sessionFormat.toLowerCase()) {
                        case "online"   -> Boolean.TRUE.equals(p.getAvailableForOnline());
                        case "inperson" -> Boolean.TRUE.equals(p.getAvailableForInPerson());
                        case "both"     -> Boolean.TRUE.equals(p.getAvailableForOnline())
                                        && Boolean.TRUE.equals(p.getAvailableForInPerson());
                        default -> true;
                    };
                })
                .filter(p -> minRating == null
                        || (p.getRating() != null && p.getRating() >= minRating))
                .filter(p -> maxPrice == null
                        || (p.getHourlyRate() != null && p.getHourlyRate() <= maxPrice))
                .map(TutorProfileDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Returns a single tutor profile by its UUID.
     */
    @Transactional(readOnly = true)
    public Optional<TutorProfileDto> getTutorById(UUID id) {
        return tutorProfileRepository.findById(id)
                .map(TutorProfileDto::new);
    }
}
