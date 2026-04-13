package com.peertutor.repository;

import com.peertutor.model.Conversation;
import com.peertutor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByStudentOrTutor(User student, User tutor);
    Optional<Conversation> findBySessionId(UUID sessionId);
}
