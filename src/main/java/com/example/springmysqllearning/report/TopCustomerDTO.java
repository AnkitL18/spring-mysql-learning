package com.example.springmysqllearning.report;

import java.math.BigDecimal;

public class TopCustomerDTO {

    private Long customerId;
    private String customerName;
    private Long totalOrders;
    private BigDecimal totalSpent;

    public TopCustomerDTO() {
    }

    public TopCustomerDTO(
            Long customerId,
            String customerName,
            Long totalOrders,
            BigDecimal totalSpent) {

        this.customerId = customerId;
        this.customerName = customerName;
        this.totalOrders = totalOrders;
        this.totalSpent = totalSpent;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }
}