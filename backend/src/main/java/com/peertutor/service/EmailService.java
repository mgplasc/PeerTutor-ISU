//Service class to handle email sending functionality to send verification 
// emails to users after registration
package com.peertutor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${app.base-url}")
    private String baseUrl;
    
    public void sendVerificationEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@peertutor.com");
        message.setTo(toEmail);
        message.setSubject("Please verify your email - PeerTutor ISU");
        
        String verificationLink = baseUrl + "/api/auth/verify?token=" + token;
        String emailBody = String.format(
            "Hello,\n\n" +
            "Thank you for registering with PeerTutor ISU! Please verify your email by clicking the link below:\n\n" +
            "%s\n\n" +
            "This link will expire in 24 hours.\n\n" +
            "If you didn't create an account, please ignore this email.\n\n" +
            "Thanks,\n" +
            "PeerTutor ISU Team",
            verificationLink
        );
        
        message.setText(emailBody);
        mailSender.send(message);
    }
}