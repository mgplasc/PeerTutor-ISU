package com.peertutor.dto;

import com.peertutor.model.Message;
import java.util.UUID;

public class MessageDto {
    private UUID id;
    private String senderId;
    private String senderFirstName;
    private String senderLastName;
    private String content;
    private String sentAt;
    private boolean readByRecipient;

    public MessageDto() {}

    public MessageDto(Message message) {
        this.id = message.getId();
        this.senderId = message.getSender().getId().toString();
        this.content = message.getContent();
        this.sentAt = message.getSentAt().toString();
        this.readByRecipient = message.isReadByRecipient();

        // get sender name from whichever profile exists
        if (message.getSender().getStudentProfile() != null) {
            this.senderFirstName = message.getSender().getStudentProfile().getFirstName();
            this.senderLastName = message.getSender().getStudentProfile().getLastName();
        } else if (message.getSender().getTutorProfile() != null) {
            this.senderFirstName = message.getSender().getTutorProfile().getFirstName();
            this.senderLastName = message.getSender().getTutorProfile().getLastName();
        }
    }

    // getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getSenderFirstName() { return senderFirstName; }
    public void setSenderFirstName(String senderFirstName) { this.senderFirstName = senderFirstName; }
    public String getSenderLastName() { return senderLastName; }
    public void setSenderLastName(String senderLastName) { this.senderLastName = senderLastName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSentAt() { return sentAt; }
    public void setSentAt(String sentAt) { this.sentAt = sentAt; }
    public boolean isReadByRecipient() { return readByRecipient; }
    public void setReadByRecipient(boolean readByRecipient) { this.readByRecipient = readByRecipient; }
}
