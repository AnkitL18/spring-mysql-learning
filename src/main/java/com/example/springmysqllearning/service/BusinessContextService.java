package com.example.springmysqllearning.service;

import com.example.springmysqllearning.entity.Inventory;
import com.example.springmysqllearning.entity.Order.OrderStatus;
import com.example.springmysqllearning.repository.CustomerRepository;
import com.example.springmysqllearning.repository.InventoryRepository;
import com.example.springmysqllearning.repository.OrderRepository;
import com.example.springmysqllearning.repository.ProductRepository;
import com.example.springmysqllearning.repository.SupplierRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BusinessContextService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;

    public BusinessContextService(
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            SupplierRepository supplierRepository,
            InventoryRepository inventoryRepository,
            OrderRepository orderRepository) {

        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
        this.orderRepository = orderRepository;
    }

    // =========================================================
    // BUILD BUSINESS CONTEXT
    // =========================================================

    @Transactional(readOnly = true)
    public String buildBusinessContext() {

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

        long processingOrders =
                orderRepository.countByStatus(
                        OrderStatus.PROCESSING
                );

        long shippedOrders =
                orderRepository.countByStatus(
                        OrderStatus.SHIPPED
                );

        long deliveredOrders =
                orderRepository.countByStatus(
                        OrderStatus.DELIVERED
                );

        long cancelledOrders =
                orderRepository.countByStatus(
                        OrderStatus.CANCELLED
                );

        long outOfStockProducts =
                inventoryRepository.countByCurrentStock(0);

        long lowStockProducts =
                inventoryRepository.countLowStock();

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

        List<Inventory> lowStockInventory =
                inventoryRepository.findLowStock(
                        PageRequest.of(0, 5)
                ).getContent();

        StringBuilder context =
                new StringBuilder();

        context.append("""
                BUSINESS DATA
                =============

                IMPORTANT:
                The following values come directly from the application's database.
                Treat them as the source of truth.
                Do not invent or modify these numbers.

                BUSINESS SUMMARY
                ----------------
                Total customers: %d
                Total products: %d
                Total suppliers: %d
                Total orders: %d

                ORDER STATUS
                ------------
                Pending orders: %d
                Confirmed orders: %d
                Processing orders: %d
                Shipped orders: %d
                Delivered orders: %d
                Cancelled orders: %d

                INVENTORY
                ---------
                Low-stock products: %d
                Out-of-stock products: %d

                SALES
                -----
                Total sales: %s

                """.formatted(
                totalCustomers,
                totalProducts,
                totalSuppliers,
                totalOrders,
                pendingOrders,
                confirmedOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                lowStockProducts,
                outOfStockProducts,
                totalSales.toPlainString()
        ));

        // =====================================================
        // LOW-STOCK PRODUCT DETAILS
        // =====================================================

        context.append(
                "LOW-STOCK PRODUCT DETAILS\n"
        );

        context.append(
                "-------------------------\n"
        );

        if (lowStockInventory.isEmpty()) {

            context.append(
                    "No products are currently low in stock.\n"
            );

        } else {

            for (Inventory inventory :
                    lowStockInventory) {

                if (inventory.getProduct() == null) {
                    continue;
                }

                context.append(
                        "- Product: "
                );

                context.append(
                        inventory.getProduct().getName()
                );

                context.append(
                        ", SKU: "
                );

                context.append(
                        inventory.getProduct().getSku()
                );

                context.append(
                        ", Current stock: "
                );

                context.append(
                        inventory.getCurrentStock()
                );

                context.append(
                        ", Reorder level: "
                );

                context.append(
                        inventory.getReorderLevel()
                );

                context.append("\n");
            }
        }

        return context.toString();
    }
}