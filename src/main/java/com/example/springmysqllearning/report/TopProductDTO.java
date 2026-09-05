package com.example.springmysqllearning.report;

import java.math.BigDecimal;

public class TopProductDTO {

    private Long productId;
    private String productName;
    private String sku;
    private Long totalQuantity;
    private BigDecimal totalRevenue;

    public TopProductDTO() {
    }

    public TopProductDTO(
            Long productId,
            String productName,
            String sku,
            Long totalQuantity,
            BigDecimal totalRevenue) {

        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.totalQuantity = totalQuantity;
        this.totalRevenue = totalRevenue;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getSku() {
        return sku;
    }

    public Long getTotalQuantity() {
        return totalQuantity;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
}