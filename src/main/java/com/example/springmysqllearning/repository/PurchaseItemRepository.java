package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.PurchaseItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseItemRepository
        extends JpaRepository<PurchaseItem, Long> {
}