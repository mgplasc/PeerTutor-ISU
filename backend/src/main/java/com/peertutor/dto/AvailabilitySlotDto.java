package com.peertutor.dto;

import com.peertutor.model.TutorAvailability;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class AvailabilitySlotDto {
    private UUID id;
    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isBooked;

    public AvailabilitySlotDto() {}

    public AvailabilitySlotDto(TutorAvailability slot) {
        this.id = slot.getId();
        this.availableDate = slot.getAvailableDate();
        this.startTime = slot.getStartTime();
        this.endTime = slot.getEndTime();
        this.isBooked = slot.isBooked();
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public LocalDate getAvailableDate() { return availableDate; }
    public void setAvailableDate(LocalDate availableDate) { this.availableDate = availableDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public boolean isBooked() { return isBooked; }
    public void setBooked(boolean booked) { isBooked = booked; }
}