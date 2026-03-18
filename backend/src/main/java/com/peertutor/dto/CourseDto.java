package com.peertutor.dto;

import com.peertutor.model.Course;

public class CourseDto {
    private Long id;
    private String courseNumber;
    private String courseName;

    // Default constructor for deserialization
    public CourseDto() {}

    // Constructor to convert from Entity to DTO
    public CourseDto(Course course) {
        this.id = course.getId();
        this.courseNumber = course.getCourseNumber();
        this.courseName = course.getCourseName();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseNumber() { return courseNumber; }
    public void setCourseNumber(String courseNumber) { this.courseNumber = courseNumber; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
}