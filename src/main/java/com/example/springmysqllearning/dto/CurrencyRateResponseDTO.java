package com.example.springmysqllearning.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CurrencyRateResponseDTO {

    private LocalDate date;

    private String base;

    private String quote;

    private BigDecimal rate;

    public CurrencyRateResponseDTO() {
    }

    public CurrencyRateResponseDTO(
            LocalDate date,
            String base,
            String quote,
            BigDecimal rate) {

        this.date = date;
        this.base = base;
        this.quote = quote;
        this.rate = rate;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getBase() {
        return base;
    }

    public void setBase(String base) {
        this.base = base;
    }

    public String getQuote() {
        return quote;
    }

    public void setQuote(String quote) {
        this.quote = quote;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }
}