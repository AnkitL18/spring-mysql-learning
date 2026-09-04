package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.AiResponseDTO;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private final Client geminiClient;

    public AiService() {
        geminiClient = Client.builder()
                .apiKey(System.getenv("GEMINI_API_KEY"))
                .build();
    }

    public AiResponseDTO askAi(String prompt) {

        GenerateContentResponse response =
                geminiClient.models.generateContent(
                        "gemini-3.5-flash-lite",
                        prompt,
                        null
                );

        return new AiResponseDTO(response.text());
    }
}