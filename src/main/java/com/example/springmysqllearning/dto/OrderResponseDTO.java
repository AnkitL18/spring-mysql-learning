package com.example.springmysqllearning.dto;

import com.example.springmysqllearning.entity.Order.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponseDTO {

    private Long id;
    private Long customerId;
    private String customerName;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderResponseDTO() {
    }

    public OrderResponseDTO(
            Long id,
            Long customerId,
            String customerName,
            OrderStatus status,
            BigDecimal totalAmount,
            List<OrderItemResponse> items,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.status = status;
        this.totalAmount = totalAmount;
        this.items = items;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public static class OrderItemResponse {

        private Long id;
        private Long productId;
        private String productName;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;

        public OrderItemResponse(
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