package com.minor.alumini_platform.chat.controller;

import com.minor.alumini_platform.chat.dto.MessageResponse;
import com.minor.alumini_platform.chat.dto.SendMessageRequest;
import com.minor.alumini_platform.chat.model.Message;
import com.minor.alumini_platform.chat.service.MessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for message operations.
 * Note: Message history endpoint is handled by ConversationRestController for better organization
 */
@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;
    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // send message (REST) - primarily used for non-WebSocket clients
    @PostMapping("/messages")
    public MessageResponse sendMessage(@RequestBody SendMessageRequest req) {
        Message saved = messageService.sendMessage(req);
        return messageService.toDto(saved);
    }
}

