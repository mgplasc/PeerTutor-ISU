package com.peertutor.service;

import com.peertutor.dto.*;
import com.peertutor.model.*;
import com.peertutor.repository.UserRepository;
import com.peertutor.repository.CourseRepository;
import com.peertutor.repository.StudentProfileRepository;
import com.peertutor.repository.TutorProfileRepository;
import com.peertutor.exception.UserNotFoundException; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private CourseRepository courseRepository;

    /**
     * Get both profiles for a user
     */
    @Transactional(readOnly = true)
    public ProfileResponse getUserProfiles(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        return new ProfileResponse(user);
    }

    /**
     * Update student profile
     */
    @Transactional
    public StudentProfileDto updateStudentProfile(UUID userId, StudentProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (!user.hasStudentProfile()) {
            throw new IllegalStateException("User does not have a student profile");
        }

        StudentProfile profile = user.getStudentProfile();

        // Update common fields in User entity
        if (request.getFirstName() != null) {
            profile.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }
        if (request.getMajor() != null) {
            profile.setMajor(request.getMajor());
        }

        // Update student-specific fields
        if (request.getExpectedGraduation() != null) {
            profile.setExpectedGraduation(request.getExpectedGraduation());
        }

        userRepository.save(user);
        StudentProfile savedProfile = studentProfileRepository.save(profile);
        
        return new StudentProfileDto(savedProfile);
    }

    /**
     * Update tutor profile
     */
    @Transactional
    public TutorProfileDto updateTutorProfile(UUID userId, TutorProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (!user.hasTutorProfile()) {
            throw new IllegalStateException("User does not have a tutor profile");
        }

        TutorProfile profile = user.getTutorProfile();

        // Update common fields in User entity
        if (request.getFirstName() != null) {
            profile.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }
        if (request.getMajor() != null) {
            profile.setMajor(request.getMajor());
        }

        // Update tutor-specific fields
        if (request.getHourlyRate() != null) {
            profile.setHourlyRate(request.getHourlyRate());
        }
        if (request.getAvailableForOnline() != null) {
            profile.setAvailableForOnline(request.getAvailableForOnline());
        }
        if (request.getAvailableForInPerson() != null) {
            profile.setAvailableForInPerson(request.getAvailableForInPerson());
        }
        if (request.getCourseIds() != null) {
            List<Course> courses = courseRepository.findAllById(request.getCourseIds());
            profile.setCoursesOffered(courses);
        }

        userRepository.save(user);
        TutorProfile savedProfile = tutorProfileRepository.save(profile);
        
        return new TutorProfileDto(savedProfile);
    }

    /**
     * Create a student profile for an existing user (when a tutor wants to become a student)
     */
    @Transactional
    public StudentProfileDto createStudentProfile(UUID userId, StudentProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (user.hasStudentProfile()) {
            throw new IllegalStateException("User already has a student profile");
        }

        

        // Create new student profile
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setId(user.getId()); // MapsId will handle this
        
        // Update common fields in User entity if provided
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

        userRepository.save(user);
        StudentProfile savedProfile = studentProfileRepository.save(profile);
        user.setStudentProfile(savedProfile);
        
        return new StudentProfileDto(savedProfile);
    }

    /**
     * Create a tutor profile for an existing user (when a student wants to become a tutor)
     */
    @Transactional
    public TutorProfileDto createTutorProfile(UUID userId, TutorProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (user.hasTutorProfile()) {
            throw new IllegalStateException("User already has a tutor profile");
        }

        

        // Create new tutor profile
        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        profile.setId(user.getId()); // MapsId will handle this
        
        // Update common fields in User entity if provided
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
        if (request.getAvailableForOnline() != null) {
            profile.setAvailableForOnline(request.getAvailableForOnline());
        }
        if (request.getAvailableForInPerson() != null) {
            profile.setAvailableForInPerson(request.getAvailableForInPerson());
        }
        if (request.getCourseIds() != null) {  
        List<Course> courses = courseRepository.findAllById(request.getCourseIds());
        profile.setCoursesOffered(courses);
        }

        userRepository.save(user);
        TutorProfile savedProfile = tutorProfileRepository.save(profile);
        user.setTutorProfile(savedProfile);
        
        return new TutorProfileDto(savedProfile);
    }

    /**
     * Delete student profile
     */
    @Transactional
    public void deleteStudentProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (!user.hasStudentProfile()) {
            throw new IllegalStateException("User does not have a student profile");
        }

        studentProfileRepository.delete(user.getStudentProfile());
        user.setStudentProfile(null);
        userRepository.save(user);
    }

    /**
     * Delete tutor profile
     */
    @Transactional
    public void deleteTutorProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (!user.hasTutorProfile()) {
            throw new IllegalStateException("User does not have a tutor profile");
        }

        tutorProfileRepository.delete(user.getTutorProfile());
        user.setTutorProfile(null);
        userRepository.save(user);
    }
}