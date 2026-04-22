package com.peertutor.dto;

public class FeedbackRequest {
    private Integer rating;
    private String notes;

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}