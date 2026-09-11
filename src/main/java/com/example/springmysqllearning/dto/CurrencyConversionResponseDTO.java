package com.example.springmysqllearning.dto;

import java.math.BigDecimal;

public class CurrencyConversionResponseDTO {

    private String from;

    private String to;

    private BigDecimal amount;

    private BigDecimal rate;

    private BigDecimal convertedAmount;

    public CurrencyConversionResponseDTO() {
    }

    public CurrencyConversionResponseDTO(
            String from,
            String to,
            BigDecimal amount,
            BigDecimal rate,
            BigDecimal convertedAmount) {

        this.from = from;
        this.to = to;
        this.amount = amount;
        this.rate = rate;
        this.convertedAmount = convertedAmount;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public BigDecimal getConvertedAmount() {
        return convertedAmount;
    }

    public void setConvertedAmount(
            BigDecimal convertedAmount) {

        this.convertedAmount =
                convertedAmount;
    }
}