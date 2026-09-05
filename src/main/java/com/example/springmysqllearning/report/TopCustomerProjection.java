package com.example.springmysqllearning.report;

import java.math.BigDecimal;

public interface TopCustomerProjection {

    Long getCustomerId();

    String getCustomerName();

    Long getTotalOrders();

    BigDecimal getTotalSpent();
}