package com.example.springmysqllearning.dto;

import java.time.LocalDateTime;

public class InventoryResponseDTO {

    private Long id;
    private Long productId;
    private String productName;
    private String sku;

    private Integer currentStock;
    private Integer reorderLevel;
    private Integer maximumStock;

    private String stockStatus;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InventoryResponseDTO() {
    }

    public InventoryResponseDTO(
            Long id,
            Long productId,
            String productName,
            String sku,
            Integer currentStock,
            Integer reorderLevel,
            Integer maximumStock,
            String stockStatus,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.currentStock = currentStock;
        this.reorderLevel = reorderLevel;
        this.maximumStock = maximumStock;
        this.stockStatus = stockStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
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

    public Integer getCurrentStock() {
        return currentStock;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public Integer getMaximumStock() {
        return maximumStock;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}