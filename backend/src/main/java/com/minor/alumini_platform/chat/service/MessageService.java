package com.minor.alumini_platform.chat.service;

import com.minor.alumini_platform.chat.dto.MessageResponse;
import com.minor.alumini_platform.chat.dto.SendMessageRequest;
import com.minor.alumini_platform.chat.model.*;
import com.minor.alumini_platform.chat.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;

    public MessageService(MessageRepository messageRepository,
                          ConversationRepository conversationRepository,
                          ConversationParticipantRepository participantRepository) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
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

        Message m = new Message();
        m.setConversation(conv);
        m.setSenderId(req.senderId);
        m.setContent(req.content);
        m.setMediaUrl(req.mediaUrl);

        return messageRepository.save(m);
    }

    public List<MessageResponse> getMessages(Long conversationId, int page, int size) {
        conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        List<Message> messages = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId, PageRequest.of(page, size));
        return messages.stream().map(this::toDto).collect(Collectors.toList());
    }

    public MessageResponse toDto(Message m) {
        MessageResponse r = new MessageResponse();
        r.id = m.getId();
        r.senderId = m.getSenderId();
        r.content = m.getContent();
        r.mediaUrl = m.getMediaUrl();
        r.sentAt = m.getSentAt();
        r.conversationId = m.getConversation().getId();
        return r;
    }
}
