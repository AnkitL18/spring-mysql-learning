package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.Order.OrderStatus;
import com.example.springmysqllearning.report.TopCustomerProjection;
import com.example.springmysqllearning.report.TopProductProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository
        extends JpaRepository<com.example.springmysqllearning.entity.Order, Long> {

    @Query("""
            SELECT new com.example.springmysqllearning.report.OrderStatusSummaryDTO(
                o.status,
                COUNT(o)
            )
            FROM Order o
            GROUP BY o.status
            ORDER BY o.status
            """)
    java.util.List<com.example.springmysqllearning.report.OrderStatusSummaryDTO>
    getOrderStatusSummary();

    @Query("""
            SELECT
                p.id AS productId,
                p.name AS productName,
                p.sku AS sku,
                SUM(oi.quantity) AS totalQuantity,
                SUM(oi.subtotal) AS totalRevenue
            FROM OrderItem oi
            JOIN oi.product p
            JOIN oi.order o
            WHERE o.status IN (
                :confirmed,
                :processing,
                :shipped,
                :delivered
            )
            GROUP BY p.id, p.name, p.sku
            ORDER BY SUM(oi.quantity) DESC
            """)
    Page<TopProductProjection> getTopProducts(
            OrderStatus confirmed,
            OrderStatus processing,
            OrderStatus shipped,
            OrderStatus delivered,
            Pageable pageable
    );

    @Query("""
            SELECT
                c.id AS customerId,
                c.name AS customerName,
                COUNT(o.id) AS totalOrders,
                SUM(o.totalAmount) AS totalSpent
            FROM Order o
            JOIN o.customer c
            WHERE o.status IN (
                :confirmed,
                :processing,
                :shipped,
                :delivered
            )
            GROUP BY c.id, c.name
            ORDER BY SUM(o.totalAmount) DESC
            """)
    Page<TopCustomerProjection> getTopCustomers(
            OrderStatus confirmed,
            OrderStatus processing,
            OrderStatus shipped,
            OrderStatus delivered,
            Pageable pageable
    );
}