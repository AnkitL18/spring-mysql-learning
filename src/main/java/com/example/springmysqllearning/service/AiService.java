package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.AiResponseDTO;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private final Client geminiClient;

    public AiService() {

        System.out.println(">>> Creating Gemini client...");

        geminiClient = Client.builder()
                .apiKey(System.getenv("GEMINI_API_KEY"))
                .build();

        System.out.println(">>> Gemini client created");
    }

    public AiResponseDTO askAi(String prompt) {

        System.out.println(">>> Gemini prompt: " + prompt);

        GenerateContentResponse response =
                geminiClient.models.generateContent(
                        "gemini-3.7-flash",
                        prompt,
                        null
                );

        return new AiResponseDTO(response.text());
    }
}