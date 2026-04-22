package com.peertutor.dto;

public class StudentProfileUpdateRequest extends ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String major;
    private Integer expectedGraduation;
    
    // Explicitly redeclare bio to ensure JSON mapping
    private String bio;
    private String profilePhotoUrl;

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    public Integer getExpectedGraduation() { return expectedGraduation; }
    public void setExpectedGraduation(Integer expectedGraduation) { this.expectedGraduation = expectedGraduation; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
}