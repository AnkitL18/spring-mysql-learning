package com.example.springmysqllearning.service;

import com.example.springmysqllearning.entity.Order.OrderStatus;
import com.example.springmysqllearning.report.*;
import com.example.springmysqllearning.repository.CustomerRepository;
import com.example.springmysqllearning.repository.InventoryRepository;
import com.example.springmysqllearning.repository.ProductRepository;
import com.example.springmysqllearning.repository.ReportRepository;
import com.example.springmysqllearning.repository.SupplierRepository;
import com.example.springmysqllearning.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReportService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final ReportRepository reportRepository;

    public ReportService(
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            SupplierRepository supplierRepository,
            OrderRepository orderRepository,
            InventoryRepository inventoryRepository,
            ReportRepository reportRepository) {

        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.reportRepository = reportRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary() {

        long totalCustomers =
                customerRepository.count();

        long totalProducts =
                productRepository.count();

        long totalSuppliers =
                supplierRepository.count();

        long totalOrders =
                orderRepository.count();

        long pendingOrders =
                orderRepository.countByStatus(
                        OrderStatus.PENDING
                );

        long confirmedOrders =
                orderRepository.countByStatus(
                        OrderStatus.CONFIRMED
                );

        long completedOrders =
                orderRepository.countByStatus(
                        OrderStatus.DELIVERED
                );

        long lowStockProducts =
                inventoryRepository.countLowStock();

        long outOfStockProducts =
                inventoryRepository.countByCurrentStock(0);

        BigDecimal totalSales =
                orderRepository.calculateTotalSales(
                        OrderStatus.CONFIRMED,
                        OrderStatus.PROCESSING,
                        OrderStatus.SHIPPED,
                        OrderStatus.DELIVERED
                );

        if (totalSales == null) {
            totalSales = BigDecimal.ZERO;
        }

        return new DashboardSummaryDTO(
                totalCustomers,
                totalProducts,
                totalSuppliers,
                totalOrders,
                pendingOrders,
                confirmedOrders,
                completedOrders,
                lowStockProducts,
                outOfStockProducts,
                totalSales
        );
    }

    @Transactional(readOnly = true)
    public Page<TopProductDTO> getTopProducts(
            Pageable pageable) {

        return reportRepository.getTopProducts(
                        OrderStatus.CONFIRMED,
                        OrderStatus.PROCESSING,
                        OrderStatus.SHIPPED,
                        OrderStatus.DELIVERED,
                        pageable
                )
                .map(projection ->
                        new TopProductDTO(
                                projection.getProductId(),
                                projection.getProductName(),
                                projection.getSku(),
                                projection.getTotalQuantity(),
                                projection.getTotalRevenue()
                        )
                );
    }

    @Transactional(readOnly = true)
    public Page<TopCustomerDTO> getTopCustomers(
            Pageable pageable) {

        return reportRepository.getTopCustomers(
                        OrderStatus.CONFIRMED,
                        OrderStatus.PROCESSING,
                        OrderStatus.SHIPPED,
                        OrderStatus.DELIVERED,
                        pageable
                )
                .map(projection ->
                        new TopCustomerDTO(
                                projection.getCustomerId(),
                                projection.getCustomerName(),
                                projection.getTotalOrders(),
                                projection.getTotalSpent()
                        )
                );
    }

    @Transactional(readOnly = true)
    public List<OrderStatusSummaryDTO>
    getOrderStatusSummary() {

        return reportRepository
                .getOrderStatusSummary();
    }

    @Transactional(readOnly = true)
    public Page<com.example.springmysqllearning.dto.InventoryResponseDTO>
    getLowStockProducts(Pageable pageable) {

        return inventoryRepository
                .findLowStock(pageable)
                .map(inventory -> {

                    return new com.example.springmysqllearning.dto.InventoryResponseDTO(
                            inventory.getId(),
                            inventory.getProduct().getId(),
                            inventory.getProduct().getName(),
                            inventory.getProduct().getSku(),
                            inventory.getCurrentStock(),
                            inventory.getReorderLevel(),
                            inventory.getMaximumStock(),
                            calculateStockStatus(inventory),
                            inventory.getCreatedAt(),
                            inventory.getUpdatedAt()
                    );
                });
    }

    private String calculateStockStatus(
            com.example.springmysqllearning.entity.Inventory inventory) {

        if (inventory.getCurrentStock() == 0) {
            return "OUT_OF_STOCK";
        }

        if (inventory.getCurrentStock()
                <= inventory.getReorderLevel()) {

            return "LOW_STOCK";
        }

        return "IN_STOCK";
    }
}