package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.AiResponseDTO;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiService {

    private final Client geminiClient;
    private final BusinessContextService businessContextService;
    private final BusinessQueryService businessQueryService;

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

        if (apiKey == null || apiKey.isBlank()) {

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
    // NATURAL-LANGUAGE BUSINESS QUERY
    // =========================================================

    public AiResponseDTO askBusinessAssistant(
            String userMessage) {

        if (userMessage == null
                || userMessage.isBlank()) {

            throw new IllegalArgumentException(
                    "Message cannot be blank"
            );
        }

        // -----------------------------------------------------
        // STEP 1 — Detect the business operation
        // -----------------------------------------------------

        BusinessQueryType queryType =
                businessQueryService.detectQueryType(
                        userMessage
                );

        // -----------------------------------------------------
        // STEP 2 — Execute approved Java query
        // -----------------------------------------------------

        String businessResult =
                businessQueryService.executeQuery(
                        queryType
                );

        // -----------------------------------------------------
        // STEP 3 — Add general business context
        // -----------------------------------------------------

        String generalContext =
                businessContextService
                        .buildBusinessContext();

        // -----------------------------------------------------
        // STEP 4 — Give Gemini the real facts
        // -----------------------------------------------------

        String systemInstruction = """
                You are the AI Business Assistant inside
                an AI-Powered Business Operations Management System.

                The Java backend has already determined the
                business query and retrieved the relevant data.

                RULES:

                1. Treat Java-retrieved data as the source of truth.

                2. Never invent or change business numbers.

                3. Do not claim that you performed a database
                   operation or changed business data.

                4. Explain the supplied results in natural,
                   easy-to-understand business language.

                5. If the requested query is unsupported,
                   clearly say that this type of question is
                   not currently supported.

                6. Do not generate SQL.

                7. Do not ask the user to provide database details.

                8. Clearly distinguish factual business data
                   from general recommendations.

                DETECTED QUERY TYPE:
                %s

                JAVA BUSINESS QUERY RESULT:
                %s

                GENERAL BUSINESS CONTEXT:
                %s
                """.formatted(
                queryType,
                businessResult,
                generalContext
        );

        Content systemContent =
                Content.builder()
                        .role("system")
                        .parts(
                                List.of(
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
    // OLD METHOD
    // =========================================================

    public AiResponseDTO askAi(
            String prompt) {

        return askBusinessAssistant(prompt);
    }
}