package com.minor.alumini_platform.chat.dto;

public class MessageStatusUpdate {
    private Long messageId;
    private String status; // READ, DELIVERED

    public MessageStatusUpdate() {}

    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
