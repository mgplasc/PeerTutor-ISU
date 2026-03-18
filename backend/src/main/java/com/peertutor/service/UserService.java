package com.peertutor.service;

import com.peertutor.dto.*;
import com.peertutor.exception.InvalidCredentialsException;
import com.peertutor.exception.UserRegistrationException;
import com.peertutor.exception.UserNotFoundException;
import com.peertutor.model.Course;
import com.peertutor.model.StudentProfile;
import com.peertutor.model.TutorProfile;
import com.peertutor.model.User;
import com.peertutor.model.VerificationToken;
import com.peertutor.repository.CourseRepository;
import com.peertutor.repository.StudentProfileRepository;
import com.peertutor.repository.TutorProfileRepository;
import com.peertutor.repository.UserRepository;
import com.peertutor.repository.VerificationTokenRepository;
import com.peertutor.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CourseRepository courseRepository;

    // ============ AUTHENTICATION METHODS ============

    /**
     * Login user with email and password
     */
    @Transactional(readOnly = true)
    public LoginResponse login(String email, String password) {
        // Find user by email
        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // Check password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Check if email is verified
        if (!user.isEmailVerified()) {
            throw new InvalidCredentialsException("Please verify your email before logging in");
        }

        // Get profile details
        StudentProfileDto studentProfileDto = null;
        TutorProfileDto tutorProfileDto = null;

        if (user.hasStudentProfile()) {
            studentProfileDto = new StudentProfileDto(user.getStudentProfile());
        }

        if (user.hasTutorProfile()) {
            tutorProfileDto = new TutorProfileDto(user.getTutorProfile());
        }

        // Generate JWT token
        String token = tokenProvider.generateToken(user);

        // Return response
        return new LoginResponse(
            token, user, user.hasStudentProfile(), user.hasTutorProfile(),
            studentProfileDto, tutorProfileDto
        );
    }

    // ============ SIGNUP METHODS ============

    /**
     * Register a new user with profile
     */
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail().toLowerCase());
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Check if they're trying to create a profile they already have
            if (request.isCreatingStudentProfile() && user.hasStudentProfile()) {
                throw new UserRegistrationException("Student profile already exists");
            }
            if (request.isCreatingTutorProfile() && user.hasTutorProfile()) {
                throw new UserRegistrationException("Tutor profile already exists");
            }
            
            // Add the new profile (common fields will be set in profile creation)
            if (request.isCreatingStudentProfile()) {
                createStudentProfile(user, request);
            } else if (request.isCreatingTutorProfile()) {
                createTutorProfile(user, request);
            }
            
            userRepository.save(user);
            
            return mapSignupResponse(user, request.getProfileType(), 
                "Additional profile created successfully!");
        }
        
        // Create new user with profile
        User newUser = new User();
        newUser.setEmail(request.getEmail().toLowerCase());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setEmailVerified(false);
        
        // Save user first to get ID
        newUser = userRepository.save(newUser);
        
        // Create profile based on type - this will set firstName, lastName, major on the profile
        if (request.isCreatingStudentProfile()) {
            createStudentProfile(newUser, request);
        } else if (request.isCreatingTutorProfile()) {
            createTutorProfile(newUser, request);
        }
        
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
        profile.setId(user.getId()); // MapsId will handle this
        
        // Set fields on the profile, not on User
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
        profile.setId(user.getId()); // MapsId will handle this
        
        // Set fields on the profile, not on User
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setMajor(request.getMajor());
        profile.setHourlyRate(request.getHourlyRate());
        profile.setAvailableForOnline(request.getAvailableForOnline());
        profile.setAvailableForInPerson(request.getAvailableForInPerson());
        if (request.getCourseIds() != null) {
            List<Course> courses = courseRepository.findAllById(request.getCourseIds());
            profile.setCoursesOffered(courses);
        }
        
        tutorProfileRepository.save(profile);
        user.setTutorProfile(profile);
    }

    private SignupResponse mapSignupResponse(User user, String profileType, String message) {
        return new SignupResponse(user, message);
    }

    // ============ ADD PROFILE METHODS ============

    @Transactional
    public ProfileResponse addUserProfile(UUID userId, AddProfileRequest request) {
        User user = getUserById(userId);
        
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
        profile.setId(user.getId()); // MapsId will handle this
        
        // Set fields on the profile
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setMajor(request.getMajor());
        profile.setExpectedGraduation(request.getExpectedGraduation());
            
        studentProfileRepository.save(profile);
        user.setStudentProfile(profile);
        userRepository.save(user);
        
        return mapToProfileResponse(user);
    }

    private ProfileResponse createTutorProfileFromAddRequest(User user, AddProfileRequest request) {
        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        profile.setId(user.getId()); // MapsId will handle this
        
        // Set fields on the profile

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        if (request.getMajor() != null) {
            profile.setMajor(request.getMajor());
        }
        if (request.getHourlyRate() != null) {
            profile.setHourlyRate(request.getHourlyRate());
        }
        if (request.getCourseIds() != null) {
            List<Course> courses = courseRepository.findAllById(request.getCourseIds());
            profile.setCoursesOffered(courses);
        }
        if (request.getAvailableForOnline() != null) {
            profile.setAvailableForOnline(request.getAvailableForOnline());
        }
        if (request.getAvailableForInPerson() != null) {
            profile.setAvailableForInPerson(request.getAvailableForInPerson());
        }
        
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
            response.setStudentProfile(new StudentProfileDto(user.getStudentProfile()));
        }
        
        if (user.hasTutorProfile()) {
            response.setTutorProfile(new TutorProfileDto(user.getTutorProfile()));
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
        return userRepository.existsByEmail(email.toLowerCase());
    }

    // ============ USER MANAGEMENT METHODS ============

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public User getUserById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    /**
     * Check if email is available
     */
    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email.toLowerCase());
    }

    /**
     * Verify user email by userId (alternative method)
     */
    @Transactional
    public User verifyUserEmail(UUID userId) {
        User user = getUserById(userId);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    /**
     * Update user password
     */
    @Transactional
    public void updatePassword(UUID userId, String newPassword) {
        User user = getUserById(userId);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

   
    /**
     * Basic user registration (without profile)
     */
    @Transactional
    public User registerUser(String email, String password) {
        // Check if user exists
        if (userRepository.findByEmail(email.toLowerCase()).isPresent()) {
            throw new UserRegistrationException("Email already registered");
        }

        User user = new User();
        user.setEmail(email.toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmailVerified(false);

        return userRepository.save(user);
    }

    @Transactional
    public StudentProfileDto updateStudentBioAndPhoto(UUID userId, String bio, String profilePhotoUrl) {
        User user = getUserById(userId);
        if (!user.hasStudentProfile()) {
            throw new IllegalStateException("User does not have a student profile");
        }
        
        StudentProfile profile = user.getStudentProfile();
        if (bio != null) {
            profile.setBio(bio);
        }
        if (profilePhotoUrl != null) {
            profile.setProfilePhotoUrl(profilePhotoUrl);
        }
        
        studentProfileRepository.save(profile);
        return new StudentProfileDto(profile);
    }

    @Transactional
    public TutorProfileDto updateTutorBioAndPhoto(UUID userId, String bio, String profilePhotoUrl) {
        User user = getUserById(userId);
        if (!user.hasTutorProfile()) {
            throw new IllegalStateException("User does not have a tutor profile");
        }
        
        TutorProfile profile = user.getTutorProfile();
        if (bio != null) {
            profile.setBio(bio);
        }
        if (profilePhotoUrl != null) {
            profile.setProfilePhotoUrl(profilePhotoUrl);
        }
        
        tutorProfileRepository.save(profile);
        return new TutorProfileDto(profile);
    }
}