package com.minor.alumini_platform.chat.controller;

import com.minor.alumini_platform.chat.dto.ConversationDTO;
import com.minor.alumini_platform.chat.model.Conversation;
import com.minor.alumini_platform.chat.model.ConversationParticipant;
import com.minor.alumini_platform.chat.repository.ConversationParticipantRepository;
import com.minor.alumini_platform.chat.repository.ConversationRepository;
import com.minor.alumini_platform.chat.service.ConversationEnrichmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/participants")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ParticipantRestController {

    private final ConversationParticipantRepository participantRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationEnrichmentService conversationEnrichmentService;

    public ParticipantRestController(ConversationParticipantRepository participantRepository,
                                    ConversationRepository conversationRepository,
                                    ConversationEnrichmentService conversationEnrichmentService) {
        this.participantRepository = participantRepository;
        this.conversationRepository = conversationRepository;
        this.conversationEnrichmentService = conversationEnrichmentService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addParticipant(@RequestBody Map<String, Object> req) {
        try {
            String participantId = (String) req.get("participantId");
            Object convObj = req.get("conversation");
            Long convId = null;

            if (convObj instanceof Map) {
                Map<?, ?> convMap = (Map<?, ?>) convObj;
                Object idObj = convMap.get("id");
                if (idObj instanceof Number) {
                    convId = ((Number) idObj).longValue();
                }
            }

            if (convId == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Conversation ID is missing or invalid"));
            }

            Conversation conv = conversationRepository.findById(convId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

            ConversationParticipant existing = participantRepository.findByConversationIdAndParticipantId(convId, participantId);
            if (existing != null) {
                return ResponseEntity.ok(Map.of("message", "Participant already exists", "success", true));
            }

            ConversationParticipant participant = new ConversationParticipant();
            participant.setConversation(conv);
            participant.setParticipantId(participantId);
            participantRepository.save(participant);

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}/conversations")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@PathVariable String userId, Principal principal) {
        try {
            // Verify user is requesting their own conversations
            if (principal != null && !principal.getName().equals(userId)) {
                return ResponseEntity.status(403).build();
            }

            List<ConversationDTO> conversationDTOs = conversationEnrichmentService.getUserConversationsEnriched(userId);
            return ResponseEntity.ok(conversationDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }

    @GetMapping("/me/conversations")
    public ResponseEntity<List<ConversationDTO>> getMyConversations(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).build();
            }

            String userId = principal.getName();
            List<ConversationDTO> conversationDTOs = conversationEnrichmentService.getUserConversationsEnriched(userId);
            return ResponseEntity.ok(conversationDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }
}
