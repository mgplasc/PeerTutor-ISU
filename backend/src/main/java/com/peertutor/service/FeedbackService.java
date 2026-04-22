package com.peertutor.service;

import com.peertutor.dto.FeedbackRequest;
import com.peertutor.model.Feedback;
import com.peertutor.model.Session;
import com.peertutor.model.User;
import com.peertutor.repository.FeedbackRepository;
import com.peertutor.repository.SessionRepository;
import com.peertutor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void submitFeedback(UUID sessionId, UUID studentId, FeedbackRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Only the student can leave feedback");
        }

        if (feedbackRepository.existsBySessionId(sessionId)) {
            throw new RuntimeException("Feedback already submitted for this session");
        }

        Feedback feedback = new Feedback();
        feedback.setSession(session);
        feedback.setStudent(session.getStudent());
        feedback.setTutor(session.getTutor());
        feedback.setRating(request.getRating());
        feedback.setNotes(request.getNotes());
        feedback.setCreatedAt(LocalDateTime.now());
        feedbackRepository.save(feedback);

        User tutor = session.getTutor();
        if (tutor.getTutorProfile() != null) {
            Double currentRating = tutor.getTutorProfile().getRating();
            Integer totalSessions = tutor.getTutorProfile().getTotalSessions();
            double newRating = (currentRating * totalSessions + request.getRating()) / (totalSessions + 1);
            tutor.getTutorProfile().setRating(Math.round(newRating * 10) / 10.0);
            tutor.getTutorProfile().setTotalSessions(totalSessions + 1);
            userRepository.save(tutor);
        }
    }
}