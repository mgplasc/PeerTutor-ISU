package com.peertutor.repository;

import com.peertutor.model.Session;
import com.peertutor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByStudent(User student);
    List<Session> findByTutor(User tutor);
    List<Session> findByStudentOrTutor(User student, User tutor);

    //Find confirmed sessions that are upcoming and haven't had a reminder sent yet
    @Query("SELECT s FROM Session s WHERE s.status = 'CONFIRMED' AND s.reminderSent = false AND " +
           "(s.sessionDate > CURRENT_DATE OR (s.sessionDate = CURRENT_DATE AND s.sessionTime > CURRENT_TIME))")
    List<Session> findConfirmedSessionsNeedingReminder();
}
