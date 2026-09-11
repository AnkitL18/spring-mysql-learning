package com.example.springmysqllearning.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AiConversationResponseDTO {

    private Long id;

    private String title;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<MessageResponse> messages;

    public AiConversationResponseDTO() {
    }

    public AiConversationResponseDTO(
            Long id,
            String title,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<MessageResponse> messages) {

        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.messages = messages;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<MessageResponse> getMessages() {
        return messages;
    }

    public static class MessageResponse {

        private Long id;

        private String role;

        private String content;

        private LocalDateTime createdAt;

        public MessageResponse(
                Long id,
                String role,
                String content,
                LocalDateTime createdAt) {

            this.id = id;
            this.role = role;
            this.content = content;
            this.createdAt = createdAt;
        }

        public Long getId() {
            return id;
        }

        public String getRole() {
            return role;
        }

        public String getContent() {
            return content;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
    }
}