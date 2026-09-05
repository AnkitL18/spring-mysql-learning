package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {
}