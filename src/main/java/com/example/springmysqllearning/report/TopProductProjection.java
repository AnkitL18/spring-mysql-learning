package com.example.springmysqllearning.report;

import java.math.BigDecimal;

public interface TopProductProjection {

    Long getProductId();

    String getProductName();

    String getSku();

    Long getTotalQuantity();

    BigDecimal getTotalRevenue();
}