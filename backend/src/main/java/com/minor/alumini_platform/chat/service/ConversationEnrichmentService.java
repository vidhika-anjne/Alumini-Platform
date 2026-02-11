package com.minor.alumini_platform.chat.service;

import com.minor.alumini_platform.chat.dto.ConversationDTO;
import com.minor.alumini_platform.chat.dto.ParticipantDTO;
import com.minor.alumini_platform.chat.model.Conversation;
import com.minor.alumini_platform.chat.model.ConversationType;
import com.minor.alumini_platform.chat.repository.ConversationRepository;
import com.minor.alumini_platform.chat.repository.MessageRepository;
import com.minor.alumini_platform.repository.AlumniRepository;
import com.minor.alumini_platform.repository.SearchProfileRepository;
import com.minor.alumini_platform.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConversationEnrichmentService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MessageService messageService;
    private final SearchProfileRepository searchProfileRepository;
    private final AlumniRepository alumniRepository;
    private final StudentRepository studentRepository;

    public ConversationEnrichmentService(ConversationRepository conversationRepository,
                                        MessageRepository messageRepository,
                                        MessageService messageService,
                                        SearchProfileRepository searchProfileRepository,
                                        AlumniRepository alumniRepository,
                                        StudentRepository studentRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.messageService = messageService;
        this.searchProfileRepository = searchProfileRepository;
        this.alumniRepository = alumniRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> getUserConversationsEnriched(String userId) {
        List<Conversation> conversations = conversationRepository.findAllByParticipantIdWithParticipants(userId);
        return conversations.stream()
                .map(conv -> enrichConversationDTO(conv, userId))
                .sorted((a, b) -> {
                    // Sort by last message time, newest first
                    if (a.lastMessage != null && b.lastMessage != null) {
                        return b.lastMessage.sentAt.compareTo(a.lastMessage.sentAt);
                    }
                    if (a.lastMessage != null) return -1;
                    if (b.lastMessage != null) return 1;
                    return b.createdAt.compareTo(a.createdAt);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationDTO enrichConversationDTO(Conversation conv, String currentUserId) {
        ConversationDTO dto = new ConversationDTO();
        dto.id = conv.getId();
        dto.type = conv.getType();
        dto.createdAt = conv.getCreatedAt();
        
        // Get participant details - participants are already loaded via JOIN FETCH
        dto.participants = conv.getParticipants().stream()
            .map(p -> {
                ParticipantDTO pDto = new ParticipantDTO();
                pDto.participantId = p.getParticipantId();
                
                // Try to get name from search profile
                searchProfileRepository.findByEnrollmentNumber(p.getParticipantId())
                    .ifPresentOrElse(
                        profile -> {
                            pDto.name = profile.getName();
                            pDto.avatarUrl = profile.getAvatarUrl();
                            pDto.userType = profile.getUserType() != null ? profile.getUserType().name() : null;
                        },
                        () -> {
                            // Fallback: try alumni/student tables
                            alumniRepository.findByEnrollmentNumber(p.getParticipantId())
                                .ifPresentOrElse(
                                    alumni -> pDto.name = alumni.getName(),
                                    () -> studentRepository.findByEnrollmentNumber(p.getParticipantId())
                                        .ifPresent(student -> pDto.name = student.getName())
                                );
                            pDto.name = pDto.name != null ? pDto.name : p.getParticipantId();
                        }
                    );
                
                return pDto;
            })
            .collect(Collectors.toList());
        
        // For private chats, set the other participant's info
        if (conv.getType() == ConversationType.PRIVATE) {
            Optional<ParticipantDTO> otherParticipant = dto.participants.stream()
                .filter(p -> !p.participantId.equals(currentUserId))
                .findFirst();
            
            otherParticipant.ifPresent(p -> {
                dto.otherParticipantName = p.name;
                dto.otherParticipantId = p.participantId;
            });
        }
        
        // Get last message
        messageRepository.findTopByConversationIdOrderBySentAtDesc(conv.getId())
            .ifPresent(lastMsg -> dto.lastMessage = messageService.toDto(lastMsg));
        
        dto.unreadCount = 0; // TODO: implement unread count tracking
        
        return dto;
    }
}
