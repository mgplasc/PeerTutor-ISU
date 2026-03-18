package com.peertutor.dto;

import com.peertutor.model.User;
import java.util.UUID;

public class LoginResponse {
    private String token;
    private UUID id;
    private String email;
    private boolean emailVerified;
    private boolean hasStudentProfile;
    private boolean hasTutorProfile;
    private StudentProfileDto studentProfile;
    private TutorProfileDto tutorProfile;

    public LoginResponse(String token, User user, boolean hasStudentProfile, boolean hasTutorProfile,
                        StudentProfileDto studentProfile, TutorProfileDto tutorProfile) {
        this.token = token;
        this.id = user.getId();
        this.email = user.getEmail();
        this.emailVerified = user.isEmailVerified();
        this.hasStudentProfile = hasStudentProfile;
        this.hasTutorProfile = hasTutorProfile;
        this.studentProfile = studentProfile;
        this.tutorProfile = tutorProfile;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isHasStudentProfile() { return hasStudentProfile; }
    public void setHasStudentProfile(boolean hasStudentProfile) { this.hasStudentProfile = hasStudentProfile; }

    public boolean isHasTutorProfile() { return hasTutorProfile; }
    public void setHasTutorProfile(boolean hasTutorProfile) { this.hasTutorProfile = hasTutorProfile; }

    public StudentProfileDto getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfileDto studentProfile) { this.studentProfile = studentProfile; }

    public TutorProfileDto getTutorProfile() { return tutorProfile; }
    public void setTutorProfile(TutorProfileDto tutorProfile) { this.tutorProfile = tutorProfile; }
}