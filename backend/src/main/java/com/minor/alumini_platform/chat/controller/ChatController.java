package com.minor.alumini_platform.chat.controller;

import com.minor.alumini_platform.chat.dto.MessageResponse;
import com.minor.alumini_platform.chat.dto.SendMessageRequest;
import com.minor.alumini_platform.chat.dto.TypingStatus;
import com.minor.alumini_platform.chat.dto.MessageStatusUpdate;
import com.minor.alumini_platform.chat.model.Message;
import com.minor.alumini_platform.chat.model.MessageStatus;
import com.minor.alumini_platform.chat.model.ConversationParticipant;
import com.minor.alumini_platform.chat.repository.ConversationParticipantRepository;
import com.minor.alumini_platform.chat.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationParticipantRepository participantRepository;

    public ChatController(MessageService messageService, 
                          SimpMessagingTemplate messagingTemplate,
                          ConversationParticipantRepository participantRepository) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.participantRepository = participantRepository;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        // Verify the sender matches the authenticated user
        String authenticatedUser = principal != null ? principal.getName() : null;
        if (authenticatedUser == null || !authenticatedUser.equals(request.senderId)) {
            throw new SecurityException("Sender ID mismatch");
        }

        // 1. Save to database
        Message savedMessage = messageService.sendMessage(request);
        MessageResponse response = messageService.toDto(savedMessage);

        // 2. Notify all participants including the sender
        List<ConversationParticipant> participants = participantRepository.findByConversationId(request.conversationId);
        
        for (ConversationParticipant p : participants) {
            messagingTemplate.convertAndSendToUser(
                p.getParticipantId(), 
                "/queue/messages", 
                response
            );
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingStatus typingStatus) {
        // Notify other participants in the room
        try {
            Long convId = Long.valueOf(typingStatus.getConversationId());
            List<ConversationParticipant> participants = participantRepository.findByConversationId(convId);

            for (ConversationParticipant p : participants) {
                if (!p.getParticipantId().equals(typingStatus.getSenderId())) {
                    // Client subscribes to /user/queue/typing
                    messagingTemplate.convertAndSendToUser(
                        p.getParticipantId(),
                        "/queue/typing",
                        typingStatus
                    );
                }
            }
        } catch (Exception ignored) {}
    }

    @MessageMapping("/chat.status")
    public void updateStatus(@Payload MessageStatusUpdate update) {
        try {
            System.out.println("DEBUG: Updating message " + update.getMessageId() + " to status " + update.getStatus());
            
            MessageStatus status = MessageStatus.valueOf(update.getStatus());
            Message updatedMessage = messageService.updateStatus(update.getMessageId(), status);
            MessageResponse response = messageService.toDto(updatedMessage);

            System.out.println("DEBUG: Broadcasting status update to conversation " + updatedMessage.getConversation().getId());
            
            // Notify all participants about the status change
            List<ConversationParticipant> participants = participantRepository.findByConversationId(updatedMessage.getConversation().getId());
            for (ConversationParticipant p : participants) {
                messagingTemplate.convertAndSendToUser(
                    p.getParticipantId(),
                    "/queue/status",
                    response
                );
            }
        } catch (IllegalArgumentException e) {
            System.err.println("DEBUG: Invalid status value: " + update.getStatus());
        } catch (Exception e) {
            System.err.println("DEBUG: Error updating message status: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public Map<String, String> handleException(Throwable exception) {
        return Map.of("error", exception.getMessage());
    }
}
