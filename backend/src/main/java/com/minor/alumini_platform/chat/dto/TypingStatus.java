package com.minor.alumini_platform.chat.dto;

public class TypingStatus {
    private String senderId;
    private String conversationId;
    private boolean typing;

    public TypingStatus() {}

    public TypingStatus(String senderId, String conversationId, boolean typing) {
        this.senderId = senderId;
        this.conversationId = conversationId;
        this.typing = typing;
    }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public boolean isTyping() { return typing; }
    public void setTyping(boolean typing) { this.typing = typing; }
}
