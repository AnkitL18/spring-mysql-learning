package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.SupplierRequestDTO;
import com.example.springmysqllearning.dto.SupplierResponseDTO;
import com.example.springmysqllearning.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(
            SupplierService supplierService) {

        this.supplierService = supplierService;
    }

    @PostMapping
    public SupplierResponseDTO createSupplier(
            @Valid @RequestBody SupplierRequestDTO request) {

        return supplierService.createSupplier(request);
    }

    @GetMapping
    public Page<SupplierResponseDTO> getSuppliers(
            @RequestParam(required = false) String search,
            Pageable pageable) {

        return supplierService.getSuppliers(
                search,
                pageable
        );
    }

    @GetMapping("/{id}")
    public SupplierResponseDTO getSupplierById(
            @PathVariable Long id) {

        return supplierService.getSupplierById(id);
    }

    @PutMapping("/{id}")
    public SupplierResponseDTO updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequestDTO request) {

        return supplierService.updateSupplier(
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    public void deleteSupplier(
            @PathVariable Long id) {

        supplierService.deleteSupplier(id);
    }
}