package com.minor.alumini_platform.chat.dto;

import java.util.Date;

public class ChatMessage {

    private String senderId;
    private String receiverId; // or conversationId
    private String content;
    private Date timestamp;

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        // TODO Auto-generated method stub
        this.timestamp = timestamp;
    }
}
