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
        
        String verificationLink = baseUrl + "/auth/verify?token=" + token;
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

    public void sendPasswordResetEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@peertutor.com");
        message.setTo(toEmail);
        message.setSubject("Reset your password - PeerTutor ISU");

        String resetLink = baseUrl + "/auth/reset-password?token=" + token;
        String emailBody = String.format(
            "Hello,\n\n" +
            "We received a request to reset your PeerTutor ISU password. " +
            "Click the link below to set a new password:\n\n" +
            "%s\n\n" +
            "This link will expire in 1 hour.\n\n" +
            "If you didn't request a password reset, please ignore this email. " +
            "Your password will not be changed.\n\n" +
            "Thanks,\n" +
            "PeerTutor ISU Team",
            resetLink
        );

        message.setText(emailBody);
        mailSender.send(message);
    }

        public void sendPasswordResetConfirmationEmail(String toEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@peertutor.com");
        message.setTo(toEmail);
        message.setSubject("Your password has been reset - PeerTutor ISU");

        String emailBody =
            "Hello,\n\n" +
            "Your PeerTutor ISU password has been successfully reset.\n\n" +
            "You can now log in to the app with your new password.\n\n" +
            "If you did not make this change, please contact us immediately " +
            "by requesting another password reset.\n\n" +
            "Thanks,\n" +
            "PeerTutor ISU Team";

        message.setText(emailBody);
        mailSender.send(message);
    }

}