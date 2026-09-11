package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.AiResponseDTO;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private final Client geminiClient;
    private final BusinessContextService businessContextService;

    /*
     * Keep the model that is already working in your project.
     *
     * You previously confirmed:
     * gemini-3.5-flash-lite
     * works with your Gemini setup.
     */
    private static final String MODEL =
            "gemini-3.5-flash-lite";

    public AiService(
            BusinessContextService businessContextService) {

        this.businessContextService =
                businessContextService;

        String apiKey =
                System.getenv("GEMINI_API_KEY");

        if (apiKey == null
                || apiKey.isBlank()) {

            throw new IllegalStateException(
                    "GEMINI_API_KEY environment variable is not configured"
            );
        }

        this.geminiClient =
                Client.builder()
                        .apiKey(apiKey)
                        .build();
    }

    // =========================================================
    // BUSINESS ASSISTANT
    // =========================================================

    public AiResponseDTO askBusinessAssistant(
            String userMessage) {

        if (userMessage == null
                || userMessage.isBlank()) {

            throw new IllegalArgumentException(
                    "Message cannot be blank"
            );
        }

        String businessContext =
                businessContextService
                        .buildBusinessContext();

        String systemInstruction = """
                You are the AI Business Assistant inside
                an AI-Powered Business Operations Management System.

                Your job is to help a business user understand
                their operational data clearly and practically.

                RULES:

                1. Use the supplied BUSINESS DATA as the source
                   of truth for business numbers.

                2. Never invent sales, inventory, customer,
                   product, supplier, or order numbers.

                3. If the supplied business data does not contain
                   enough information to answer a question,
                   clearly say that the available business context
                   does not contain enough information.

                4. Do not claim that you performed an operation
                   such as creating an order, changing stock,
                   deleting a customer, or updating a purchase.

                5. You are an assistant, not an authorization system.
                   Never tell the user to bypass application security.

                6. Keep business answers clear, useful, and concise.

                7. When discussing low-stock products, use the
                   actual low-stock details supplied below.

                8. Distinguish between facts from the database
                   and general business suggestions.

                BUSINESS DATA:

                %s
                """.formatted(
                businessContext
        );

        Content systemContent =
                Content.builder()
                        .role("system")
                        .parts(
                                java.util.List.of(
                                        Part.builder()
                                                .text(systemInstruction)
                                                .build()
                                )
                        )
                        .build();

        GenerateContentConfig config =
                GenerateContentConfig.builder()
                        .systemInstruction(systemContent)
                        .build();

        GenerateContentResponse response =
                geminiClient.models.generateContent(
                        MODEL,
                        userMessage,
                        config
                );

        String answer =
                response.text();

        if (answer == null
                || answer.isBlank()) {

            answer =
                    "Gemini returned an empty response.";
        }

        return new AiResponseDTO(answer);
    }

    // =========================================================
    // OLD GENERIC METHOD
    // =========================================================
    //
    // Kept temporarily so your old /ai/ask endpoint
    // does not immediately break.
    //
    // =========================================================

    public AiResponseDTO askAi(String prompt) {

        return askBusinessAssistant(prompt);
    }
}