package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.SupplierRequestDTO;
import com.example.springmysqllearning.dto.SupplierResponseDTO;
import com.example.springmysqllearning.entity.Supplier;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.repository.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(
            SupplierRepository supplierRepository) {

        this.supplierRepository = supplierRepository;
    }

    public SupplierResponseDTO createSupplier(
            SupplierRequestDTO request) {

        if (supplierRepository.existsByEmailIgnoreCase(
                request.getEmail())) {

            throw new IllegalArgumentException(
                    "Supplier with this email already exists"
            );
        }

        Supplier supplier = new Supplier();

        supplier.setName(request.getName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setCompany(request.getCompany());
        supplier.setAddress(request.getAddress());

        Supplier savedSupplier =
                supplierRepository.save(supplier);

        return mapToResponse(savedSupplier);
    }

    public Page<SupplierResponseDTO> getSuppliers(
            String search,
            Pageable pageable) {

        Page<Supplier> suppliers;

        if (search == null || search.isBlank()) {

            suppliers =
                    supplierRepository.findAll(pageable);

        } else {

            suppliers =
                    supplierRepository
                            .findByNameContainingIgnoreCase(
                                    search,
                                    pageable
                            );
        }

        return suppliers.map(this::mapToResponse);
    }

    public SupplierResponseDTO getSupplierById(Long id) {

        Supplier supplier =
                supplierRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Supplier not found with id: " + id
                                ));

        return mapToResponse(supplier);
    }

    public SupplierResponseDTO updateSupplier(
            Long id,
            SupplierRequestDTO request) {

        Supplier supplier =
                supplierRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Supplier not found with id: " + id
                                ));

        if (!supplier.getEmail().equalsIgnoreCase(
                request.getEmail())
                && supplierRepository.existsByEmailIgnoreCase(
                request.getEmail())) {

            throw new IllegalArgumentException(
                    "Supplier with this email already exists"
            );
        }

        supplier.setName(request.getName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setCompany(request.getCompany());
        supplier.setAddress(request.getAddress());

        Supplier updatedSupplier =
                supplierRepository.save(supplier);

        return mapToResponse(updatedSupplier);
    }

    public void deleteSupplier(Long id) {

        Supplier supplier =
                supplierRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Supplier not found with id: " + id
                                ));

        supplierRepository.delete(supplier);
    }

    private SupplierResponseDTO mapToResponse(
            Supplier supplier) {

        return new SupplierResponseDTO(
                supplier.getId(),
                supplier.getName(),
                supplier.getEmail(),
                supplier.getPhone(),
                supplier.getCompany(),
                supplier.getAddress(),
                supplier.getCreatedAt(),
                supplier.getUpdatedAt()
        );
    }
}