// DTO for adding a profile, with validation to ensure required fields based on profile type
package com.peertutor.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public class AddProfileRequest {
    
    @NotBlank(message = "Profile type is required")
    @Pattern(regexp = "STUDENT|TUTOR", message = "Profile type must be STUDENT or TUTOR")
    private String profileType;  
    
    // Common fields
    private String major;
    
    // Tutor-specific fields
    private Double hourlyRate;
    private List<String> coursesOffered;
    private Boolean availableForOnline;
    private Boolean availableForInPerson;
    
    // Student-specific fields
    private Integer expectedGraduation;
    
    // Custom validation to ensure required fields based on profile type
    @AssertTrue(message = "Hourly rate is required for tutor profiles")
    @JsonIgnore
    public boolean isValidTutorProfile() {
        if (isAddingTutorProfile()) {
            return hourlyRate != null && hourlyRate > 0;
        }
        return true;
    }
    
    @AssertTrue(message = "At least one course must be offered for tutor profiles")
    @JsonIgnore
    public boolean hasCoursesOffered() {
        if (isAddingTutorProfile()) {
            return coursesOffered != null && !coursesOffered.isEmpty();
        }
        return true;
    }
    
    // Getters, Setters, and Helper methods 
    public String getProfileType() { return profileType; }
    public void setProfileType(String profileType) { this.profileType = profileType; }
    
    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }
    
    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }
    
    public List<String> getCoursesOffered() { return coursesOffered; }
    public void setCoursesOffered(List<String> coursesOffered) { this.coursesOffered = coursesOffered; }
    
    public Boolean getAvailableForOnline() { return availableForOnline; }
    public void setAvailableForOnline(Boolean availableForOnline) { this.availableForOnline = availableForOnline; }
    
    public Boolean getAvailableForInPerson() { return availableForInPerson; }
    public void setAvailableForInPerson(Boolean availableForInPerson) { this.availableForInPerson = availableForInPerson; }
    
    public Integer getExpectedGraduation() { return expectedGraduation; }
    public void setExpectedGraduation(Integer expectedGraduation) { this.expectedGraduation = expectedGraduation; }
    
    // Helper methods
    public boolean isAddingStudentProfile() {
        return "STUDENT".equals(profileType);
    }
    
    public boolean isAddingTutorProfile() {
        return "TUTOR".equals(profileType);
    }
}