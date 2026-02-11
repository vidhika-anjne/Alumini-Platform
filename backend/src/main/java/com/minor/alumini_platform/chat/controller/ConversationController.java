package com.minor.alumini_platform.chat.controller;

import com.minor.alumini_platform.chat.model.Conversation;
import com.minor.alumini_platform.chat.service.ConversationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * DEPRECATED: Use ConversationRestController instead
 * This controller is kept for backwards compatibility but should not be used
 */
@RestController
@RequestMapping("/api/v1/conversations-legacy")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    public Conversation createConversation(@RequestBody Conversation conversation) {
        return conversationService.createConversation(conversation);
    }

    @GetMapping
    public List<Conversation> getAllConversations() {
        return conversationService.getAllConversations();
    }

    @GetMapping("/{id}")
    public Conversation getConversationById(@PathVariable Long id) {
        return conversationService.getConversationById(id);
    }
}