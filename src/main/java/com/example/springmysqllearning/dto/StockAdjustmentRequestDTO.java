package com.example.springmysqllearning.dto;

import jakarta.validation.constraints.NotNull;

public class StockAdjustmentRequestDTO {

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    @NotNull(message = "Increase flag is required")
    private Boolean increase;

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Boolean getIncrease() {
        return increase;
    }

    public void setIncrease(Boolean increase) {
        this.increase = increase;
    }
}