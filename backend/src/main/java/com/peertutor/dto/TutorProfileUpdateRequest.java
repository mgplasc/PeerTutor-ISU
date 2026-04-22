package com.peertutor.dto;

import java.util.List;

public class TutorProfileUpdateRequest extends ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String major;
    private Double hourlyRate;
    private Boolean availableForOnline;
    private Boolean availableForInPerson;
    private List<Long> courseIds;
    
    // Explicitly redeclare bio and profilePhotoUrl
    private String bio;
    private String profilePhotoUrl;

    // Getters and Setters (include all)
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

    public Boolean getAvailableForOnline() { return availableForOnline; }
    public void setAvailableForOnline(Boolean availableForOnline) { this.availableForOnline = availableForOnline; }

    public Boolean getAvailableForInPerson() { return availableForInPerson; }
    public void setAvailableForInPerson(Boolean availableForInPerson) { this.availableForInPerson = availableForInPerson; }

    public List<Long> getCourseIds() { return courseIds; }
    public void setCourseIds(List<Long> courseIds) { this.courseIds = courseIds; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
}