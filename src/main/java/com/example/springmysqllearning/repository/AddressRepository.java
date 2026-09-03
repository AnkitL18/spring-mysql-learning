package com.example.springmysqllearning.repository;

import com.example.springmysqllearning.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository
        extends JpaRepository<Address, Long> {
}
