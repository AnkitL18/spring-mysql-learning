package com.example.springmysqllearning.dto;

public class AiResponseDTO {

    private String response;

    public AiResponseDTO() {
    }

    public AiResponseDTO(String response) {
        this.response = response;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}