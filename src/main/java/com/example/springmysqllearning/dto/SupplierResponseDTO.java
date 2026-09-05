package com.example.springmysqllearning.dto;

import java.time.LocalDateTime;

public class SupplierResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String company;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SupplierResponseDTO() {
    }

    public SupplierResponseDTO(
            Long id,
            String name,
            String email,
            String phone,
            String company,
            String address,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.company = company;
        this.address = address;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getCompany() {
        return company;
    }

    public String getAddress() {
        return address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}