package com.minor.alumini_platform.chat.dto;

public class SendMessageRequest {
    public Long conversationId;
    public String senderId;
    public String content;     // optional if mediaUrl provided
    public String mediaUrl;    // optional
}
