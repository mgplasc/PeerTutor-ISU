package com.peertutor.dto;

import com.peertutor.model.Session;
import java.util.UUID;

public class SessionDto {
    private UUID id;
    private String studentId;
    private String studentFirstName;
    private String studentLastName;
    private String tutorId;
    private String tutorFirstName;
    private String tutorLastName;
    private String courseNumber;
    private String sessionDate;
    private String sessionTime;
    private String mode;
    private String status;
    private String createdAt;
    private String zoomLink;
    private boolean feedbackGiven;

    public SessionDto() {}

    public SessionDto(Session session) {
        this.id = session.getId();
        this.studentId = session.getStudent().getId().toString();
        this.tutorId = session.getTutor().getId().toString();
        this.courseNumber = session.getCourseNumber();
        this.sessionDate = session.getSessionDate().toString();
        this.sessionTime = session.getSessionTime().toString();
        this.mode = session.getMode();
        this.status = session.getStatus();
        this.createdAt = session.getCreatedAt().toString();
        this.zoomLink = session.getZoomLink();

        if (session.getStudent().getStudentProfile() != null) {
            this.studentFirstName = session.getStudent().getStudentProfile().getFirstName();
            this.studentLastName = session.getStudent().getStudentProfile().getLastName();
        }
        if (session.getTutor().getTutorProfile() != null) {
            this.tutorFirstName = session.getTutor().getTutorProfile().getFirstName();
            this.tutorLastName = session.getTutor().getTutorProfile().getLastName();
        }
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getStudentFirstName() { return studentFirstName; }
    public void setStudentFirstName(String studentFirstName) { this.studentFirstName = studentFirstName; }
    public String getStudentLastName() { return studentLastName; }
    public void setStudentLastName(String studentLastName) { this.studentLastName = studentLastName; }
    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }
    public String getTutorFirstName() { return tutorFirstName; }
    public void setTutorFirstName(String tutorFirstName) { this.tutorFirstName = tutorFirstName; }
    public String getTutorLastName() { return tutorLastName; }
    public void setTutorLastName(String tutorLastName) { this.tutorLastName = tutorLastName; }
    public String getCourseNumber() { return courseNumber; }
    public void setCourseNumber(String courseNumber) { this.courseNumber = courseNumber; }
    public String getSessionDate() { return sessionDate; }
    public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }
    public String getSessionTime() { return sessionTime; }
    public void setSessionTime(String sessionTime) { this.sessionTime = sessionTime; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getZoomLink() { return zoomLink; }
    public void setZoomLink(String zoomLink) { this.zoomLink = zoomLink; }
    public boolean isFeedbackGiven() { return feedbackGiven; }
    public void setFeedbackGiven(boolean feedbackGiven) { this.feedbackGiven = feedbackGiven; }
}