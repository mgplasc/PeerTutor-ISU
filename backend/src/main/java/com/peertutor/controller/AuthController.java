package com.peertutor.controller;

import com.peertutor.dto.*;
import com.peertutor.service.UserService;
import com.peertutor.exception.UserRegistrationException;
import com.peertutor.exception.InvalidCredentialsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            SignupResponse response = userService.signup(signupRequest);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (UserRegistrationException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "An unexpected error occurred");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = userService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (InvalidCredentialsException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        boolean exists = userService.checkEmailExists(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", !exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = userService.verifyEmail(token);
            if (verified) {
                return ResponseEntity.ok("Email verified successfully! You can now log in.");
            } else {
                return ResponseEntity.badRequest().body("Invalid or expired verification token.");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Send password reset email
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            userService.sendPasswordResetEmail(request.getEmail());
        } catch (Exception e) {
            // Intentionally swallow — do not reveal if email is registered
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "If that email is registered, a password reset link has been sent.");
        return ResponseEntity.ok(response);
    }

    // GET — email link lands here, shows the reset password web form
    @GetMapping("/reset-password")
    public ResponseEntity<String> showResetForm(@RequestParam String token) {
        // Validate token exists before showing the form
        boolean valid = userService.isResetTokenValid(token);

        if (!valid) {
            String errorHtml =
                "<!DOCTYPE html>" +
                "<html lang='en'><head><meta charset='UTF-8'/>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>" +
                "<title>PeerTutor ISU - Link Expired</title>" +
                "<style>" +
                "* { box-sizing: border-box; margin: 0; padding: 0; }" +
                "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;" +
                "       background: #F5F7FA; min-height: 100vh;" +
                "       display: flex; flex-direction: column; }" +
                ".header { background: #CE1126; padding: 20px; text-align: center; }" +
                ".header h1 { color: #FFFFFF; font-size: 22px; font-weight: 800; }" +
                ".header p { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 4px; }" +
                ".card { background: #FFFFFF; border-radius: 20px; padding: 32px 28px;" +
                "        margin: 32px auto; max-width: 420px; width: 90%;" +
                "        box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-align: center; }" +
                ".icon { font-size: 48px; margin-bottom: 16px; }" +
                ".title { font-size: 20px; font-weight: 800; color: #000000; margin-bottom: 10px; }" +
                ".message { font-size: 14px; color: #6B7280; line-height: 1.6; }" +
                "</style></head><body>" +
                "<div class='header'>" +
                "<h1>PeerTutor ISU</h1>" +
                "<p>Illinois State University</p>" +
                "</div>" +
                "<div class='card'>" +
                "<div class='icon'>&#x26A0;</div>" +
                "<p class='title'>Link Expired</p>" +
                "<p class='message'>This password reset link is invalid or has expired.<br/>" +
                "Please request a new one from the app.</p>" +
                "</div></body></html>";
            return ResponseEntity.badRequest()
                .contentType(MediaType.TEXT_HTML)
                .body(errorHtml);
        }

        String formHtml =
            "<!DOCTYPE html>" +
            "<html lang='en'><head><meta charset='UTF-8'/>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>" +
            "<title>PeerTutor ISU - Reset Password</title>" +
            "<style>" +
            "* { box-sizing: border-box; margin: 0; padding: 0; }" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;" +
            "       background: #F5F7FA; min-height: 100vh;" +
            "       display: flex; flex-direction: column; }" +
            ".header { background: #CE1126; padding: 20px; text-align: center; }" +
            ".header h1 { color: #FFFFFF; font-size: 22px; font-weight: 800; }" +
            ".header p { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 4px; }" +
            ".card { background: #FFFFFF; border-radius: 20px; padding: 32px 28px;" +
            "        margin: 32px auto; max-width: 420px; width: 90%;" +
            "        box-shadow: 0 2px 12px rgba(0,0,0,0.08); }" +
            ".card h2 { font-size: 20px; font-weight: 800; color: #000000; margin-bottom: 6px; }" +
            ".card .subtitle { font-size: 13px; color: #6B7280; margin-bottom: 24px; }" +
            ".field-label { font-size: 13px; font-weight: 600; color: #000000;" +
            "               margin-bottom: 6px; margin-top: 16px; display: block; }" +
            "input[type=password] {" +
            "  width: 100%; padding: 12px 14px; font-size: 14px;" +
            "  border: 1.5px solid #E0E0E0; border-radius: 10px;" +
            "  background: #F5F7FA; color: #000000; outline: none;" +
            "  transition: border-color 0.2s; }" +
            "input[type=password]:focus { border-color: #CE1126; }" +
            ".error-msg { font-size: 12px; color: #EF4444; margin-top: 6px; display: none; }" +
            "button { width: 100%; padding: 15px; margin-top: 24px;" +
            "         background: #CE1126; color: #FFFFFF; border: none;" +
            "         border-radius: 12px; font-size: 15px; font-weight: 700;" +
            "         cursor: pointer; transition: opacity 0.2s; }" +
            "button:hover { opacity: 0.9; }" +
            "button:disabled { opacity: 0.6; cursor: not-allowed; }" +
            "</style></head><body>" +
            "<div class='header'>" +
            "<h1>PeerTutor ISU</h1>" +
            "<p>Illinois State University</p>" +
            "</div>" +
            "<div class='card'>" +
            "<h2>Reset Password</h2>" +
            "<p class='subtitle'>Enter and confirm your new password below.</p>" +
            "<form id='resetForm' method='POST' action='/auth/reset-password-form' onsubmit='return validate()'>" +
            "<input type='hidden' name='token' value='" + token + "'/>" +
            "<label class='field-label' for='newPassword'>New Password (min 8 characters)</label>" +
            "<input type='password' id='newPassword' name='newPassword' minlength='8' required/>" +
            "<label class='field-label' for='confirmPassword'>Confirm New Password</label>" +
            "<input type='password' id='confirmPassword' name='confirmPassword' minlength='8' required/>" +
            "<p class='error-msg' id='errorMsg'>Passwords do not match.</p>" +
            "<button type='submit' id='submitBtn'>Reset Password</button>" +
            "</form>" +
            "</div>" +
            "<script>" +
            "function validate() {" +
            "  var p1 = document.getElementById('newPassword').value;" +
            "  var p2 = document.getElementById('confirmPassword').value;" +
            "  var err = document.getElementById('errorMsg');" +
            "  if (p1 !== p2) { err.style.display = 'block'; return false; }" +
            "  err.style.display = 'none';" +
            "  document.getElementById('submitBtn').disabled = true;" +
            "  document.getElementById('submitBtn').textContent = 'Resetting...';" +
            "  return true;" +
            "}" +
            "</script>" +
            "</body></html>";

        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .body(formHtml);
    }

    // POST — handles form submission from the reset password web page
    @PostMapping("/reset-password-form")
    public ResponseEntity<String> handleResetForm(
            @RequestParam String token,
            @RequestParam String newPassword) {
        try {
            userService.resetPassword(token, newPassword);
            String successHtml =
                "<!DOCTYPE html>" +
                "<html lang='en'><head><meta charset='UTF-8'/>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>" +
                "<title>PeerTutor ISU - Password Reset</title>" +
                "<style>" +
                "* { box-sizing: border-box; margin: 0; padding: 0; }" +
                "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;" +
                "       background: #F5F7FA; min-height: 100vh;" +
                "       display: flex; flex-direction: column; }" +
                ".header { background: #CE1126; padding: 20px; text-align: center; }" +
                ".header h1 { color: #FFFFFF; font-size: 22px; font-weight: 800; }" +
                ".header p { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 4px; }" +
                ".card { background: #FFFFFF; border-radius: 20px; padding: 32px 28px;" +
                "        margin: 32px auto; max-width: 420px; width: 90%;" +
                "        box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-align: center; }" +
                ".icon { font-size: 52px; margin-bottom: 16px; color: #10B981; }" +
                ".title { font-size: 20px; font-weight: 800; color: #000000; margin-bottom: 10px; }" +
                ".message { font-size: 14px; color: #6B7280; line-height: 1.6; }" +
                "</style></head><body>" +
                "<div class='header'>" +
                "<h1>PeerTutor ISU</h1>" +
                "<p>Illinois State University</p>" +
                "</div>" +
                "<div class='card'>" +
                "<div class='icon'>&#10003;</div>" +
                "<p class='title'>Password Reset!</p>" +
                "<p class='message'>Your password has been updated successfully.<br/>" +
                "You can now log in to the PeerTutor ISU app with your new password.</p>" +
                "</div></body></html>";
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(successHtml);
        } catch (RuntimeException e) {
            String errorHtml =
                "<!DOCTYPE html>" +
                "<html lang='en'><head><meta charset='UTF-8'/>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>" +
                "<title>PeerTutor ISU - Reset Failed</title>" +
                "<style>" +
                "* { box-sizing: border-box; margin: 0; padding: 0; }" +
                "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;" +
                "       background: #F5F7FA; min-height: 100vh;" +
                "       display: flex; flex-direction: column; }" +
                ".header { background: #CE1126; padding: 20px; text-align: center; }" +
                ".header h1 { color: #FFFFFF; font-size: 22px; font-weight: 800; }" +
                ".header p { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 4px; }" +
                ".card { background: #FFFFFF; border-radius: 20px; padding: 32px 28px;" +
                "        margin: 32px auto; max-width: 420px; width: 90%;" +
                "        box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-align: center; }" +
                ".icon { font-size: 48px; margin-bottom: 16px; }" +
                ".title { font-size: 20px; font-weight: 800; color: #CE1126; margin-bottom: 10px; }" +
                ".message { font-size: 14px; color: #6B7280; line-height: 1.6; }" +
                "</style></head><body>" +
                "<div class='header'>" +
                "<h1>PeerTutor ISU</h1>" +
                "<p>Illinois State University</p>" +
                "</div>" +
                "<div class='card'>" +
                "<div class='icon'>&#x26A0;</div>" +
                "<p class='title'>Reset Failed</p>" +
                "<p class='message'>" + e.getMessage() + "<br/>" +
                "Please request a new reset link from the app.</p>" +
                "</div></body></html>";
            return ResponseEntity.badRequest()
                .contentType(MediaType.TEXT_HTML)
                .body(errorHtml);
        }
    }

    // POST — used by the mobile app directly (JSON)
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully. You can now log in.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
