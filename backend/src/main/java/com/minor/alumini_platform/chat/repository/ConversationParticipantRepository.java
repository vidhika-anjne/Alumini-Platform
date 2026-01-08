package com.minor.alumini_platform.chat.repository;

import com.minor.alumini_platform.chat.model.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    List<ConversationParticipant> findByConversationId(Long conversationId);

    boolean existsByConversationIdAndParticipantId(Long conversationId, String participantId);
}
