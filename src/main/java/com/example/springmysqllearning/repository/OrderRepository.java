package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.Order;
import com.example.springmysqllearning.entity.Order.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
public interface OrderRepository
        extends JpaRepository<Order, Long> {

    Page<Order> findByCustomerId(
            Long customerId,
            Pageable pageable
    );

    Page<Order> findByStatus(
            OrderStatus status,
            Pageable pageable
    );
    long countByStatus(OrderStatus status);
    @Query("""
        SELECT SUM(o.totalAmount)
        FROM Order o
        WHERE o.status IN (
            :confirmed,
            :processing,
            :shipped,
            :delivered
        )
        """)
    BigDecimal calculateTotalSales(
            OrderStatus confirmed,
            OrderStatus processing,
            OrderStatus shipped,
            OrderStatus delivered
    );
}