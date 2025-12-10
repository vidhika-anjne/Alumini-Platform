package com.minor.alumini_platform.chat.repository;


import com.minor.alumini_platform.chat.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId, Pageable pageable);

    long countByConversationId(Long conversationId);
}
