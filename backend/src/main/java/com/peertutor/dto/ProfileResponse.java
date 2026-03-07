// DTO for profile response, including nested DTOs for student and tutor profiles
package com.peertutor.dto;

import java.util.UUID;
import java.util.List;

public class ProfileResponse {
    private UUID id;
    private String email;
    private boolean studentProfileExists;
    private boolean tutorProfileExists;
    private StudentProfileDto studentProfile;
    private TutorProfileDto tutorProfile;

    // Nested DTO for Student Profile
    public static class StudentProfileDto {
        private UUID id;
        private String firstName;
        private String lastName;
        private String major;
        private Integer expectedGraduation;
        private String profilePhotoUrl;
        private String bio;

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

    // Nested DTO for Tutor Profile
    public static class TutorProfileDto {
        private UUID id;
        private String firstName;
        private String lastName;
        private String major;
        private Double hourlyRate;
        private String profilePhotoUrl;
        private String bio;
        private Boolean availableForOnline;
        private Boolean availableForInPerson;
        private Double rating;
        private Integer totalSessions;
        private List<String> coursesOffered;

        // Getters and Setters
        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getMajor() { return major; }
        public void setMajor(String major) { this.major = major; }

        public Double getHourlyRate() { return hourlyRate; }
        public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

        public String getProfilePhotoUrl() { return profilePhotoUrl; }
        public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }

        public Boolean getAvailableForOnline() { return availableForOnline; }
        public void setAvailableForOnline(Boolean availableForOnline) { this.availableForOnline = availableForOnline; }

        public Boolean getAvailableForInPerson() { return availableForInPerson; }
        public void setAvailableForInPerson(Boolean availableForInPerson) { this.availableForInPerson = availableForInPerson; }

        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }

        public Integer getTotalSessions() { return totalSessions; }
        public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }

        public List<String> getCoursesOffered() { return coursesOffered; }
        public void setCoursesOffered(List<String> coursesOffered) { this.coursesOffered = coursesOffered; }
    }

    // Getters and Setters for ProfileResponse
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean hasStudentProfile() { return studentProfileExists; }
    public void setStudentProfileExists(boolean studentProfileExists) { 
        this.studentProfileExists = studentProfileExists; 
    }

    public boolean hasTutorProfile() { return tutorProfileExists; }
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