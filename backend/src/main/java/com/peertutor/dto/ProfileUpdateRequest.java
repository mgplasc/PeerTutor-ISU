// Base DTO for profile update requests, containing common fields for both student and tutor profiles
package com.peertutor.dto;

public abstract class ProfileUpdateRequest {
    private String profilePhotoUrl;
    private String bio;

    // Getters and Setters
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}