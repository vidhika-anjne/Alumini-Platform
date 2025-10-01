package com.minor.alumini_platform.chat.controller;

import com.minor.alumini_platform.chat.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Date;


@Controller
public class ChatController {

    @MessageMapping("/sendMessage")       // Client sends here
    @SendTo("/topic/messages")            // Broadcast here
    public ChatMessage sendMessage(ChatMessage message) {
        message.setTimestamp(new Date());
        // Save to DB (messages table)
        return message;
    }
}

