package com.peertutor.service;

import com.peertutor.dto.BookSessionRequest;
import com.peertutor.dto.SessionDto;
import com.peertutor.exception.UserNotFoundException;
import com.peertutor.model.Session;
import com.peertutor.model.User;
import com.peertutor.repository.SessionRepository;
import com.peertutor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;   // <-- ADD THIS IMPORT
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageService messageService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ZoomService zoomService;

    @Transactional
    public SessionDto bookSession(UUID studentId, BookSessionRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new UserNotFoundException("Student not found"));

        User tutor = userRepository.findById(request.getTutorId())
                .orElseThrow(() -> new UserNotFoundException("Tutor not found"));

        Session session = new Session();
        session.setStudent(student);
        session.setTutor(tutor);
        session.setCourseNumber(request.getCourseNumber());
        session.setSessionDate(LocalDate.parse(request.getSessionDate()));
        session.setSessionTime(LocalTime.parse(request.getSessionTime()));
        session.setMode(request.getMode());
        session.setStatus("PENDING");

        Session saved = sessionRepository.save(session);

        String studentName = student.getStudentProfile() != null ? student.getStudentProfile().getFullName() : "A student";
        notificationService.notifyTutorBookingRequest(tutor, studentName, request.getCourseNumber());

        return new SessionDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionDto> getSessionsForUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        List<Session> sessions = sessionRepository.findByStudentOrTutor(user, user);
        return sessions.stream()
                .map(SessionDto::new)
                .collect(Collectors.toList());
    }

    // The ONLY confirmSession method (with Zoom logic)
    @Transactional
    public SessionDto confirmSession(UUID sessionId, UUID tutorId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getTutor().getId().equals(tutorId)) {
            throw new RuntimeException("Only the tutor can confirm this session");
        }

        session.setStatus("CONFIRMED");

        if ("Online".equalsIgnoreCase(session.getMode())) {
            String topic = "Tutoring Session: " + session.getCourseNumber();
            LocalDateTime startDateTime = LocalDateTime.of(session.getSessionDate(), session.getSessionTime());
            int duration = 60;
            String zoomLink = zoomService.createMeeting(topic, startDateTime, duration);
            if (zoomLink != null) {
                session.setZoomLink(zoomLink);
            }
        }

        Session saved = sessionRepository.save(session);
        messageService.openConversation(saved);

        String tutorName = session.getTutor().getTutorProfile() != null ? session.getTutor().getTutorProfile().getFullName() : "A tutor";
        notificationService.notifyStudentDecision(saved.getStudent(), true, tutorName, saved.getSessionTime().toString());

        if (saved.getZoomLink() != null) {
            notificationService.sendZoomLink(saved.getStudent(), saved.getZoomLink(), saved.getCourseNumber());
            notificationService.sendZoomLink(saved.getTutor(), saved.getZoomLink(), saved.getCourseNumber());
        }

        return new SessionDto(saved);
    }

    @Transactional
    public SessionDto declineSession(UUID sessionId, UUID tutorId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getTutor().getId().equals(tutorId)) {
            throw new RuntimeException("Only the tutor can decline this session");
        }

        session.setStatus("DECLINED");
        Session saved = sessionRepository.save(session);

        String tutorName = session.getTutor().getTutorProfile() != null ? session.getTutor().getTutorProfile().getFullName() : "A tutor";
        notificationService.notifyStudentDecision(saved.getStudent(), false, tutorName, null);

        return new SessionDto(saved);
    }

    @Transactional(readOnly = true)
    public Optional<SessionDto> getSessionById(UUID sessionId) {
        return sessionRepository.findById(sessionId).map(SessionDto::new);
    }
}