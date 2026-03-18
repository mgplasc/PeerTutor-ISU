package com.peertutor.model;

import jakarta.persistence.*;

@Entity
@Table(name = "student_profiles")
public class StudentProfile extends Profile {

    @Column(name = "expected_graduation")
    private Integer expectedGraduation;

    // Default constructor
    public StudentProfile() {}

    // Constructor with user
    public StudentProfile(User user) {
        this.setUser(user);
        this.setId(user.getId());
    }

    // Getters and Setters
    public Integer getExpectedGraduation() { return expectedGraduation; }
    public void setExpectedGraduation(Integer expectedGraduation) { 
        this.expectedGraduation = expectedGraduation; 
    }
}