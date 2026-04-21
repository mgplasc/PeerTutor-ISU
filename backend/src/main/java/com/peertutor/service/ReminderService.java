package com.peertutor.service;

import com.peertutor.model.Session;
import com.peertutor.repository.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@EnableScheduling
public class ReminderService {

    private static final Logger logger = LoggerFactory.getLogger(ReminderService.class);

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private NotificationService notificationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void sendUpcomingSessionReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twentyFourHoursLater = now.plusHours(24);
        logger.info("Checking for session reminders at {}", now);

        List<Session> sessions = sessionRepository.findConfirmedSessionsNeedingReminder();
        logger.info("Found {} sessions needing reminder check", sessions.size());

        for (Session session : sessions) {
            LocalDateTime sessionDateTime = LocalDateTime.of(session.getSessionDate(), session.getSessionTime());

            if (sessionDateTime.isAfter(now) && sessionDateTime.isBefore(twentyFourHoursLater)) {
                logger.info("Sending reminder for session {} (course {})", session.getId(), session.getCourseNumber());
                String sessionDateStr = session.getSessionDate().format(DATE_FORMATTER);
                String sessionTimeStr = session.getSessionTime().format(TIME_FORMATTER);

                // Send to student
                if (session.getStudent().getDeviceToken() != null && !session.getStudent().getDeviceToken().isEmpty()) {
                    notificationService.sendSessionReminder(
                        session.getStudent(),
                        "student",
                        session.getCourseNumber(),
                        sessionDateStr,
                        sessionTimeStr
                    );
                }

                // Send to tutor
                if (session.getTutor().getDeviceToken() != null && !session.getTutor().getDeviceToken().isEmpty()) {
                    notificationService.sendSessionReminder(
                        session.getTutor(),
                        "tutor",
                        session.getCourseNumber(),
                        sessionDateStr,
                        sessionTimeStr
                    );
                }

                session.setReminderSent(true);
                sessionRepository.save(session);
            }
        }
    }
}