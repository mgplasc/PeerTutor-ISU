//Data transfer object will handle data coming from frontend
package com.peertutor.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignupRequest {
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Profile type is required")
    @Pattern(regexp = "STUDENT|TUTOR", message = "Profile type must be either 'student' or 'tutor'")
    private String profileType;

    private String major;

    // Tutor-specific fields
    private Double hourlyRate;
    private List<String> coursesOffered;
    private Boolean availableForOnline;
    private Boolean availableForInPerson;
    
    // Student-specific fields
    private Integer expectedGraduation;  
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@ilstu\\.edu$", 
             message = "Must be a valid ILSTU email address")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    public String getProfileType() { return profileType; }
    public void setProfileType(String profileType) { this.profileType = profileType; }

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

    public boolean isCreatingStudentProfile() {
        return "STUDENT".equals(profileType);
    }
    
    public boolean isCreatingTutorProfile() {
        return "TUTOR".equals(profileType);
    }

    @AssertTrue(message = "Expected graduation year is required for students")
    @JsonIgnore
    public boolean isValidStudentProfile() {
        if (isCreatingStudentProfile()) {
            return expectedGraduation != null && expectedGraduation > 0;
        }
        return true;
    }

    @AssertTrue(message = "Hourly rate is required for tutors")
    @JsonIgnore
    public boolean isValidTutorProfile() {
        if (isCreatingTutorProfile()) {
            return hourlyRate != null && hourlyRate > 0;
        }
        return true;
    }
}