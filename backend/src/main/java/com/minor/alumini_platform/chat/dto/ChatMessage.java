package com.minor.alumini_platform.chat.dto;

import java.util.Date;

public class ChatMessage {
    private String senderId;
    private String receiverId; // or conversationId
    private String content;
    private Date timestamp;
    public void setTimestamp(Date date) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTimestamp'");
    }
}
