// package com.minor.alumini_platform.chat.repository;


// import com.minor.alumini_platform.chat.model.Conversation;
// // import com.minor.alumini_platform.chat.model.ConversationParticipant;

// import org.springframework.data.jpa.repository.JpaRepository;
// import java.util.List;
// import java.util.Optional;

// public interface ConversationRepository extends JpaRepository<Conversation, Long> {
//     boolean existsByIdAndParticipantId(Long id, String participantId);
//     Optional<Conversation> findById(Long id);
//     // List<ConversationParticipant> findByConversationId(Long conversationId);
//     List<Conversation> findByParticipantsParticipantId(String participantId);
// }

package com.minor.alumini_platform.chat.repository;

import com.minor.alumini_platform.chat.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Find all conversations where a given user is a participant
    List<Conversation> findByParticipantsParticipantId(String participantId);

    @Query("SELECT DISTINCT c FROM Conversation c LEFT JOIN FETCH c.participants WHERE c.type = 'PRIVATE' " +
           "AND EXISTS (SELECT p1 FROM ConversationParticipant p1 WHERE p1.conversation = c AND p1.participantId = :u1) " +
           "AND EXISTS (SELECT p2 FROM ConversationParticipant p2 WHERE p2.conversation = c AND p2.participantId = :u2)")
    Optional<Conversation> findPrivateBetween(@Param("u1") String u1, @Param("u2") String u2);

    @Query("SELECT DISTINCT c FROM Conversation c LEFT JOIN FETCH c.participants WHERE c.id = :id")
    Optional<Conversation> findByIdWithParticipants(@Param("id") Long id);

    @Query("SELECT DISTINCT c FROM Conversation c " +
           "LEFT JOIN FETCH c.participants p " +
           "WHERE EXISTS (SELECT cp FROM ConversationParticipant cp WHERE cp.conversation = c AND cp.participantId = :userId)")
    List<Conversation> findAllByParticipantIdWithParticipants(@Param("userId") String userId);
}
