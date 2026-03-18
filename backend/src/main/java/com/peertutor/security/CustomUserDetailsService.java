package com.peertutor.security;

import com.peertutor.model.User;
import com.peertutor.repository.UserRepository;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        User user = userRepository.findById(UUID.fromString(userId))
            .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getId().toString())
            .password(user.getPasswordHash())
            .authorities("ROLE_USER")  // Add appropriate roles
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(!user.isEmailVerified())  // Disable if email not verified
            .build();
    }
}