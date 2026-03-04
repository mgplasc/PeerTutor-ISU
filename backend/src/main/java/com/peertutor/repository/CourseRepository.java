package com.peertutor.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.peertutor.model.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
}