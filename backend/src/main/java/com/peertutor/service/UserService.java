package com.peertutor.service;

import com.peertutor.dto.*;
import com.peertutor.exception.InvalidCredentialsException;
import com.peertutor.exception.UserRegistrationException;
import com.peertutor.exception.UserNotFoundException;
import com.peertutor.model.*;
import com.peertutor.repository.*;
import com.peertutor.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

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

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    // ============ AUTHENTICATION ============

    @Transactional(readOnly = true)
    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new InvalidCredentialsException("Please verify your email before logging in");
        }

        StudentProfileDto studentProfileDto = null;
        TutorProfileDto tutorProfileDto = null;

        if (user.hasStudentProfile()) {
            studentProfileDto = new StudentProfileDto(user.getStudentProfile());
        }
        if (user.hasTutorProfile()) {
            tutorProfileDto = new TutorProfileDto(user.getTutorProfile());
        }

        String token = tokenProvider.generateToken(user);

        return new LoginResponse(token, user, user.hasStudentProfile(), user.hasTutorProfile(),
                studentProfileDto, tutorProfileDto);
    }

    // ============ SIGNUP ============

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail().toLowerCase());

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            if (request.isCreatingStudentProfile() && user.hasStudentProfile()) {
                throw new UserRegistrationException("Student profile already exists");
            }
            if (request.isCreatingTutorProfile() && user.hasTutorProfile()) {
                throw new UserRegistrationException("Tutor profile already exists");
            }

            if (request.isCreatingStudentProfile()) {
                createStudentProfile(user, request);
            } else if (request.isCreatingTutorProfile()) {
                createTutorProfile(user, request);
            }

            userRepository.save(user);
            return mapSignupResponse(user, request.getProfileType(), "Additional profile created successfully!");
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail().toLowerCase());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setEmailVerified(false);
        newUser = userRepository.save(newUser);

        if (request.isCreatingStudentProfile()) {
            createStudentProfile(newUser, request);
        } else if (request.isCreatingTutorProfile()) {
            createTutorProfile(newUser, request);
        }

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

    // ============ ADD PROFILE ============

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
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        if (request.getMajor() != null) profile.setMajor(request.getMajor());
        if (request.getHourlyRate() != null) profile.setHourlyRate(request.getHourlyRate());
        if (request.getCourseIds() != null) {
            List<Course> courses = courseRepository.findAllById(request.getCourseIds());
            profile.setCoursesOffered(courses);
        }
        if (request.getAvailableForOnline() != null) profile.setAvailableForOnline(request.getAvailableForOnline());
        if (request.getAvailableForInPerson() != null) profile.setAvailableForInPerson(request.getAvailableForInPerson());
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
        if (user.hasStudentProfile()) response.setStudentProfile(new StudentProfileDto(user.getStudentProfile()));
        if (user.hasTutorProfile()) response.setTutorProfile(new TutorProfileDto(user.getTutorProfile()));
        return response;
    }

    // ============ EMAIL VERIFICATION ============

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
        tokenRepository.delete(verificationToken);
        return true;
    }

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email.toLowerCase());
    }

    // ============ USER MANAGEMENT ============

    @Transactional(readOnly = true)
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email.toLowerCase());
    }

    @Transactional
    public User verifyUserEmail(UUID userId) {
        User user = getUserById(userId);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    @Transactional
    public void updatePassword(UUID userId, String newPassword) {
        User user = getUserById(userId);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public User registerUser(String email, String password) {
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
        if (bio != null) profile.setBio(bio);
        if (profilePhotoUrl != null) profile.setProfilePhotoUrl(profilePhotoUrl);
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
        if (bio != null) profile.setBio(bio);
        if (profilePhotoUrl != null) profile.setProfilePhotoUrl(profilePhotoUrl);
        tutorProfileRepository.save(profile);
        return new TutorProfileDto(profile);
    }

    @Transactional
    public void sendPasswordResetEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase());
        if (userOptional.isEmpty()) return;
        User user = userOptional.get();
        passwordResetTokenRepository.deleteByUser(user);
        PasswordResetToken resetToken = new PasswordResetToken(user);
        passwordResetTokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken());
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByToken(token);
        if (tokenOptional.isEmpty()) {
            throw new RuntimeException("Invalid or expired reset link");
        }
        PasswordResetToken resetToken = tokenOptional.get();
        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset link has expired. Please request a new one.");
        }
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
        emailService.sendPasswordResetConfirmationEmail(user.getEmail());
    }

    @Transactional(readOnly = true)
    public boolean isResetTokenValid(String token) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByToken(token);
        return tokenOptional.isPresent() && !tokenOptional.get().isExpired();
    }

    @Transactional
    public void updateDeviceToken(UUID userId, String deviceToken) {
        User user = getUserById(userId);
        user.setDeviceToken(deviceToken);
        userRepository.save(user);
        logger.info("Updated device token for user {}", userId);
    }

    // ============ PROFILE DELETION (UPDATED) ============

    @Transactional
    public void deleteSingleProfile(UUID userId, String profileType) {
        User user = getUserById(userId);

        if (profileType.equalsIgnoreCase("STUDENT")) {
            if (!user.hasStudentProfile()) {
                throw new IllegalStateException("User does not have a student profile");
            }
            // Delete all sessions where this user was the student
            List<Session> studentSessions = sessionRepository.findByStudent(user);
            for (Session session : studentSessions) {
                conversationRepository.findBySessionId(session.getId())
                        .ifPresent(conv -> conversationRepository.delete(conv));
                sessionRepository.delete(session);
            }
            studentProfileRepository.delete(user.getStudentProfile());
            user.setStudentProfile(null);
        } else if (profileType.equalsIgnoreCase("TUTOR")) {
            if (!user.hasTutorProfile()) {
                throw new IllegalStateException("User does not have a tutor profile");
            }
            // Delete all sessions where this user was the tutor
            List<Session> tutorSessions = sessionRepository.findByTutor(user);
            for (Session session : tutorSessions) {
                conversationRepository.findBySessionId(session.getId())
                        .ifPresent(conv -> conversationRepository.delete(conv));
                sessionRepository.delete(session);
            }
            tutorProfileRepository.delete(user.getTutorProfile());
            user.setTutorProfile(null);
        } else {
            throw new IllegalArgumentException("Invalid profile type");
        }

        userRepository.save(user);
        logger.info("Deleted {} profile for user {}", profileType, userId);
    }

    @Transactional
    public void deleteFullAccount(UUID userId) {
        User user = getUserById(userId);

        List<Session> sessions = sessionRepository.findByStudentOrTutor(user, user);
        for (Session session : sessions) {
            conversationRepository.findBySessionId(session.getId())
                    .ifPresent(conversationRepository::delete);
            sessionRepository.delete(session);
        }

        List<Conversation> conversations = conversationRepository.findByStudentOrTutor(user, user);
        conversationRepository.deleteAll(conversations);

        tokenRepository.deleteByUser(user);
        passwordResetTokenRepository.deleteByUser(user);

        userRepository.delete(user);
        logger.info("Deleted full account for user {}", userId);
    }
}