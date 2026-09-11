package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.AiConversationResponseDTO;
import com.example.springmysqllearning.dto.AiResponseDTO;
import com.example.springmysqllearning.entity.AiConversation;
import com.example.springmysqllearning.entity.AiMessage;
import com.example.springmysqllearning.entity.User;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.repository.AiConversationRepository;
import com.example.springmysqllearning.repository.AiMessageRepository;
import com.example.springmysqllearning.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiConversationService {

    private static final int MAX_HISTORY_MESSAGES = 20;

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    public AiConversationService(
            AiConversationRepository conversationRepository,
            AiMessageRepository messageRepository,
            UserRepository userRepository,
            AiService aiService) {

        this.conversationRepository =
                conversationRepository;

        this.messageRepository =
                messageRepository;

        this.userRepository =
                userRepository;

        this.aiService =
                aiService;
    }

    // =========================================================
    // SEND MESSAGE
    // =========================================================

    public AiResponseDTO sendMessage(
            String message,
            Long conversationId) {

        User user =
                getAuthenticatedUser();

        AiConversation conversation;

        // -----------------------------------------------------
        // Create new conversation
        // -----------------------------------------------------

        if (conversationId == null) {

            conversation =
                    new AiConversation();

            conversation.setUser(user);

            conversation.setTitle(
                    createTitle(message)
            );

            conversation =
                    conversationRepository.save(
                            conversation
                    );

        }

        // -----------------------------------------------------
        // Continue existing conversation
        // -----------------------------------------------------

        else {

            conversation =
                    conversationRepository
                            .findByIdAndUserId(
                                    conversationId,
                                    user.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "AI conversation not found"
                                    ));
        }

        // -----------------------------------------------------
        // Save USER message
        // -----------------------------------------------------

        AiMessage userMessage =
                new AiMessage();

        userMessage.setRole(
                AiMessage.MessageRole.USER
        );

        userMessage.setContent(message);

        conversation.addMessage(userMessage);

        messageRepository.save(userMessage);

        // -----------------------------------------------------
        // Load previous history
        // -----------------------------------------------------

        List<AiMessage> allMessages =
                messageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversation.getId()
                        );

        /*
         * Keep V1 history bounded.
         *
         * We only send the latest 20 messages to Gemini.
         */
        List<AiMessage> history =
                trimHistory(allMessages);

        // -----------------------------------------------------
        // Ask Gemini
        // -----------------------------------------------------

        String aiAnswer =
                aiService.generateConversationResponse(
                        message,
                        history
                );

        // -----------------------------------------------------
        // Save ASSISTANT message
        // -----------------------------------------------------

        AiMessage assistantMessage =
                new AiMessage();

        assistantMessage.setRole(
                AiMessage.MessageRole.ASSISTANT
        );

        assistantMessage.setContent(
                aiAnswer
        );

        conversation.addMessage(
                assistantMessage
        );

        messageRepository.save(
                assistantMessage
        );

        conversationRepository.save(
                conversation
        );

        return new AiResponseDTO(
                aiAnswer,
                conversation.getId()
        );
    }

    // =========================================================
    // GET MY CONVERSATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AiConversationResponseDTO>
    getMyConversations() {

        User user =
                getAuthenticatedUser();

        List<AiConversation> conversations =
                conversationRepository
                        .findByUserIdOrderByUpdatedAtDesc(
                                user.getId()
                        );

        return conversations
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET ONE CONVERSATION
    // =========================================================

    @Transactional(readOnly = true)
    public AiConversationResponseDTO
    getConversation(
            Long conversationId) {

        User user =
                getAuthenticatedUser();

        AiConversation conversation =
                conversationRepository
                        .findByIdAndUserId(
                                conversationId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "AI conversation not found"
                                ));

        return mapToResponse(
                conversation
        );
    }

    // =========================================================
    // DELETE CONVERSATION
    // =========================================================

    @Transactional
    public void deleteConversation(
            Long conversationId) {

        User user =
                getAuthenticatedUser();

        AiConversation conversation =
                conversationRepository
                        .findByIdAndUserId(
                                conversationId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "AI conversation not found"
                                ));

        conversationRepository.delete(
                conversation
        );
    }

    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || authentication.getName() == null) {

            throw new IllegalStateException(
                    "Authenticated user not found"
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found"
                        ));
    }

    // =========================================================
    // LIMIT HISTORY
    // =========================================================

    private List<AiMessage> trimHistory(
            List<AiMessage> messages) {

        if (messages.size()
                <= MAX_HISTORY_MESSAGES) {

            return messages;
        }

        return new ArrayList<>(
                messages.subList(
                        messages.size()
                                - MAX_HISTORY_MESSAGES,
                        messages.size()
                )
        );
    }

    // =========================================================
    // CREATE CONVERSATION TITLE
    // =========================================================

    private String createTitle(
            String message) {

        String cleaned =
                message
                        .replaceAll("\\s+", " ")
                        .trim();

        if (cleaned.length() <= 50) {
            return cleaned;
        }

        return cleaned.substring(
                0,
                47
        ) + "...";
    }

    // =========================================================
    // MAP ENTITY → DTO
    // =========================================================

    private AiConversationResponseDTO
    mapToResponse(
            AiConversation conversation) {

        List<AiConversationResponseDTO.MessageResponse>
                messages =
                conversation.getMessages()
                        .stream()
                        .map(message ->
                                new AiConversationResponseDTO
                                        .MessageResponse(
                                        message.getId(),
                                        message.getRole()
                                                .name(),
                                        message.getContent(),
                                        message.getCreatedAt()
                                )
                        )
                        .toList();

        return new AiConversationResponseDTO(
                conversation.getId(),
                conversation.getTitle(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt(),
                messages
        );
    }
}