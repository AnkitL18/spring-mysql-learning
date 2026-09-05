package com.example.springmysqllearning.report;

import java.math.BigDecimal;

public class DashboardSummaryDTO {

    private long totalCustomers;
    private long totalProducts;
    private long totalSuppliers;
    private long totalOrders;

    private long pendingOrders;
    private long confirmedOrders;
    private long completedOrders;

    private long lowStockProducts;
    private long outOfStockProducts;

    private BigDecimal totalSales;

    public DashboardSummaryDTO() {
    }

    public DashboardSummaryDTO(
            long totalCustomers,
            long totalProducts,
            long totalSuppliers,
            long totalOrders,
            long pendingOrders,
            long confirmedOrders,
            long completedOrders,
            long lowStockProducts,
            long outOfStockProducts,
            BigDecimal totalSales) {

        this.totalCustomers = totalCustomers;
        this.totalProducts = totalProducts;
        this.totalSuppliers = totalSuppliers;
        this.totalOrders = totalOrders;
        this.pendingOrders = pendingOrders;
        this.confirmedOrders = confirmedOrders;
        this.completedOrders = completedOrders;
        this.lowStockProducts = lowStockProducts;
        this.outOfStockProducts = outOfStockProducts;
        this.totalSales = totalSales;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public long getTotalSuppliers() {
        return totalSuppliers;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public long getConfirmedOrders() {
        return confirmedOrders;
    }

    public long getCompletedOrders() {
        return completedOrders;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public long getOutOfStockProducts() {
        return outOfStockProducts;
    }

    public BigDecimal getTotalSales() {
        return totalSales;
    }
}