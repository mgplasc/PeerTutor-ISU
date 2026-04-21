package com.peertutor.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class FcmService {

    private static final Logger logger = LoggerFactory.getLogger(FcmService.class);

    public void sendPush(String deviceToken, String title, String body) {
        if (deviceToken == null || deviceToken.isEmpty()) {
            logger.warn("No device token, skipping notification");
            return;
        }
        Message message = Message.builder()
                .setToken(deviceToken)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .putData("type", "session_update")
                .build();
        try {
            String response = FirebaseMessaging.getInstance().send(message);
            logger.info("Push sent: {}", response);
        } catch (Exception e) {
            logger.error("Push failed: {}", e.getMessage());
        }
    }
}