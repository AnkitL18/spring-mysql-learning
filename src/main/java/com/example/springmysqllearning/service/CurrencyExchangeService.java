package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.CurrencyRateResponseDTO;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CurrencyExchangeService {

    private static final String FRANKFURTER_BASE_URL =
            "https://api.frankfurter.dev";

    private final RestClient restClient;

    public CurrencyExchangeService(
            RestClient.Builder restClientBuilder) {

        this.restClient =
                restClientBuilder
                        .baseUrl(FRANKFURTER_BASE_URL)
                        .build();
    }

    // =========================================================
    // GET EXCHANGE RATE
    // =========================================================

    public CurrencyRateResponseDTO getExchangeRate(
            String from,
            String to) {

        String base =
                normalizeCurrency(from);

        String quote =
                normalizeCurrency(to);

        return restClient
                .get()
                .uri(
                        uriBuilder ->
                                uriBuilder
                                        .path(
                                                "/v2/rate/{base}/{quote}"
                                        )
                                        .build(
                                                base,
                                                quote
                                        )
                )
                .retrieve()
                .onStatus(
                        HttpStatusCode::isError,
                        (request, response) -> {

                            throw new IllegalArgumentException(
                                    "External currency API returned HTTP "
                                            + response.getStatusCode().value()
                            );
                        }
                )
                .body(
                        CurrencyRateResponseDTO.class
                );
    }

    // =========================================================
    // CURRENCY CONVERSION
    // =========================================================

    public BigDecimal convert(
            String from,
            String to,
            BigDecimal amount) {

        if (amount == null) {

            throw new IllegalArgumentException(
                    "Amount cannot be null"
            );
        }

        if (amount.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Amount cannot be negative"
            );
        }

        CurrencyRateResponseDTO rateResponse =
                getExchangeRate(
                        from,
                        to
                );

        return amount
                .multiply(rateResponse.getRate())
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }

    // =========================================================
    // NORMALIZE CURRENCY
    // =========================================================

    private String normalizeCurrency(
            String currency) {

        if (currency == null
                || currency.isBlank()) {

            throw new IllegalArgumentException(
                    "Currency code cannot be blank"
            );
        }

        String normalized =
                currency
                        .trim()
                        .toUpperCase();

        /*
         * ISO currency codes are three characters.
         *
         * Example:
         * USD
         * INR
         * EUR
         * GBP
         */

        if (!normalized.matches("[A-Z]{3}")) {

            throw new IllegalArgumentException(
                    "Currency code must contain exactly 3 letters"
            );
        }

        return normalized;
    }
}