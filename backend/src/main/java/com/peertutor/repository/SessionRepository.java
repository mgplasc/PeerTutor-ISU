package com.peertutor.repository;

import com.peertutor.model.Session;
import com.peertutor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    List<Session> findByStudent(User student);
    List<Session> findByTutor(User tutor);
    List<Session> findByStudentOrTutor(User student, User tutor);

    /**
     * Find confirmed sessions that are upcoming and haven't had a reminder sent yet.
     * Works with most databases (H2, PostgreSQL, MySQL).
     */
    @Query("SELECT s FROM Session s WHERE s.status = 'CONFIRMED' AND s.reminderSent = false AND " +
           "(s.sessionDate > CURRENT_DATE OR (s.sessionDate = CURRENT_DATE AND s.sessionTime > CURRENT_TIME))")
    List<Session> findConfirmedSessionsNeedingReminder();

    /**
     * Find sessions by status and a time range defined by separate date+time fields.
     * Use this instead of the invalid derived query "findByStatusAndSessionDateTimeBetween".
     */
    @Query("SELECT s FROM Session s WHERE s.status = :status AND " +
           "(s.sessionDate > :startDate OR (s.sessionDate = :startDate AND s.sessionTime >= :startTime)) AND " +
           "(s.sessionDate < :endDate OR (s.sessionDate = :endDate AND s.sessionTime <= :endTime))")
    List<Session> findByStatusAndDateTimeRange(@Param("status") String status,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("startTime") LocalTime startTime,
                                               @Param("endDate") LocalDate endDate,
                                               @Param("endTime") LocalTime endTime);
}