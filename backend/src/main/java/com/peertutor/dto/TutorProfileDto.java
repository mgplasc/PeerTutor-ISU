package com.peertutor.dto;

import com.peertutor.model.Course;
import com.peertutor.model.TutorProfile;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class TutorProfileDto {
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
    private List<CourseDto> coursesOffered;

    public TutorProfileDto() {}

    public TutorProfileDto(TutorProfile profile) {
        this.id = profile.getId();
        this.firstName = profile.getFirstName();
        this.lastName = profile.getLastName();
        this.major = profile.getMajor();
        this.hourlyRate = profile.getHourlyRate();
        this.profilePhotoUrl = profile.getProfilePhotoUrl();
        this.bio = profile.getBio();
        this.availableForOnline = profile.getAvailableForOnline();
        this.availableForInPerson = profile.getAvailableForInPerson();
        this.rating = profile.getRating();
        this.totalSessions = profile.getTotalSessions();
       this.coursesOffered = profile.getCoursesOffered().stream()
            .map(CourseDto::new)  // Convert each Course to CourseDto
            .collect(Collectors.toList());
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

    public List<CourseDto> getCoursesOffered() { return coursesOffered; }
    public void setCoursesOffered(List<CourseDto> coursesOffered) { this.coursesOffered = coursesOffered; }
}