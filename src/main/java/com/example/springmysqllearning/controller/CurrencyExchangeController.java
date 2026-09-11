package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.CurrencyConversionResponseDTO;
import com.example.springmysqllearning.dto.CurrencyRateResponseDTO;
import com.example.springmysqllearning.service.CurrencyExchangeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/external/currency")
public class CurrencyExchangeController {

    private final CurrencyExchangeService
            currencyExchangeService;

    public CurrencyExchangeController(
            CurrencyExchangeService currencyExchangeService) {

        this.currencyExchangeService =
                currencyExchangeService;
    }

    // =========================================================
    // GET EXCHANGE RATE
    // =========================================================

    @GetMapping("/rate")
    public ResponseEntity<CurrencyRateResponseDTO>
    getExchangeRate(
            @RequestParam String from,
            @RequestParam String to) {

        CurrencyRateResponseDTO response =
                currencyExchangeService
                        .getExchangeRate(
                                from,
                                to
                        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // CONVERT CURRENCY
    // =========================================================

    @GetMapping("/convert")
    public ResponseEntity<CurrencyConversionResponseDTO>
    convertCurrency(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam BigDecimal amount) {

        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Amount must be greater than or equal to 0"
            );
        }

        CurrencyRateResponseDTO rateResponse =
                currencyExchangeService
                        .getExchangeRate(
                                from,
                                to
                        );

        BigDecimal convertedAmount =
                amount
                        .multiply(rateResponse.getRate())
                        .setScale(
                                2,
                                java.math.RoundingMode.HALF_UP
                        );

        CurrencyConversionResponseDTO response =
                new CurrencyConversionResponseDTO(
                        rateResponse.getBase(),
                        rateResponse.getQuote(),
                        amount,
                        rateResponse.getRate(),
                        convertedAmount
                );

        return ResponseEntity.ok(response);
    }
}