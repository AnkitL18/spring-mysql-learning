package com.example.springmysqllearning.dto;

public class AiResponseDTO {

    private String response;

    private Long conversationId;

    public AiResponseDTO() {
    }

    public AiResponseDTO(
            String response) {

        this.response = response;
    }

    public AiResponseDTO(
            String response,
            Long conversationId) {

        this.response = response;
        this.conversationId =
                conversationId;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(
            Long conversationId) {

        this.conversationId =
                conversationId;
    }
}