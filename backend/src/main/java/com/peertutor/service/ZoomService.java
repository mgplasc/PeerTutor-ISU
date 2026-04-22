package com.peertutor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class ZoomService {

    @Value("${zoom.account-id}")
    private String accountId;

    @Value("${zoom.client-id}")
    private String clientId;

    @Value("${zoom.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String createMeeting(String topic, LocalDateTime startTime, int durationMinutes) {
        try {
            // First, get access token using Server-to-Server OAuth
            String tokenUrl = "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" + accountId;
            HttpHeaders tokenHeaders = new HttpHeaders();
            tokenHeaders.setBasicAuth(clientId, clientSecret);
            tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<String> tokenEntity = new HttpEntity<>(tokenHeaders);
            ResponseEntity<String> tokenResponse = restTemplate.exchange(tokenUrl, HttpMethod.POST, tokenEntity, String.class);
            JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
            String accessToken = tokenJson.get("access_token").asText();

            // Create meeting
            String meetingUrl = "https://api.zoom.us/v2/users/me/meetings";
            HttpHeaders meetingHeaders = new HttpHeaders();
            meetingHeaders.setBearerAuth(accessToken);
            meetingHeaders.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> meetingBody = new HashMap<>();
            meetingBody.put("topic", topic);
            meetingBody.put("type", 2); // Scheduled meeting
            meetingBody.put("start_time", startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            meetingBody.put("duration", durationMinutes);
            meetingBody.put("timezone", "America/Chicago");
            meetingBody.put("settings", Map.of("join_before_host", true, "approval_type", 0));

            HttpEntity<Map<String, Object>> meetingEntity = new HttpEntity<>(meetingBody, meetingHeaders);
            ResponseEntity<String> meetingResponse = restTemplate.exchange(meetingUrl, HttpMethod.POST, meetingEntity, String.class);
            JsonNode meetingJson = objectMapper.readTree(meetingResponse.getBody());

            return meetingJson.get("join_url").asText();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}