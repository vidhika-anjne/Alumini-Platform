package com.minor.alumini_platform.chat.service;

import com.minor.alumini_platform.chat.dto.MessageResponse;
import com.minor.alumini_platform.chat.dto.SendMessageRequest;
import com.minor.alumini_platform.chat.model.*;
import com.minor.alumini_platform.chat.repository.*;
import com.minor.alumini_platform.service.ConnectionService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final ConnectionService connectionService;

    public MessageService(MessageRepository messageRepository,
                          ConversationRepository conversationRepository,
                          ConversationParticipantRepository participantRepository,
                          ConnectionService connectionService) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.connectionService = connectionService;
    }

    public Message sendMessage(SendMessageRequest req) {
        // basic validation: require content or mediaUrl
        if ((req.content == null || req.content.trim().isEmpty()) &&
            (req.mediaUrl == null || req.mediaUrl.trim().isEmpty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either content or mediaUrl must be provided");
        }

        // find conversation
        Conversation conv = conversationRepository.findById(req.conversationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        // check sender is participant
        boolean isParticipant = participantRepository.existsByConversationIdAndParticipantId(req.conversationId, req.senderId);
        if (!isParticipant) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sender is not a participant of the conversation");
        }

        // Block messages if not connected (for PRIVATE conversations)
        if (conv.getType() == ConversationType.PRIVATE) {
            String otherParticipantId = conv.getParticipants().stream()
                    .filter(p -> !p.getParticipantId().equals(req.senderId))
                    .map(p -> p.getParticipantId())
                    .findFirst()
                    .orElse(null);

            if (otherParticipantId != null && !connectionService.areConnected(req.senderId, otherParticipantId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You must be connected to send private messages");
            }
        }

        Message m = new Message();
        m.setConversation(conv);
        m.setSenderId(req.senderId);
        m.setContent(req.content);
        m.setMediaUrl(req.mediaUrl);
        m.setSentAt(LocalDateTime.now());
        m.setStatus(MessageStatus.SENT);

        Message saved = messageRepository.save(m);
        System.out.println("💾 Message saved to database: id=" + saved.getId() + ", conversationId=" + saved.getConversation().getId() + ", sender=" + saved.getSenderId());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long conversationId, int page, int size) {
        System.out.println("🔍 MessageService: Looking up conversation " + conversationId);
        conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        // Count total messages for this conversation
        long totalCount = messageRepository.countByConversationId(conversationId);
        System.out.println("🔍 MessageService: Total message count in DB for conversation " + conversationId + ": " + totalCount);

        System.out.println("🔍 MessageService: Querying messages for conversation " + conversationId + " (page=" + page + ", size=" + size + ")");
        List<Message> messages = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId, PageRequest.of(page, size));
        System.out.println("🔍 MessageService: Found " + messages.size() + " messages in database");
        
        // Log each message
        for (int i = 0; i < messages.size(); i++) {
            Message m = messages.get(i);
            System.out.println("  Message " + (i+1) + ": id=" + m.getId() + ", sender=" + m.getSenderId() + ", content=" + (m.getContent() != null ? m.getContent().substring(0, Math.min(20, m.getContent().length())) : "null") + "...");
        }
        
        List<MessageResponse> result = messages.stream().map(this::toDto).collect(Collectors.toList());
        System.out.println("🔍 MessageService: Mapped to " + result.size() + " DTOs");
        return result;
    }

    /**
     * Fetches messages with cursor-based pagination for WhatsApp-style infinite scroll.
     * 
     * Contract:
     * - If cursor is null: returns the LATEST 'limit' messages (newest ones)
     * - If cursor is provided: returns 'limit' messages OLDER than the cursor (id < cursor)
     * - Messages are ALWAYS returned in chronological order (oldest → newest by ID)
     * - Cursor message itself is EXCLUDED to prevent duplicates
     * 
     * @param conversationId The conversation to fetch messages from
     * @param cursor The message ID to fetch older messages from (null for initial load)
     * @param limit Maximum number of messages to return
     * @return List of messages in ascending order (oldest first)
     */
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessagesWithCursor(Long conversationId, Long cursor, int limit) {
        System.out.println("DEBUG getMessagesWithCursor: convId=" + conversationId + ", cursor=" + cursor + ", limit=" + limit);
        
        List<Message> messages;
        if (cursor == null || cursor == 0) {
            System.out.println("DEBUG: Fetching LATEST messages (initial load)");
            messages = messageRepository.findLatestMessages(conversationId, PageRequest.of(0, limit));
        } else {
            System.out.println("DEBUG: Fetching OLDER messages (before cursor " + cursor + ")");
            messages = messageRepository.findOlderMessages(conversationId, cursor, PageRequest.of(0, limit));
        }
        
        System.out.println("DEBUG: Found " + messages.size() + " messages in DB");
        if (!messages.isEmpty()) {
            System.out.println("DEBUG: Raw from DB - First id=" + messages.get(0).getId() + ", Last id=" + messages.get(messages.size()-1).getId());
        }
        
        // Sort by ID ascending to ensure strict chronological order (oldest → newest)
        // This is critical for frontend prepend logic and cursor-based pagination
        List<MessageResponse> result = messages.stream()
            .sorted((m1, m2) -> m1.getId().compareTo(m2.getId()))
            .map(this::toDto)
            .collect(Collectors.toList());
        
        if (!result.isEmpty()) {
            System.out.println("DEBUG: After sorting - First id=" + result.get(0).id + ", Last id=" + result.get(result.size()-1).id);
        }
        System.out.println("DEBUG: Returning " + result.size() + " DTOs in ascending order");
        return result;
    }

    public Message updateStatus(Long messageId, MessageStatus status) {
        Message m = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));
        m.setStatus(status);
        return messageRepository.save(m);
    }

    public MessageResponse toDto(Message m) {
        MessageResponse r = new MessageResponse();
        r.id = m.getId();
        r.senderId = m.getSenderId();
        r.content = m.getContent();
        r.mediaUrl = m.getMediaUrl();
        r.sentAt = m.getSentAt();
        r.conversationId = m.getConversation().getId();
        r.status = m.getStatus().name();
        return r;
    }
}
