package com.example.springmysqllearning.dto;

import jakarta.validation.constraints.NotBlank;

public class AiAssistantRequestDTO {

    @NotBlank(message = "Message cannot be blank")
    private String message;

    /*
     * Null means:
     * create a new conversation.
     *
     * A valid ID means:
     * continue an existing conversation.
     */
    private Long conversationId;

    public AiAssistantRequestDTO() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }
}