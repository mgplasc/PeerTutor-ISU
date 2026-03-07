//Backend logic to create a user
package com.peertutor.service;

import com.peertutor.dto.AddProfileRequest;
import com.peertutor.dto.ProfileResponse;
import com.peertutor.dto.SignupRequest;
import com.peertutor.dto.SignupResponse;
import com.peertutor.model.StudentProfile;
import com.peertutor.model.TutorProfile;
import com.peertutor.model.User;
import com.peertutor.model.VerificationToken;
import com.peertutor.repository.StudentProfileRepository;
import com.peertutor.repository.TutorProfileRepository;
import com.peertutor.repository.UserRepository;
import com.peertutor.repository.VerificationTokenRepository;
import com.peertutor.exception.UserRegistrationException;
import com.peertutor.exception.UserNotFoundException;  
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // ============ SIGNUP METHODS ============
    
    public SignupResponse registerUser(SignupRequest request) {
        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Check if they're trying to create a profile they already have
            if (request.isCreatingStudentProfile() && user.hasStudentProfile()) {
                throw new UserRegistrationException("Student profile already exists");
            }
            if (request.isCreatingTutorProfile() && user.hasTutorProfile()) {
                throw new UserRegistrationException("Tutor profile already exists");
            }
            
            // Add the new profile
            if (request.isCreatingStudentProfile()) {
                createStudentProfile(user, request);
            } else if (request.isCreatingTutorProfile()) {
                createTutorProfile(user, request);
            }
            
            return mapSignupResponse(user, request.getProfileType(), 
                "Additional profile created successfully!");
        }
        
        // Create new user with profile
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        if (request.isCreatingStudentProfile()) {
            createStudentProfile(newUser, request);
        } else if (request.isCreatingTutorProfile()) {
            createTutorProfile(newUser, request);
        }
        
        userRepository.save(newUser);
        
        // Create verification token and send email
        VerificationToken verificationToken = new VerificationToken(newUser);
        tokenRepository.save(verificationToken);
        emailService.sendVerificationEmail(newUser.getEmail(), verificationToken.getToken());
        
        return mapSignupResponse(newUser, request.getProfileType(), 
            "Signup successful! Please check your email to verify your account.");
    }

    private void createStudentProfile(User user, SignupRequest request) {
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setMajor(request.getMajor());
        profile.setExpectedGraduation(request.getExpectedGraduation());
        studentProfileRepository.save(profile);
        user.setStudentProfile(profile);
    }

    private void createTutorProfile(User user, SignupRequest request) {
        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setMajor(request.getMajor());
        profile.setHourlyRate(request.getHourlyRate());
        profile.setCoursesOffered(request.getCoursesOffered());
        profile.setAvailableForOnline(request.getAvailableForOnline());
        profile.setAvailableForInPerson(request.getAvailableForInPerson());
        tutorProfileRepository.save(profile);
        user.setTutorProfile(profile);
    }

    private SignupResponse mapSignupResponse(User user, String profileType, String message) {
        return new SignupResponse(
            user.getId(),
            getFirstName(user, profileType),
            getLastName(user, profileType),
            user.getEmail(),
            user.isEmailVerified(),
            profileType,
            message
        );
    }

    private String getFirstName(User user, String profileType) {
        if ("STUDENT".equals(profileType) && user.hasStudentProfile()) {
            return user.getStudentProfile().getFirstName();
        } else if ("TUTOR".equals(profileType) && user.hasTutorProfile()) {
            return user.getTutorProfile().getFirstName();
        }
        return null;
    }

    private String getLastName(User user, String profileType) {
        if ("STUDENT".equals(profileType) && user.hasStudentProfile()) {
            return user.getStudentProfile().getLastName();
        } else if ("TUTOR".equals(profileType) && user.hasTutorProfile()) {
            return user.getTutorProfile().getLastName();
        }
        return null;
    }

    // ============ ADD PROFILE METHODS ============

    @Transactional
    public ProfileResponse addUserProfile(UUID userId, AddProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        if (request.isAddingStudentProfile()) {
            if (user.hasStudentProfile()) {
                throw new UserRegistrationException("Student profile already exists");
            }
            return createStudentProfileFromAddRequest(user, request);
        } else if (request.isAddingTutorProfile()) {
            if (user.hasTutorProfile()) {
                throw new UserRegistrationException("Tutor profile already exists");
            }
            return createTutorProfileFromAddRequest(user, request);
        } else {
            throw new IllegalArgumentException("Invalid profile type");
        }
    }

    private ProfileResponse createStudentProfileFromAddRequest(User user, AddProfileRequest request) {
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setMajor(request.getMajor());
        profile.setExpectedGraduation(request.getExpectedGraduation());
        //firstName/lastName would need to be in AddProfileRequest or come from existing profile
        studentProfileRepository.save(profile);
        user.setStudentProfile(profile);
        userRepository.save(user);
        
        return mapToProfileResponse(user);
    }

    private ProfileResponse createTutorProfileFromAddRequest(User user, AddProfileRequest request) {
        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        profile.setMajor(request.getMajor());
        profile.setHourlyRate(request.getHourlyRate());
        profile.setCoursesOffered(request.getCoursesOffered());
        profile.setAvailableForOnline(request.getAvailableForOnline());
        profile.setAvailableForInPerson(request.getAvailableForInPerson());
        tutorProfileRepository.save(profile);
        user.setTutorProfile(profile);
        userRepository.save(user);
        
        return mapToProfileResponse(user);
    }

    private ProfileResponse mapToProfileResponse(User user) {
        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setStudentProfileExists(user.hasStudentProfile());
        response.setTutorProfileExists(user.hasTutorProfile());
        
        if (user.hasStudentProfile()) {
            ProfileResponse.StudentProfileDto studentDto = new ProfileResponse.StudentProfileDto();
            StudentProfile sp = user.getStudentProfile();
            studentDto.setId(sp.getId());
            studentDto.setFirstName(sp.getFirstName());
            studentDto.setLastName(sp.getLastName());
            studentDto.setMajor(sp.getMajor());
            studentDto.setExpectedGraduation(sp.getExpectedGraduation());
            studentDto.setProfilePhotoUrl(sp.getProfilePhotoUrl());
            studentDto.setBio(sp.getBio());
            response.setStudentProfile(studentDto);
        }
        
        if (user.hasTutorProfile()) {
            ProfileResponse.TutorProfileDto tutorDto = new ProfileResponse.TutorProfileDto();
            TutorProfile tp = user.getTutorProfile();
            tutorDto.setId(tp.getId());
            tutorDto.setFirstName(tp.getFirstName());
            tutorDto.setLastName(tp.getLastName());
            tutorDto.setMajor(tp.getMajor());
            tutorDto.setHourlyRate(tp.getHourlyRate());
            tutorDto.setProfilePhotoUrl(tp.getProfilePhotoUrl());
            tutorDto.setBio(tp.getBio());
            tutorDto.setAvailableForOnline(tp.getAvailableForOnline());
            tutorDto.setAvailableForInPerson(tp.getAvailableForInPerson());
            tutorDto.setRating(tp.getRating());
            tutorDto.setTotalSessions(tp.getTotalSessions());
            tutorDto.setCoursesOffered(tp.getCoursesOffered());
            response.setTutorProfile(tutorDto);
        }
        
        return response;
    }

    // ============ EMAIL VERIFICATION METHODS ============
    
    @Transactional
    public boolean verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (verificationToken.isExpired()) {
            throw new RuntimeException("Verification token has expired");
        }
        
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        
        // Delete the used token
        tokenRepository.delete(verificationToken);
        
        return true;
    }

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}