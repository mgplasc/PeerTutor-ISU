package com.peertutor.service;

import com.peertutor.dto.*;
import com.peertutor.dto.StudentProfileUpdateRequest;
import com.peertutor.dto.TutorProfileUpdateRequest;
import com.peertutor.model.*;
import com.peertutor.repository.UserRepository;
import com.peertutor.repository.StudentProfileRepository;
import com.peertutor.repository.TutorProfileRepository;
import com.peertutor.exception.UserNotFoundException; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    /**
     * Get both profiles for a user
     */
    @Transactional(readOnly = true)
    public ProfileResponse getUserProfiles(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setStudentProfileExists(user.hasStudentProfile());
        response.setTutorProfileExists(user.hasTutorProfile());

        if (user.hasStudentProfile()) {
            response.setStudentProfile(mapToStudentProfileDto(user.getStudentProfile()));
        }

        if (user.hasTutorProfile()) {
            response.setTutorProfile(mapToTutorProfileDto(user.getTutorProfile()));
        }

        return response;
    }

    /**
     * Update student profile
     */
    @Transactional
    public ProfileResponse.StudentProfileDto updateStudentProfile(UUID userId, StudentProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (!user.hasStudentProfile()) {
            throw new IllegalStateException("User does not have a student profile");
        }

        StudentProfile profile = user.getStudentProfile();

        // Update fields only if they are provided in the request
        if (request.getFirstName() != null) {
            profile.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }

        if (request.getMajor() != null) {
            profile.setMajor(request.getMajor());
        }

        if (request.getExpectedGraduation() != null) {
            profile.setExpectedGraduation(request.getExpectedGraduation());
        }

        if (request.getProfilePhotoUrl() != null) {
            profile.setProfilePhotoUrl(request.getProfilePhotoUrl());
        }

        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        StudentProfile savedProfile = studentProfileRepository.save(profile);
        return mapToStudentProfileDto(savedProfile);
    }

    /**
     * Update tutor profile
     */
    @Transactional
    public ProfileResponse.TutorProfileDto updateTutorProfile(UUID userId, TutorProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (!user.hasTutorProfile()) {
            throw new IllegalStateException("User does not have a tutor profile");
        }

        TutorProfile profile = user.getTutorProfile();

        // Update fields only if they are provided in the request
        if (request.getFirstName() != null) {
            profile.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }

        if (request.getMajor() != null) {
            profile.setMajor(request.getMajor());
        }

        if (request.getHourlyRate() != null) {
            profile.setHourlyRate(request.getHourlyRate());
        }

        if (request.getProfilePhotoUrl() != null) {
            profile.setProfilePhotoUrl(request.getProfilePhotoUrl());
        }

        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        if (request.getAvailableForOnline() != null) {
            profile.setAvailableForOnline(request.getAvailableForOnline());
        }

        if (request.getAvailableForInPerson() != null) {
            profile.setAvailableForInPerson(request.getAvailableForInPerson());
        }

        if (request.getCoursesOffered() != null) {
            profile.setCoursesOffered(request.getCoursesOffered());
        }

        TutorProfile savedProfile = tutorProfileRepository.save(profile);
        return mapToTutorProfileDto(savedProfile);
    }

    /**
     * Create a student profile for an existing user (when a tutor wants to become a student)
     */
    @Transactional
    public ProfileResponse.StudentProfileDto createStudentProfile(UUID userId, StudentProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (user.hasStudentProfile()) {
            throw new IllegalStateException("User already has a student profile");
        }

        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        
        if (request.getFirstName() != null) {
            profile.setFirstName(request.getFirstName());
        }
        
        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }
        
        if (request.getMajor() != null) {
            profile.setMajor(request.getMajor());
        }
        
        if (request.getExpectedGraduation() != null) {
            profile.setExpectedGraduation(request.getExpectedGraduation());
        }
        
        if (request.getProfilePhotoUrl() != null) {
            profile.setProfilePhotoUrl(request.getProfilePhotoUrl());
        }
        
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        StudentProfile savedProfile = studentProfileRepository.save(profile);
        user.setStudentProfile(savedProfile);
        userRepository.save(user);
        
        return mapToStudentProfileDto(savedProfile);
    }

    /**
     * Create a tutor profile for an existing user (when a student wants to become a tutor)
     */
    @Transactional
    public ProfileResponse.TutorProfileDto createTutorProfile(UUID userId, TutorProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (user.hasTutorProfile()) {
            throw new IllegalStateException("User already has a tutor profile");
        }

        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        
        if (request.getFirstName() != null) {
            profile.setFirstName(request.getFirstName());
        }
        
        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }
        
        if (request.getMajor() != null) {
            profile.setMajor(request.getMajor());
        }
        
        if (request.getHourlyRate() != null) {
            profile.setHourlyRate(request.getHourlyRate());
        }
        
        if (request.getProfilePhotoUrl() != null) {
            profile.setProfilePhotoUrl(request.getProfilePhotoUrl());
        }
        
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        
        if (request.getAvailableForOnline() != null) {
            profile.setAvailableForOnline(request.getAvailableForOnline());
        }
        
        if (request.getAvailableForInPerson() != null) {
            profile.setAvailableForInPerson(request.getAvailableForInPerson());
        }
        
        if (request.getCoursesOffered() != null) {
            profile.setCoursesOffered(request.getCoursesOffered());
        }

        TutorProfile savedProfile = tutorProfileRepository.save(profile);
        user.setTutorProfile(savedProfile);
        userRepository.save(user);
        
        return mapToTutorProfileDto(savedProfile);
    }

    /**
     * Helper method to map StudentProfile entity to DTO
     */
    private ProfileResponse.StudentProfileDto mapToStudentProfileDto(StudentProfile profile) {
        ProfileResponse.StudentProfileDto dto = new ProfileResponse.StudentProfileDto();
        dto.setId(profile.getId());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setMajor(profile.getMajor());
        dto.setExpectedGraduation(profile.getExpectedGraduation());
        dto.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        dto.setBio(profile.getBio());
        return dto;
    }

    /**
     * Helper method to map TutorProfile entity to DTO
     */
    private ProfileResponse.TutorProfileDto mapToTutorProfileDto(TutorProfile profile) {
        ProfileResponse.TutorProfileDto dto = new ProfileResponse.TutorProfileDto();
        dto.setId(profile.getId());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setMajor(profile.getMajor());
        dto.setHourlyRate(profile.getHourlyRate());
        dto.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        dto.setBio(profile.getBio());
        dto.setAvailableForOnline(profile.getAvailableForOnline());
        dto.setAvailableForInPerson(profile.getAvailableForInPerson());
        dto.setRating(profile.getRating());
        dto.setTotalSessions(profile.getTotalSessions());
        dto.setCoursesOffered(profile.getCoursesOffered());
        return dto;
    }
}