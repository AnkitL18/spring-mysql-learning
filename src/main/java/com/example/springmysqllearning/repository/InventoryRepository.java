package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface InventoryRepository
        extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    boolean existsByProductId(Long productId);

    Page<Inventory> findByCurrentStock(
            int stock,
            Pageable pageable
    );

    @Query("""
            SELECT i
            FROM Inventory i
            WHERE i.currentStock > 0
              AND i.currentStock <= i.reorderLevel
            """)
    Page<Inventory> findLowStock(
            Pageable pageable
    );
}