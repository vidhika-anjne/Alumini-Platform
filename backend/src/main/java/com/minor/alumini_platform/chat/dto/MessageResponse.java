package com.minor.alumini_platform.chat.dto;
import java.time.LocalDateTime;

public class MessageResponse {
    public Long id;
    public String senderId;
    public String content;
    public String mediaUrl;
    public LocalDateTime sentAt;
    public Long conversationId;
    public String status;
}
