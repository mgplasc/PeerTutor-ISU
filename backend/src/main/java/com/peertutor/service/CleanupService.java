//Service class to handle cleanup of unverified user accounts after a certain period of time
package com.peertutor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peertutor.model.User;
import com.peertutor.repository.UserRepository;
import com.peertutor.repository.VerificationTokenRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CleanupService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VerificationTokenRepository tokenRepository;
    
    // Run every hour
    //@Scheduled(fixedRate = 3600000) // runs every hour
    @Transactional
    public void cleanupUnverifiedAccounts() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        
        // Find users who:
        // 1. Are not email verified
        // 2. Were created more than 24 hours ago
        List<User> unverifiedUsers = userRepository
            .findByEmailVerifiedFalseAndCreatedAtBefore(cutoff);
        
        for (User user : unverifiedUsers) {
            // Delete their verification tokens first
            tokenRepository.deleteByUser(user);
            // Delete the user
            userRepository.delete(user);
            
            System.out.println("Deleted unverified user: " + user.getEmail());
        }
    }
}