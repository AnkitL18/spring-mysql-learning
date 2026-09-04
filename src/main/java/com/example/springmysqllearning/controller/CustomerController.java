package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.CustomerRequestDTO;
import com.example.springmysqllearning.dto.CustomerResponseDTO;
import com.example.springmysqllearning.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(
            CustomerService customerService) {

        this.customerService = customerService;
    }

    @PostMapping
    public CustomerResponseDTO createCustomer(
            @Valid @RequestBody CustomerRequestDTO request) {

        return customerService.createCustomer(request);
    }

    @GetMapping
    public Page<CustomerResponseDTO> getCustomers(
            @RequestParam(required = false) String search,
            Pageable pageable) {

        return customerService.getCustomers(
                search,
                pageable
        );
    }

    @GetMapping("/{id}")
    public CustomerResponseDTO getCustomerById(
            @PathVariable Long id) {

        return customerService.getCustomerById(id);
    }

    @PutMapping("/{id}")
    public CustomerResponseDTO updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequestDTO request) {

        return customerService.updateCustomer(
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    public void deleteCustomer(
            @PathVariable Long id) {

        customerService.deleteCustomer(id);
    }
}