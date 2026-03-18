package com.peertutor.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "tutor_profiles")
public class TutorProfile extends Profile {

    @Column(name = "hourly_rate")
    private Double hourlyRate;

    @Column(name = "available_online")
    private Boolean availableForOnline = false;

    @Column(name = "available_in_person")
    private Boolean availableForInPerson = false;

    private Double rating = 0.0;

    @Column(name = "total_sessions")
    private Integer totalSessions = 0;

    @ManyToMany
    @JoinTable(
        name = "tutor_courses_offered",  // junction table
        joinColumns = @JoinColumn(name = "tutor_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> coursesOffered = new ArrayList<>();

    // Default constructor
    public TutorProfile() {}

    // Constructor with user
    public TutorProfile(User user) {
        this.setUser(user);
        this.setId(user.getId());
    }



    // Getters and Setters
    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

    public Boolean getAvailableForOnline() { return availableForOnline; }
    public void setAvailableForOnline(Boolean availableForOnline) { 
        this.availableForOnline = availableForOnline; 
    }

    public Boolean getAvailableForInPerson() { return availableForInPerson; }
    public void setAvailableForInPerson(Boolean availableForInPerson) { 
        this.availableForInPerson = availableForInPerson; 
    }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }

    public List<Course> getCoursesOffered() { return coursesOffered; }
    public void setCoursesOffered(List<Course> coursesOffered) { 
        this.coursesOffered = coursesOffered; 
    }
}