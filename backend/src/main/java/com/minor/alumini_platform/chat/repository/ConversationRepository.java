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

import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Find all conversations where a given user is a participant
    List<Conversation> findByParticipantsParticipantId(String participantId);

}
