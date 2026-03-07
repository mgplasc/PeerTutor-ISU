// DTO for updating student profiles, extending the base ProfileUpdateRequest with student-specific fields
package com.peertutor.dto;

public class StudentProfileUpdateRequest extends ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String major;
    private Integer expectedGraduation;

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    public Integer getExpectedGraduation() { return expectedGraduation; }
    public void setExpectedGraduation(Integer expectedGraduation) { this.expectedGraduation = expectedGraduation; }
}