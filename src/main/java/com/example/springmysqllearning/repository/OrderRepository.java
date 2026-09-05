package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.Order;
import com.example.springmysqllearning.entity.Order.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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
}