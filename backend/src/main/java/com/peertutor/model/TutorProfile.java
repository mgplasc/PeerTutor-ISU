// Entity class for TutorProfile, representing the tutor-specific profile information linked to a User
package com.peertutor.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tutor_profiles")
public class TutorProfile {

    @Id
    private UUID id;  

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(name = "first_name") 
    private String firstName;

    @Column(name = "last_name")   
    private String lastName;

    private String major;

    @Column(name = "hourly_rate")
    private Double hourlyRate;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "available_online")
    private Boolean availableForOnline = false;

    @Column(name = "available_in_person")
    private Boolean availableForInPerson = false;

    private Double rating = 0.0;

    @Column(name = "total_sessions")
    private Integer totalSessions = 0;

    @ElementCollection
    @CollectionTable(
        name = "tutor_courses_offered",
        joinColumns = @JoinColumn(name = "tutor_profile_id")
    )
    @Column(name = "course")
    private List<String> coursesOffered = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}