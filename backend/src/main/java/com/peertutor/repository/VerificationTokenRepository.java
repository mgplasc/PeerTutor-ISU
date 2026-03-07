//Repository interface for managing verification tokens in the database
package com.peertutor.repository;

import com.peertutor.model.User;
import com.peertutor.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;  

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {  
    // Find token by the token string
    Optional<VerificationToken> findByToken(String token);
    
    // Find all tokens for a specific user
    List<VerificationToken> findByUser(User user);
    
    // Delete all tokens for a user 
    void deleteByUser(User user);
    
    // Check if a token exists for a user
    boolean existsByUser(User user);
}