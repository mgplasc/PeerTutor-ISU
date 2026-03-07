//Data transfer object will handle data going to frontend
package com.peertutor.dto;

import java.util.UUID;

public class SignupResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean emailVerified;
    private boolean hasStudentProfile;
    private boolean hasTutorProfile;
    private String message;

    // Constructor for new user with one profile
    public SignupResponse(UUID id, String firstName, String lastName, String email, 
                         boolean emailVerified, String profileType, String message) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.emailVerified = emailVerified;
        this.hasStudentProfile = "STUDENT".equals(profileType);
        this.hasTutorProfile = "TUTOR".equals(profileType);
        this.message = message;
    }
    
    // Constructor for existing user adding second profile
    public SignupResponse(UUID id, String firstName, String lastName, String email,
                         boolean emailVerified, boolean hasStudentProfile, 
                         boolean hasTutorProfile, String message) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.emailVerified = emailVerified;
        this.hasStudentProfile = hasStudentProfile;
        this.hasTutorProfile = hasTutorProfile;
        this.message = message;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

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

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}