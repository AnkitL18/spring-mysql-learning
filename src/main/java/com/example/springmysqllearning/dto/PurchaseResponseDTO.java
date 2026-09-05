package com.example.springmysqllearning.dto;

import com.example.springmysqllearning.entity.Purchase.PurchaseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseResponseDTO {

    private Long id;
    private Long supplierId;
    private String supplierName;
    private LocalDate purchaseDate;
    private PurchaseStatus status;
    private BigDecimal totalAmount;
    private List<PurchaseItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PurchaseResponseDTO() {
    }

    public PurchaseResponseDTO(
            Long id,
            Long supplierId,
            String supplierName,
            LocalDate purchaseDate,
            PurchaseStatus status,
            BigDecimal totalAmount,
            List<PurchaseItemResponse> items,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.purchaseDate = purchaseDate;
        this.status = status;
        this.totalAmount = totalAmount;
        this.items = items;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public PurchaseStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public List<PurchaseItemResponse> getItems() {
        return items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public static class PurchaseItemResponse {

        private Long id;
        private Long productId;
        private String productName;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;

        public PurchaseItemResponse(
                Long id,
                Long productId,
                String productName,
                String sku,
                Integer quantity,
                BigDecimal unitPrice,
                BigDecimal subtotal) {

            this.id = id;
            this.productId = productId;
            this.productName = productName;
            this.sku = sku;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.subtotal = subtotal;
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

        public Integer getQuantity() {
            return quantity;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public BigDecimal getSubtotal() {
            return subtotal;
        }
    }
}