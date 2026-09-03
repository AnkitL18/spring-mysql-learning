package com.example.springmysqllearning.dto;

import jakarta.validation.constraints.NotBlank;

public class AiRequestDTO {

    @NotBlank(message = "Prompt cannot be blank")
    private String prompt;

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
}