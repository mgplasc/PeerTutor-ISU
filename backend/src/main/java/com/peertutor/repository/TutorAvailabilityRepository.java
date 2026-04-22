package com.peertutor.repository;

import com.peertutor.model.TutorAvailability;
import com.peertutor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface TutorAvailabilityRepository extends JpaRepository<TutorAvailability, UUID> {
    List<TutorAvailability> findByTutorAndAvailableDateAfterOrderByAvailableDateAscStartTimeAsc(User tutor, LocalDate date);
    List<TutorAvailability> findByTutorAndIsBookedFalseAndAvailableDateAfterOrderByAvailableDateAscStartTimeAsc(User tutor, LocalDate date);
    boolean existsByTutorAndAvailableDateAndStartTimeAndIsBookedFalse(User tutor, LocalDate date, LocalTime time);
    List<TutorAvailability> findByTutorAndAvailableDateAndIsBookedFalse(User tutor, LocalDate date);
}