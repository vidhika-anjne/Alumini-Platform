package com.minor.alumini_platform.chat.controller;

import com.minor.alumini_platform.chat.dto.ConversationDTO;
import com.minor.alumini_platform.chat.dto.MessageResponse;
import com.minor.alumini_platform.chat.model.Conversation;
import com.minor.alumini_platform.chat.model.ConversationParticipant;
import com.minor.alumini_platform.chat.model.ConversationType;
import com.minor.alumini_platform.chat.repository.ConversationParticipantRepository;
import com.minor.alumini_platform.chat.repository.ConversationRepository;
import com.minor.alumini_platform.chat.service.ConversationEnrichmentService;
import com.minor.alumini_platform.chat.service.MessageService;
import com.minor.alumini_platform.service.ConnectionService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/conversations")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ConversationRestController {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageService messageService;
    private final ConnectionService connectionService;
    private final ConversationEnrichmentService conversationEnrichmentService;

    public ConversationRestController(ConversationRepository conversationRepository,
                                      ConversationParticipantRepository participantRepository,
                                      MessageService messageService,
                                      ConnectionService connectionService,
                                      ConversationEnrichmentService conversationEnrichmentService) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageService = messageService;
        this.connectionService = connectionService;
        this.conversationEnrichmentService = conversationEnrichmentService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createConversation(@RequestBody Map<String, String> req) {
        Map<String, Object> response = new HashMap<>();
        try {
            String typeStr = req.getOrDefault("type", "PRIVATE");
            ConversationType type = ConversationType.valueOf(typeStr.toUpperCase());
            
            Conversation conv = new Conversation();
            conv.setType(type);
            Conversation saved = conversationRepository.save(conv);
            
            response.put("id", saved.getId());
            response.put("type", saved.getType().name());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    @PostMapping("/private/{targetId}")
    public ResponseEntity<?> startPrivateConversation(Principal principal, @PathVariable String targetId) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        
        String currentUserId = principal.getName();
        
        // Verify connection exists and is accepted
        if (!connectionService.areConnected(currentUserId, targetId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "You must be connected with this user to start a conversation"
            ));
        }
        
        // 1. Check if already exists
        Optional<Conversation> existing = conversationRepository.findPrivateBetween(currentUserId, targetId);
        if (existing.isPresent()) {
            ConversationDTO dto = conversationEnrichmentService.enrichConversationDTO(existing.get(), currentUserId);
            return ResponseEntity.ok(dto);
        }

        // 2. Create new
        Conversation conv = new Conversation();
        conv.setType(ConversationType.PRIVATE);
        conv.setCreatedAt(LocalDateTime.now());
        Conversation saved = conversationRepository.save(conv);

        // 3. Add participants
        ConversationParticipant p1 = new ConversationParticipant();
        p1.setConversation(saved);
        p1.setParticipantId(currentUserId);
        participantRepository.save(p1);

        ConversationParticipant p2 = new ConversationParticipant();
        p2.setConversation(saved);
        p2.setParticipantId(targetId);
        participantRepository.save(p2);

        // Reload to get participants
        saved = conversationRepository.findByIdWithParticipants(saved.getId()).orElse(saved);
        ConversationDTO dto = conversationEnrichmentService.enrichConversationDTO(saved, currentUserId);
        
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            Principal principal) {
        System.out.println("🌐 GET /api/v1/conversations/" + id + "/messages called");
        System.out.println("🌐 Principal: " + (principal != null ? principal.getName() : "null"));
        System.out.println("🌐 Params: page=" + page + ", size=" + size);
        
        try {
            System.out.println("📥 Fetching messages for conversation: " + id + " (page=" + page + ", size=" + size + ")");
            
            // Verify user is a participant of this conversation
            if (principal != null) {
                String userId = principal.getName();
                boolean isParticipant = participantRepository.existsByConversationIdAndParticipantId(id, userId);
                if (!isParticipant) {
                    System.out.println("❌ User " + userId + " is not a participant of conversation " + id);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
                System.out.println("✅ User " + userId + " is a participant");
            }
            
            List<MessageResponse> messages = messageService.getMessages(id, page, size);
            System.out.println("✅ Returning " + messages.size() + " messages");
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("❌ Error fetching messages for conversation " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(404).build();
        }
    }
}
