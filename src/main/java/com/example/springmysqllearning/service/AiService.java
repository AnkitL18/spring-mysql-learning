package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.AiResponseDTO;
import com.example.springmysqllearning.entity.AiMessage;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiService {

    private final Client geminiClient;

    private final BusinessContextService
            businessContextService;

    private final BusinessQueryService
            businessQueryService;

    private static final String MODEL =
            "gemini-3.5-flash-lite";

    public AiService(
            BusinessContextService businessContextService,
            BusinessQueryService businessQueryService) {

        this.businessContextService =
                businessContextService;

        this.businessQueryService =
                businessQueryService;

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
    // STEP 13 — CONVERSATION RESPONSE
    // =========================================================

    public String generateConversationResponse(
            String userMessage,
            List<AiMessage> history) {

        if (userMessage == null
                || userMessage.isBlank()) {

            throw new IllegalArgumentException(
                    "Message cannot be blank"
            );
        }

        // -----------------------------------------------------
        // STEP 1 — Detect business intent
        // -----------------------------------------------------

        BusinessQueryType queryType =
                businessQueryService
                        .detectQueryType(
                                userMessage
                        );

        // -----------------------------------------------------
        // STEP 2 — Execute approved Java query
        // -----------------------------------------------------

        String businessResult =
                businessQueryService
                        .executeQuery(
                                queryType
                        );

        // -----------------------------------------------------
        // STEP 3 — Gather general business context
        // -----------------------------------------------------

        String businessContext =
                businessContextService
                        .buildBusinessContext();

        // -----------------------------------------------------
        // STEP 4 — System instruction
        // -----------------------------------------------------

        String systemInstruction = """
                You are the AI Business Assistant inside
                an AI-Powered Business Operations Management System.

                The Java backend owns the business data.

                RULES:

                1. Treat Java-retrieved business information
                   as the source of truth.

                2. Never invent business numbers.

                3. Never claim that you changed inventory,
                   created an order, cancelled an order,
                   changed a purchase, or performed another
                   database operation.

                4. Use the conversation history to understand
                   references such as:
                   "it", "that product", "those orders",
                   "what about them", etc.

                5. The conversation history is context only.
                   The latest Java-retrieved business result
                   should be preferred for current business facts.

                6. Do not generate SQL.

                7. Do not ask the user for database credentials
                   or database implementation details.

                8. If the requested business information is
                   unavailable, clearly say so.

                9. Clearly separate actual business facts from
                   general business recommendations.

                DETECTED QUERY TYPE:
                %s

                JAVA BUSINESS QUERY RESULT:
                %s

                CURRENT BUSINESS CONTEXT:
                %s
                """.formatted(
                queryType,
                businessResult,
                businessContext
        );

        Content systemContent =
                Content.builder()
                        .role("system")
                        .parts(
                                List.of(
                                        Part.builder()
                                                .text(
                                                        systemInstruction
                                                )
                                                .build()
                                )
                        )
                        .build();

        // -----------------------------------------------------
        // STEP 5 — Build conversation history
        // -----------------------------------------------------

        List<Content> contents =
                new ArrayList<>();

        for (AiMessage message :
                history) {

            String role =
                    message.getRole()
                            == AiMessage.MessageRole.USER
                            ? "user"
                            : "model";

            contents.add(
                    Content.builder()
                            .role(role)
                            .parts(
                                    List.of(
                                            Part.builder()
                                                    .text(
                                                            message.getContent()
                                                    )
                                                    .build()
                                    )
                            )
                            .build()
            );
        }

        // -----------------------------------------------------
        // STEP 6 — Add current user message
        // -----------------------------------------------------

        contents.add(
                Content.builder()
                        .role("user")
                        .parts(
                                List.of(
                                        Part.builder()
                                                .text(userMessage)
                                                .build()
                                )
                        )
                        .build()
        );

        // -----------------------------------------------------
        // STEP 7 — Generate response
        // -----------------------------------------------------

        GenerateContentConfig config =
                GenerateContentConfig.builder()
                        .systemInstruction(
                                systemContent
                        )
                        .build();

        GenerateContentResponse response =
                geminiClient.models.generateContent(
                        MODEL,
                        contents,
                        config
                );

        String answer =
                response.text();

        if (answer == null
                || answer.isBlank()) {

            return "Gemini returned an empty response.";
        }

        return answer;
    }

    // =========================================================
    // OLD /ai/ask SUPPORT
    // =========================================================

    public AiResponseDTO askAi(
            String prompt) {

        String answer =
                generateConversationResponse(
                        prompt,
                        List.of()
                );

        return new AiResponseDTO(answer);
    }
}