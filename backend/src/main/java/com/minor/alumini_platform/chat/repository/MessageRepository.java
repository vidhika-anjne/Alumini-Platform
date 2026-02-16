package com.minor.alumini_platform.chat.repository;


import com.minor.alumini_platform.chat.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId, Pageable pageable);

    /**
     * Finds messages OLDER than the specified cursor (id < cursor).
     * Returns messages in DESC order (newest first) which will be sorted by service.
     * The cursor message itself is EXCLUDED to prevent duplicates.
     */
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :convId AND m.id < :cursor ORDER BY m.id DESC")
    List<Message> findOlderMessages(@Param("convId") Long conversationId, @Param("cursor") Long cursor, Pageable pageable);
    
    /**
     * Finds the latest messages for a conversation.
     * Returns messages in DESC order (newest first) which will be sorted by service.
     */
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :convId ORDER BY m.id DESC")
    List<Message> findLatestMessages(@Param("convId") Long conversationId, Pageable pageable);

    long countByConversationId(Long conversationId);

    Optional<Message> findTopByConversationIdOrderBySentAtDesc(Long conversationId);
}
