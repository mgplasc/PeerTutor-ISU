package com.peertutor.dto;

import com.peertutor.model.User;
import java.util.UUID;

public class ProfileResponse {
    private UUID id;
    private String email;
    private boolean studentProfileExists;
    private boolean tutorProfileExists;
    private StudentProfileDto studentProfile;
    private TutorProfileDto tutorProfile;

    public ProfileResponse() {}

    public ProfileResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.studentProfileExists = user.hasStudentProfile();
        this.tutorProfileExists = user.hasTutorProfile();
        
        if (user.hasStudentProfile()) {
            this.studentProfile = new StudentProfileDto(user.getStudentProfile());
        }
        if (user.hasTutorProfile()) {
            this.tutorProfile = new TutorProfileDto(user.getTutorProfile());
        }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public boolean isStudentProfileExists() { return studentProfileExists; }
    public void setStudentProfileExists(boolean studentProfileExists) { 
        this.studentProfileExists = studentProfileExists; 
    }

    public boolean isTutorProfileExists() { return tutorProfileExists; }
    public void setTutorProfileExists(boolean tutorProfileExists) { 
        this.tutorProfileExists = tutorProfileExists; 
    }

    public StudentProfileDto getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfileDto studentProfile) { 
        this.studentProfile = studentProfile; 
    }

    public TutorProfileDto getTutorProfile() { return tutorProfile; }
    public void setTutorProfile(TutorProfileDto tutorProfile) { 
        this.tutorProfile = tutorProfile; 
    }
}