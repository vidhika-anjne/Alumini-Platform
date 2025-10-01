package com.minor.alumini_platform.chat.service;

import com.minor.alumini_platform.chat.model.Conversation;
import com.minor.alumini_platform.chat.model.ConversationParticipant;
import com.minor.alumini_platform.chat.repository.ConversationParticipantRepository;
import com.minor.alumini_platform.chat.repository.ConversationRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConversationParticipantService {
    private final ConversationParticipantRepository participantRepository;
    private final ConversationRepository conversationRepository;

    public ConversationParticipantService(ConversationParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
        this.conversationRepository = null;
    }

    public ConversationParticipant addParticipant(ConversationParticipant participant) {
        boolean exists = participantRepository
            .findByConversationId(participant.getConversation().getId())
            .stream()
            .anyMatch(p -> p.getParticipantId().equals(participant.getParticipantId()));

        if (exists) {
            throw new IllegalArgumentException("Participant already in this conversation");
        }

        return participantRepository.save(participant);
    }

     public List<ConversationParticipant> getParticipants(Long conversationId) {
        return participantRepository.findByConversationId(conversationId);
    }

    public List<Conversation> getUserConversations(String participantId) {
        return conversationRepository.findByParticipantsParticipantId(participantId);
    }

}
