package com.minor.alumini_platform.chat.controller;

import com.minor.alumini_platform.chat.dto.MessageResponse;
import com.minor.alumini_platform.chat.dto.SendMessageRequest;
import com.minor.alumini_platform.chat.model.Message;
import com.minor.alumini_platform.chat.service.MessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;
    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // send message (REST)
    @PostMapping
    public MessageResponse sendMessage(@RequestBody SendMessageRequest req) {
        Message saved = messageService.sendMessage(req);
        return messageService.toDto(saved); // if you make toDto public OR return saved mapped
    }

    // fetch history with pagination
    @GetMapping("/conversation/{conversationId}")
    public List<MessageResponse> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return messageService.getMessages(conversationId, page, size);
    }
}
