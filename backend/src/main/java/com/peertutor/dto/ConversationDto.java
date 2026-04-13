package com.peertutor.dto;

import com.peertutor.model.Conversation;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ConversationDto {
    private UUID id;
    private String studentId;
    private String studentFirstName;
    private String studentLastName;
    private String tutorId;
    private String tutorFirstName;
    private String tutorLastName;
    private UUID sessionId;
    private String courseNumber;
    private String sessionDate;
    private String status;
    private String closesAt;
    private String createdAt;
    private List<MessageDto> messages;
    private String lastMessage;
    private String lastMessageTime;
    private int unreadCount;

    public ConversationDto() {}

    public ConversationDto(Conversation conversation, UUID currentUserId) {
        this.id = conversation.getId();
        this.studentId = conversation.getStudent().getId().toString();
        this.tutorId = conversation.getTutor().getId().toString();
        this.sessionId = conversation.getSession().getId();
        this.courseNumber = conversation.getSession().getCourseNumber();
        this.sessionDate = conversation.getSession().getSessionDate().toString();
        this.status = conversation.isOpen() ? "OPEN" : "CLOSED";
        this.createdAt = conversation.getCreatedAt().toString();

        if (conversation.getClosesAt() != null) {
            this.closesAt = conversation.getClosesAt().toString();
        }

        // student name
        if (conversation.getStudent().getStudentProfile() != null) {
            this.studentFirstName = conversation.getStudent().getStudentProfile().getFirstName();
            this.studentLastName = conversation.getStudent().getStudentProfile().getLastName();
        }

        // tutor name
        if (conversation.getTutor().getTutorProfile() != null) {
            this.tutorFirstName = conversation.getTutor().getTutorProfile().getFirstName();
            this.tutorLastName = conversation.getTutor().getTutorProfile().getLastName();
        }

        // messages
        this.messages = conversation.getMessages().stream()
                .map(MessageDto::new)
                .collect(Collectors.toList());

        // last message preview
        if (!this.messages.isEmpty()) {
            MessageDto last = this.messages.get(this.messages.size() - 1);
            this.lastMessage = last.getContent();
            this.lastMessageTime = last.getSentAt();
        } else {
            this.lastMessage = "";
            this.lastMessageTime = this.createdAt;
        }

        // unread count for current user
        String currentUserIdStr = currentUserId.toString();
        this.unreadCount = (int) conversation.getMessages().stream()
                .filter(m -> !m.getSender().getId().toString().equals(currentUserIdStr))
                .filter(m -> !m.isReadByRecipient())
                .count();
    }

    // getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getStudentFirstName() { return studentFirstName; }
    public void setStudentFirstName(String f) { this.studentFirstName = f; }
    public String getStudentLastName() { return studentLastName; }
    public void setStudentLastName(String l) { this.studentLastName = l; }
    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }
    public String getTutorFirstName() { return tutorFirstName; }
    public void setTutorFirstName(String f) { this.tutorFirstName = f; }
    public String getTutorLastName() { return tutorLastName; }
    public void setTutorLastName(String l) { this.tutorLastName = l; }
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public String getCourseNumber() { return courseNumber; }
    public void setCourseNumber(String courseNumber) { this.courseNumber = courseNumber; }
    public String getSessionDate() { return sessionDate; }
    public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getClosesAt() { return closesAt; }
    public void setClosesAt(String closesAt) { this.closesAt = closesAt; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public List<MessageDto> getMessages() { return messages; }
    public void setMessages(List<MessageDto> messages) { this.messages = messages; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public String getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(String t) { this.lastMessageTime = t; }
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
}
