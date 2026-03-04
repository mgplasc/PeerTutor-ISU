//Data transfer object will handle data going to frontend
package com.peertutor.dto;

import java.util.UUID;

public class SignupResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String userType;
    private boolean emailVerified;
    private String message;

    public SignupResponse(UUID id, String firstName, String lastName, String email, 
                         String userType, boolean emailVerified, String message) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userType = userType;
        this.emailVerified = emailVerified;
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

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}