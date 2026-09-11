package com.example.springmysqllearning.service;

import com.example.springmysqllearning.entity.Order.OrderStatus;
import com.example.springmysqllearning.repository.CustomerRepository;
import com.example.springmysqllearning.repository.InventoryRepository;
import com.example.springmysqllearning.repository.OrderRepository;
import com.example.springmysqllearning.repository.ProductRepository;
import com.example.springmysqllearning.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class BusinessQueryService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;

    public BusinessQueryService(
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
    // DETECT QUERY TYPE
    // =========================================================

    public BusinessQueryType detectQueryType(
            String message) {

        if (message == null || message.isBlank()) {
            return BusinessQueryType.UNKNOWN;
        }

        String query =
                message.toLowerCase().trim();

        // -----------------------------------------------------
        // BUSINESS SUMMARY
        // -----------------------------------------------------

        if (query.contains("business summary")
                || query.contains("business overview")
                || query.contains("overall business")
                || query.contains("overall summary")
                || query.contains("business situation")) {

            return BusinessQueryType.BUSINESS_SUMMARY;
        }

        // -----------------------------------------------------
        // SALES
        // -----------------------------------------------------

        if (query.contains("sales")
                || query.contains("revenue")
                || query.contains("total sale")
                || query.contains("total sales")) {

            return BusinessQueryType.SALES;
        }

        // -----------------------------------------------------
        // ORDER STATUS
        // -----------------------------------------------------

        if (query.contains("order")
                && (query.contains("pending")
                || query.contains("confirmed")
                || query.contains("processing")
                || query.contains("shipped")
                || query.contains("delivered")
                || query.contains("cancelled")
                || query.contains("status"))) {

            return BusinessQueryType.ORDER_STATUS;
        }

        // -----------------------------------------------------
        // INVENTORY
        // -----------------------------------------------------

        if (query.contains("inventory")
                || query.contains("stock")
                || query.contains("low stock")
                || query.contains("out of stock")
                || query.contains("reorder")) {

            return BusinessQueryType.INVENTORY;
        }

        // -----------------------------------------------------
        // ENTITY COUNTS
        // -----------------------------------------------------

        if (query.contains("customer")
                || query.contains("customers")
                || query.contains("product")
                || query.contains("products")
                || query.contains("supplier")
                || query.contains("suppliers")
                || query.contains("how many")) {

            return BusinessQueryType.ENTITY_COUNTS;
        }

        return BusinessQueryType.UNKNOWN;
    }

    // =========================================================
    // EXECUTE APPROVED BUSINESS QUERY
    // =========================================================

    @Transactional(readOnly = true)
    public String executeQuery(
            BusinessQueryType queryType) {

        return switch (queryType) {

            case BUSINESS_SUMMARY ->
                    buildBusinessSummary();

            case SALES ->
                    buildSalesResult();

            case ORDER_STATUS ->
                    buildOrderStatusResult();

            case INVENTORY ->
                    buildInventoryResult();

            case ENTITY_COUNTS ->
                    buildEntityCounts();

            case UNKNOWN ->
                    "The requested business query is not currently supported.";
        };
    }

    // =========================================================
    // BUSINESS SUMMARY
    // =========================================================

    private String buildBusinessSummary() {

        long customers =
                customerRepository.count();

        long products =
                productRepository.count();

        long suppliers =
                supplierRepository.count();

        long orders =
                orderRepository.count();

        long lowStock =
                inventoryRepository.countLowStock();

        long outOfStock =
                inventoryRepository.countByCurrentStock(0);

        BigDecimal sales =
                calculateTotalSales();

        return """
                Business summary:

                Customers: %d
                Products: %d
                Suppliers: %d
                Orders: %d
                Low-stock products: %d
                Out-of-stock products: %d
                Total sales: %s
                """.formatted(
                customers,
                products,
                suppliers,
                orders,
                lowStock,
                outOfStock,
                sales.toPlainString()
        );
    }

    // =========================================================
    // SALES
    // =========================================================

    private String buildSalesResult() {

        BigDecimal sales =
                calculateTotalSales();

        return """
                Sales information:

                Total sales: %s
                """.formatted(
                sales.toPlainString()
        );
    }

    // =========================================================
    // ORDER STATUS
    // =========================================================

    private String buildOrderStatusResult() {

        long pending =
                orderRepository.countByStatus(
                        OrderStatus.PENDING
                );

        long confirmed =
                orderRepository.countByStatus(
                        OrderStatus.CONFIRMED
                );

        long processing =
                orderRepository.countByStatus(
                        OrderStatus.PROCESSING
                );

        long shipped =
                orderRepository.countByStatus(
                        OrderStatus.SHIPPED
                );

        long delivered =
                orderRepository.countByStatus(
                        OrderStatus.DELIVERED
                );

        long cancelled =
                orderRepository.countByStatus(
                        OrderStatus.CANCELLED
                );

        return """
                Order status information:

                Pending: %d
                Confirmed: %d
                Processing: %d
                Shipped: %d
                Delivered: %d
                Cancelled: %d
                """.formatted(
                pending,
                confirmed,
                processing,
                shipped,
                delivered,
                cancelled
        );
    }

    // =========================================================
    // INVENTORY
    // =========================================================

    private String buildInventoryResult() {

        long lowStock =
                inventoryRepository.countLowStock();

        long outOfStock =
                inventoryRepository.countByCurrentStock(0);

        return """
                Inventory information:

                Low-stock products: %d
                Out-of-stock products: %d
                """.formatted(
                lowStock,
                outOfStock
        );
    }

    // =========================================================
    // ENTITY COUNTS
    // =========================================================

    private String buildEntityCounts() {

        long customers =
                customerRepository.count();

        long products =
                productRepository.count();

        long suppliers =
                supplierRepository.count();

        long orders =
                orderRepository.count();

        return """
                Business entity counts:

                Customers: %d
                Products: %d
                Suppliers: %d
                Orders: %d
                """.formatted(
                customers,
                products,
                suppliers,
                orders
        );
    }

    // =========================================================
    // TOTAL SALES
    //
    // Uses the existing Step 9 repository method.
    // =========================================================

    private BigDecimal calculateTotalSales() {

        BigDecimal totalSales =
                orderRepository.calculateTotalSales(
                        OrderStatus.CONFIRMED,
                        OrderStatus.PROCESSING,
                        OrderStatus.SHIPPED,
                        OrderStatus.DELIVERED
                );

        if (totalSales == null) {
            return BigDecimal.ZERO;
        }

        return totalSales;
    }
}