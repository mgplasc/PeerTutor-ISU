package com.peertutor.repository;

import com.peertutor.model.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, UUID> {
}