package com.peertutor.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.peertutor.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByEmailVerifiedFalseAndCreatedAtBefore(LocalDateTime cutoff);
    List<User> findByEmailVerifiedFalse();
    List<User> findByCreatedAtBefore(LocalDateTime dateTime);
}
