package com.peertutor.service;

import com.peertutor.model.Session;
import com.peertutor.repository.SessionRepository;
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

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private NotificationService notificationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");

    // Run every hour at minute 0 (e.g., 00:00, 01:00, 02:00...)
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void sendUpcomingSessionReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twentyFourHoursLater = now.plusHours(24);

        List<Session> sessions = sessionRepository.findConfirmedSessionsNeedingReminder();

        for (Session session : sessions) {
            LocalDateTime sessionDateTime = LocalDateTime.of(session.getSessionDate(), session.getSessionTime());

            // Check if session is within the next 24 hours
            if (sessionDateTime.isAfter(now) && sessionDateTime.isBefore(twentyFourHoursLater)) {
                String sessionDateStr = session.getSessionDate().format(DATE_FORMATTER);
                String sessionTimeStr = session.getSessionTime().format(TIME_FORMATTER);

                // Send reminder to student
                if (session.getStudent().getDeviceToken() != null && !session.getStudent().getDeviceToken().isEmpty()) {
                    notificationService.sendSessionReminder(
                        session.getStudent(),
                        "student",
                        session.getCourseNumber(),
                        sessionDateStr,
                        sessionTimeStr
                    );
                }

                // Send reminder to tutor
                if (session.getTutor().getDeviceToken() != null && !session.getTutor().getDeviceToken().isEmpty()) {
                    notificationService.sendSessionReminder(
                        session.getTutor(),
                        "tutor",
                        session.getCourseNumber(),
                        sessionDateStr,
                        sessionTimeStr
                    );
                }

                // Mark reminder as sent to avoid duplicate reminders
                session.setReminderSent(true);
                sessionRepository.save(session);
            }
        }
    }
}