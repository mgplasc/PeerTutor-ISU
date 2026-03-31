package com.peertutor.repository;

import com.peertutor.model.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, UUID> {

    // Find tutors whose offered courses contain the given course number (case-insensitive)
    @Query("SELECT DISTINCT t FROM TutorProfile t JOIN t.coursesOffered c WHERE LOWER(c.courseNumber) LIKE LOWER(CONCAT('%', :courseNumber, '%'))")
    List<TutorProfile> findByCourseNumberContainingIgnoreCase(@Param("courseNumber") String courseNumber);
}