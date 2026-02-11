package com.minor.alumini_platform.chat.dto;

import com.minor.alumini_platform.chat.model.ConversationType;
import java.time.LocalDateTime;
import java.util.List;

public class ConversationDTO {
    public Long id;
    public ConversationType type;
    public LocalDateTime createdAt;
    public List<ParticipantDTO> participants;
    public MessageResponse lastMessage;
    public int unreadCount;
    public String otherParticipantName;
    public String otherParticipantId;
}
