package com.example.springmysqllearning.report;

import com.example.springmysqllearning.entity.Order.OrderStatus;

public class OrderStatusSummaryDTO {

    private OrderStatus status;
    private long count;

    public OrderStatusSummaryDTO() {
    }

    public OrderStatusSummaryDTO(
            OrderStatus status,
            long count) {

        this.status = status;
        this.count = count;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public long getCount() {
        return count;
    }
}