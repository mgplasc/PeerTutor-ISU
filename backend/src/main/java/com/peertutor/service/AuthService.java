//Backend logic to create a user
package com.peertutor.service;

import com.peertutor.dto.SignupRequest;
import com.peertutor.dto.SignupResponse;
import com.peertutor.model.User;
import com.peertutor.model.UserRole;
import com.peertutor.model.VerificationToken;
import com.peertutor.repository.UserRepository;
import com.peertutor.repository.VerificationTokenRepository;
import com.peertutor.exception.UserRegistrationException;
import com.peertutor.util.PasswordEncoder;
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
    private EmailService emailService;
    
    @Transactional
    public SignupResponse registerUser(SignupRequest signupRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new UserRegistrationException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        user.setEmail(signupRequest.getEmail());
        
        // Hash password
        String hashedPassword = PasswordEncoder.encode(signupRequest.getPassword());
        user.setPasswordHash(hashedPassword);
        
        // Set user type
        user.setUserType(UserRole.valueOf(signupRequest.getUserType()));
        
        // Email starts as unverified
        user.setEmailVerified(false);
        
        // Save user
        User savedUser = userRepository.save(user);
        
        // Create and save verification token
        VerificationToken verificationToken = new VerificationToken(savedUser);
        tokenRepository.save(verificationToken);
        
        // Send verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken.getToken());
        
        // Return response
        return new SignupResponse(
            savedUser.getId(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            savedUser.getEmail(),
            savedUser.getUserType().toString(),
            savedUser.isEmailVerified(),
            "User registered successfully. Please check your email to verify your account."
        );
    }
    
    // Add method to verify email
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