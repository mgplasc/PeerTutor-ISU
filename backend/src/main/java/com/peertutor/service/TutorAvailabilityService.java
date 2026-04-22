package com.peertutor.service;

import com.peertutor.dto.AvailabilitySlotDto;
import com.peertutor.exception.UserNotFoundException;
import com.peertutor.model.TutorAvailability;
import com.peertutor.model.User;
import com.peertutor.repository.TutorAvailabilityRepository;
import com.peertutor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TutorAvailabilityService {

    @Autowired
    private TutorAvailabilityRepository availabilityRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public AvailabilitySlotDto addAvailabilitySlot(UUID tutorId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        if (availabilityRepository.existsByTutorAndAvailableDateAndStartTimeAndIsBookedFalse(tutor, date, startTime)) {
            throw new RuntimeException("Slot already exists");
        }

        TutorAvailability slot = new TutorAvailability(tutor, date, startTime, endTime);
        TutorAvailability saved = availabilityRepository.save(slot);
        return new AvailabilitySlotDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlotDto> getAvailableSlotsForTutor(UUID tutorId) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        List<TutorAvailability> slots = availabilityRepository.findByTutorAndIsBookedFalseAndAvailableDateAfterOrderByAvailableDateAscStartTimeAsc(tutor, LocalDate.now());
        return slots.stream().map(AvailabilitySlotDto::new).collect(Collectors.toList());
    }

    @Transactional
    public void deleteAvailabilitySlot(UUID slotId, UUID tutorId) {
        TutorAvailability slot = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.getTutor().getId().equals(tutorId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (slot.isBooked()) {
            throw new RuntimeException("Cannot delete a booked slot");
        }
        availabilityRepository.delete(slot);
    }

    public List<AvailabilitySlotDto> getAvailableSlotsForTutorOnDate(UUID tutorId, LocalDate date) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> new UserNotFoundException("Tutor not found"));
        List<TutorAvailability> slots = availabilityRepository.findByTutorAndAvailableDateAndIsBookedFalse(tutor, date);
        return slots.stream().map(AvailabilitySlotDto::new).collect(Collectors.toList());
    }
}