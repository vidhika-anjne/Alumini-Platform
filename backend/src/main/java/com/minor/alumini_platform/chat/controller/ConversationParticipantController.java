package com.minor.alumini_platform.chat.controller;

// package com.minor.alumini_platform.controller;

import com.minor.alumini_platform.chat.model.Conversation;
import com.minor.alumini_platform.chat.model.ConversationParticipant;
import com.minor.alumini_platform.chat.service.ConversationParticipantService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/participants")
public class ConversationParticipantController {

    private final ConversationParticipantService participantService;

    public ConversationParticipantController(ConversationParticipantService participantService) {
        this.participantService = participantService;
    }

    // Add participant to conversation
    @PostMapping
    public ConversationParticipant addParticipant(@RequestBody ConversationParticipant participant) {
        return participantService.addParticipant(participant);
    }

    // Get all participants of a conversation
    @GetMapping("/conversation/{conversationId}")
    public List<ConversationParticipant> getParticipants(@PathVariable Long conversationId) {
        return participantService.getParticipants(conversationId);
    }

    @GetMapping("/user/{participantId}/conversations")
    public List<Conversation> getUserConversations(@PathVariable String participantId) {
        return participantService.getUserConversations(participantId);
    }
}
