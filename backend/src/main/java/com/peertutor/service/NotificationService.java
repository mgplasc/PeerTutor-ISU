package com.peertutor.service;

import com.peertutor.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private FcmService fcmService;

    public void notifyTutorBookingRequest(User tutor, String studentName, String courseNumber) {
        String title = "New Tutoring Request";
        String body = studentName + " wants a session for " + courseNumber;
        fcmService.sendPush(tutor.getDeviceToken(), title, body);
    }

    public void notifyStudentDecision(User student, boolean confirmed, String tutorName, String sessionTime) {
        String title = confirmed ? "Session Confirmed" : "Session Declined";
        String body = confirmed ?
                tutorName + " confirmed your session at " + sessionTime :
                tutorName + " declined your session request.";
        fcmService.sendPush(student.getDeviceToken(), title, body);
    }

    public void sendSessionReminder(User user, String role, String courseNumber, String sessionDate, String sessionTime) {
        String title = "Upcoming Session Reminder";
        String body = "You have an upcoming " + role + " session for " + courseNumber +
                " on " + sessionDate + " at " + sessionTime;
        fcmService.sendPush(user.getDeviceToken(), title, body);
    }
}
