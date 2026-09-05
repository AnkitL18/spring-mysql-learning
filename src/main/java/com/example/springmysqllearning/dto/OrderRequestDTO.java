package com.example.springmysqllearning.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class OrderRequestDTO {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequestDTO> items;

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<OrderItemRequestDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequestDTO> items) {
        this.items = items;
    }
}