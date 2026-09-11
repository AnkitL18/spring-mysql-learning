package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.AiAssistantRequestDTO;
import com.example.springmysqllearning.dto.AiConversationResponseDTO;
import com.example.springmysqllearning.dto.AiRequestDTO;
import com.example.springmysqllearning.dto.AiResponseDTO;
import com.example.springmysqllearning.service.AiConversationService;
import com.example.springmysqllearning.service.AiService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;

    private final AiConversationService
            aiConversationService;

    public AiController(
            AiService aiService,
            AiConversationService aiConversationService) {

        this.aiService =
                aiService;

        this.aiConversationService =
                aiConversationService;
    }

    // =========================================================
    // AI TEST
    // =========================================================

    @GetMapping("/test")
    public String test() {

        return "AI controller is working";
    }

    // =========================================================
    // STEP 13 — CONVERSATION ASSISTANT
    // =========================================================

    @PostMapping("/assistant")
    public AiResponseDTO businessAssistant(
            @Valid
            @RequestBody
            AiAssistantRequestDTO request) {

        return aiConversationService.sendMessage(
                request.getMessage(),
                request.getConversationId()
        );
    }

    // =========================================================
    // GET MY CONVERSATIONS
    // =========================================================

    @GetMapping("/conversations")
    public List<AiConversationResponseDTO>
    getMyConversations() {

        return aiConversationService
                .getMyConversations();
    }

    // =========================================================
    // GET ONE CONVERSATION
    // =========================================================

    @GetMapping("/conversations/{id}")
    public AiConversationResponseDTO
    getConversation(
            @PathVariable Long id) {

        return aiConversationService
                .getConversation(id);
    }

    // =========================================================
    // DELETE CONVERSATION
    // =========================================================

    @DeleteMapping("/conversations/{id}")
    public String deleteConversation(
            @PathVariable Long id) {

        aiConversationService
                .deleteConversation(id);

        return "AI conversation deleted successfully";
    }

    // =========================================================
    // OLD /ai/ask ENDPOINT
    // =========================================================

    @PostMapping("/ask")
    public AiResponseDTO askAi(
            @Valid
            @RequestBody
            AiRequestDTO request) {

        return aiService.askAi(
                request.getPrompt()
        );
    }
}