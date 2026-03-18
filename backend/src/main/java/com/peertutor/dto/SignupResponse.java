//Data transfer object will handle data going to frontend
package com.peertutor.dto;

import java.util.UUID;

import com.peertutor.model.User;

public class SignupResponse {
    private UUID id;
    private String email;
    private boolean emailVerified;
    private boolean hasStudentProfile;
    private boolean hasTutorProfile;
    private StudentProfileDto studentProfile;
    private TutorProfileDto tutorProfile;
    private String message;

    // Constructor for new user with one profile
    public SignupResponse(User user, String message)
    {
        this.id = user.getId();
        this.email = user.getEmail();
        this.emailVerified = user.isEmailVerified();
        this.hasStudentProfile = user.hasStudentProfile();
        this.hasTutorProfile = user.hasTutorProfile();
        if (user.hasStudentProfile()) {
            this.studentProfile = new StudentProfileDto(user.getStudentProfile());
        }
        if (user.hasTutorProfile()) {
            this.tutorProfile = new TutorProfileDto(user.getTutorProfile());
        }
        this.message = message;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isHasStudentProfile() { return hasStudentProfile; }
    public void setHasStudentProfile(boolean hasStudentProfile) { 
        this.hasStudentProfile = hasStudentProfile; 
    }

    public boolean isHasTutorProfile() { return hasTutorProfile; }
    public void setHasTutorProfile(boolean hasTutorProfile) { 
        this.hasTutorProfile = hasTutorProfile; 
    }

    public StudentProfileDto getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfileDto studentProfile) { 
        this.studentProfile = studentProfile; 
    }

    public TutorProfileDto getTutorProfile() { return tutorProfile; }
    public void setTutorProfile(TutorProfileDto tutorProfile) { 
        this.tutorProfile = tutorProfile; 
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}