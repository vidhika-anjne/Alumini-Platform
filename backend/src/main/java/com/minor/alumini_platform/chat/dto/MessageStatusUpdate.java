package com.minor.alumini_platform.chat.dto;

/**
 * DTO for updating message read/delivery status via WebSocket.
 * Used for WhatsApp-style read receipts (blue ticks).
 */
public class MessageStatusUpdate {
    private Long messageId;
    private Long conversationId;
    private String status; // SENT, DELIVERED, READ

    public MessageStatusUpdate() {}

    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
