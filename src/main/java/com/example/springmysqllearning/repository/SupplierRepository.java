package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository
        extends JpaRepository<Supplier, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Page<Supplier> findByNameContainingIgnoreCase(
            String name,
            Pageable pageable
    );
}