package com.peertutor.dto;

import com.peertutor.model.StudentProfile;
import java.util.UUID;

public class StudentProfileDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String major;
    private Integer expectedGraduation;
    private String profilePhotoUrl;
    private String bio;

    public StudentProfileDto() {}

    public StudentProfileDto(StudentProfile profile) {
        this.id = profile.getId();
        this.firstName = profile.getFirstName();
        this.lastName = profile.getLastName();
        this.major = profile.getMajor();
        this.expectedGraduation = profile.getExpectedGraduation();
        this.profilePhotoUrl = profile.getProfilePhotoUrl();
        this.bio = profile.getBio();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    public Integer getExpectedGraduation() { return expectedGraduation; }
    public void setExpectedGraduation(Integer expectedGraduation) { this.expectedGraduation = expectedGraduation; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}