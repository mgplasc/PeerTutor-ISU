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

    // book a new session (creates with PENDING status)
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
        return new SessionDto(saved);
    }

    // get all sessions for a user (as student or tutor)
    @Transactional(readOnly = true)
    public List<SessionDto> getSessionsForUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        List<Session> sessions = sessionRepository.findByStudentOrTutor(user, user);
        return sessions.stream()
                .map(SessionDto::new)
                .collect(Collectors.toList());
    }

    //tutor confirms a session — also opens the conversation
    @Transactional
    public SessionDto confirmSession(UUID sessionId, UUID tutorId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getTutor().getId().equals(tutorId)) {
            throw new RuntimeException("Only the tutor can confirm this session");
        }

        session.setStatus("CONFIRMED");
        Session saved = sessionRepository.save(session);

        //open a conversation for this session
        messageService.openConversation(saved);

        return new SessionDto(saved);
    }

    //tutor declines a session
    @Transactional
    public SessionDto declineSession(UUID sessionId, UUID tutorId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getTutor().getId().equals(tutorId)) {
            throw new RuntimeException("Only the tutor can decline this session");
        }

        session.setStatus("DECLINED");
        Session saved = sessionRepository.save(session);
        return new SessionDto(saved);
    }

    //get a single session by ID
    @Transactional(readOnly = true)
    public Optional<SessionDto> getSessionById(UUID sessionId) {
        return sessionRepository.findById(sessionId).map(SessionDto::new);
    }
}
