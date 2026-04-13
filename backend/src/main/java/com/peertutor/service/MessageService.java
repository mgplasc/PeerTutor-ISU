package com.peertutor.service;

import com.peertutor.dto.ConversationDto;
import com.peertutor.dto.MessageDto;
import com.peertutor.exception.UserNotFoundException;
import com.peertutor.model.Conversation;
import com.peertutor.model.Message;
import com.peertutor.model.Session;
import com.peertutor.model.User;
import com.peertutor.repository.ConversationRepository;
import com.peertutor.repository.MessageRepository;
import com.peertutor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    //called when a session is confirmed — creates the conversation
    @Transactional
    public void openConversation(Session session) {
        //don't create duplicate conversations
        if (conversationRepository.findBySessionId(session.getId()).isPresent()) {
            return;
        }

        Conversation conversation = new Conversation();
        conversation.setStudent(session.getStudent());
        conversation.setTutor(session.getTutor());
        conversation.setSession(session);
        conversation.setStatus("OPEN");

        //closes 24 hours after the session date+time
        LocalDateTime sessionDateTime = session.getSessionDate()
                .atTime(session.getSessionTime());
        conversation.setClosesAt(sessionDateTime.plusHours(24));

        conversationRepository.save(conversation);
    }

    //get all conversations for a user
    @Transactional(readOnly = true)
    public List<ConversationDto> getConversationsForUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        List<Conversation> conversations = conversationRepository.findByStudentOrTutor(user, user);
        return conversations.stream()
                .map(conv -> new ConversationDto(conv, userId))
                .collect(Collectors.toList());
    }

    //get a single conversation with all messages
    @Transactional
    public ConversationDto getConversation(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        //mark messages as read for this user
        conversation.getMessages().forEach(message -> {
            if (!message.getSender().getId().equals(userId)) {
                message.setReadByRecipient(true);
                messageRepository.save(message);
            }
        });

        return new ConversationDto(conversation, userId);
    }

    // send a message in a conversation
    @Transactional
    public MessageDto sendMessage(UUID conversationId, UUID senderId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.isOpen()) {
            throw new RuntimeException("This conversation is closed");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        //verify sender is part of this conversation
        boolean isParticipant = conversation.getStudent().getId().equals(senderId)
                || conversation.getTutor().getId().equals(senderId);
        if (!isParticipant) {
            throw new RuntimeException("You are not a participant in this conversation");
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        message.setReadByRecipient(false);

        Message saved = messageRepository.save(message);
        return new MessageDto(saved);
    }
}
