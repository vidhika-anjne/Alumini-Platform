package com.minor.alumini_platform.chat.controller;

import com.minor.alumini_platform.chat.dto.ChatMessage;
import com.minor.alumini_platform.chat.dto.SendMessageRequest;
import com.minor.alumini_platform.chat.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Date;

@Controller
public class ChatController {

    private final MessageService messageService;

    public ChatController(MessageService messageService) {
        this.messageService = messageService;
    }

    @MessageMapping("/sendMessage")       // Client sends here
    @SendTo("/topic/messages")            // Broadcast here
    public ChatMessage sendMessage(ChatMessage message) {
        message.setTimestamp(new Date());
        // Save to DB (messages table)

        if (message.getReceiverId() != null) {
            try {
                Long conversationId = Long.valueOf(message.getReceiverId());
                SendMessageRequest req = new SendMessageRequest();
                req.conversationId = conversationId;
                req.senderId = message.getSenderId();
                req.content = message.getContent();
                req.mediaUrl = null;
                messageService.sendMessage(req);
            } catch (NumberFormatException ignored) {
            }
        }

        return message;
    }
}
