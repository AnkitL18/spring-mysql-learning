package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.Purchase;
import com.example.springmysqllearning.entity.Purchase.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRepository
        extends JpaRepository<Purchase, Long> {

    Page<Purchase> findBySupplierId(
            Long supplierId,
            Pageable pageable
    );

    Page<Purchase> findByStatus(
            PurchaseStatus status,
            Pageable pageable
    );
}