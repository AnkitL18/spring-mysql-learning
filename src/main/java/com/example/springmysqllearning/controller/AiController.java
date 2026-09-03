package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.AiRequestDTO;
import com.example.springmysqllearning.dto.AiResponseDTO;
import com.example.springmysqllearning.service.AiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/test")
    public String test() {
        return "AI controller is working";
    }

    @PostMapping("/ask")
    public Object askAi(@RequestBody AiRequestDTO request) {

        try {

            return aiService.askAi(request.getPrompt());

        } catch (Exception e) {

            e.printStackTrace();

            return "ERROR: "
                    + e.getClass().getName()
                    + " | "
                    + e.getMessage();
        }
    }
}