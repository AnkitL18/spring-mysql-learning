package com.example.springmysqllearning.dto;

import jakarta.validation.constraints.NotBlank;

public class AiAssistantRequestDTO {

    @NotBlank(message = "Message cannot be blank")
    private String message;

    public AiAssistantRequestDTO() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}