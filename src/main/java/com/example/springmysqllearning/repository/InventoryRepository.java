package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface InventoryRepository
        extends JpaRepository<Inventory, Long> {

    // =========================================================
    // NORMAL READ
    // =========================================================

    Optional<Inventory> findByProductId(Long productId);

    boolean existsByProductId(Long productId);

    // =========================================================
    // LOCKED READ
    //
    // PESSIMISTIC_WRITE tells the database to lock the
    // inventory row while the current transaction is using it.
    // =========================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM Inventory i
            WHERE i.product.id = :productId
            """)
    Optional<Inventory> findByProductIdForUpdate(Long productId);

    // =========================================================
    // INVENTORY LISTING
    // =========================================================

    Page<Inventory> findByCurrentStock(
            int stock,
            Pageable pageable
    );

    long countByCurrentStock(int stock);

    // =========================================================
    // LOW STOCK
    // =========================================================

    @Query("""
            SELECT i
            FROM Inventory i
            WHERE i.currentStock > 0
              AND i.currentStock <= i.reorderLevel
            """)
    Page<Inventory> findLowStock(
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(i)
            FROM Inventory i
            WHERE i.currentStock > 0
              AND i.currentStock <= i.reorderLevel
            """)
    long countLowStock();
}