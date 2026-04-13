package com.peertutor.repository;

import com.peertutor.model.Session;
import com.peertutor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByStudent(User student);
    List<Session> findByTutor(User tutor);
    List<Session> findByStudentOrTutor(User student, User tutor);
}
