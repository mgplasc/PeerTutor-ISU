package com.peertutor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class BookSessionRequest {

    @NotNull(message = "Tutor ID is required")
    private UUID tutorId;

    @NotBlank(message = "Course number is required")
    private String courseNumber;

    @NotBlank(message = "Session date is required")
    private String sessionDate;

    @NotBlank(message = "Session time is required")
    private String sessionTime;

    @NotBlank(message = "Mode is required")
    private String mode;

    //getters and setters
    public UUID getTutorId() { return tutorId; }
    public void setTutorId(UUID tutorId) { this.tutorId = tutorId; }
    public String getCourseNumber() { return courseNumber; }
    public void setCourseNumber(String courseNumber) { this.courseNumber = courseNumber; }
    public String getSessionDate() { return sessionDate; }
    public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }
    public String getSessionTime() { return sessionTime; }
    public void setSessionTime(String sessionTime) { this.sessionTime = sessionTime; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
}
