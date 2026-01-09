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
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

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
    public void sendMessage(@Payload SendMessageRequest request) {
        // 1. Save to database
        Message savedMessage = messageService.sendMessage(request);
        MessageResponse response = messageService.toDto(savedMessage);

        // 2. Notify all participants of the conversation
        List<ConversationParticipant> participants = participantRepository.findByConversationId(request.conversationId);
        
        for (ConversationParticipant p : participants) {
            // Client subscribes to /user/queue/messages
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
            MessageStatus status = MessageStatus.valueOf(update.getStatus());
            Message updatedMessage = messageService.updateStatus(update.getMessageId(), status);
            MessageResponse response = messageService.toDto(updatedMessage);

            // Notify participants (excluding the one who updated if needed, but usually just notify all)
            List<ConversationParticipant> participants = participantRepository.findByConversationId(updatedMessage.getConversation().getId());
            for (ConversationParticipant p : participants) {
                messagingTemplate.convertAndSendToUser(
                    p.getParticipantId(),
                    "/queue/status",
                    response
                );
            }
        } catch (Exception ignored) {}
    }
}
