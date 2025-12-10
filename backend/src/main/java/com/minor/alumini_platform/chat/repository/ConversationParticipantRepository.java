// // package com.minor.alumini_platform.chat.repository;

// // import com.minor.alumini_platform.chat.model.Conversation;


// // import com.minor.alumini_platform.chat.model.ConversationParticipant;
// // import org.springframework.data.jpa.repository.JpaRepository;

// // import java.util.List;
// // import java.util.Optional;


// // public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {
// //     List<ConversationParticipant> findByConversationId(Long conversationId);
// //     // boolean existsByConversationIdAndParticipantId(Long conversationId, String participantId);
// //     boolean existsByConversationAndParticipantId(Long conversationId, String participantId);
// //     boolean existsByIdAndParticipants_ParticipantId(Long id, String participantId);


// // }
// package com.minor.alumini_platform.chat.repository;

// import com.minor.alumini_platform.chat.model.ConversationParticipant;
// import org.springframework.data.jpa.repository.JpaRepository;

// import java.util.List;

// public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

//     // Find all participants in a conversation
//     List<ConversationParticipant> findByConversationId(Long conversationId);

//     // Check if a participant already exists in a conversation
//     boolean existsByConversationIdAndParticipantId(Long conversationId, String participantId);

//     // Optional: find a specific participant in a conversation
//     ConversationParticipant findByConversationIdAndParticipantId(Long conversationId, String participantId);
// }

package com.minor.alumini_platform.chat.repository;

import com.minor.alumini_platform.chat.model.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    List<ConversationParticipant> findByConversationId(Long conversationId);

    boolean existsByConversationIdAndParticipantId(Long conversationId, String participantId);
}
