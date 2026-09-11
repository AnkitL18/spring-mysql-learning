package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.AiAssistantRequestDTO;
import com.example.springmysqllearning.dto.AiRequestDTO;
import com.example.springmysqllearning.dto.AiResponseDTO;
import com.example.springmysqllearning.service.AiService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;

    public AiController(
            AiService aiService) {

        this.aiService = aiService;
    }

    // =========================================================
    // TEST
    // =========================================================

    @GetMapping("/test")
    public String test() {

        return "AI controller is working";
    }

    // =========================================================
    // NATURAL-LANGUAGE BUSINESS ASSISTANT
    // =========================================================

    @PostMapping("/assistant")
    public AiResponseDTO businessAssistant(
            @Valid
            @RequestBody
            AiAssistantRequestDTO request) {

        return aiService.askBusinessAssistant(
                request.getMessage()
        );
    }

    // =========================================================
    // OLD ENDPOINT
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