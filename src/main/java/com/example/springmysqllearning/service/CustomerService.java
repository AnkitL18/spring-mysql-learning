package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.CustomerRequestDTO;
import com.example.springmysqllearning.dto.CustomerResponseDTO;
import com.example.springmysqllearning.entity.Customer;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerResponseDTO createCustomer(
            CustomerRequestDTO request) {

        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Customer with this email already exists"
            );
        }

        Customer customer = new Customer();

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setCompany(request.getCompany());
        customer.setAddress(request.getAddress());

        Customer savedCustomer =
                customerRepository.save(customer);

        return mapToResponse(savedCustomer);
    }

    public Page<CustomerResponseDTO> getCustomers(
            String search,
            Pageable pageable) {

        Page<Customer> customers;

        if (search == null || search.isBlank()) {
            customers = customerRepository.findAll(pageable);
        } else {
            customers =
                    customerRepository
                            .findByNameContainingIgnoreCase(
                                    search,
                                    pageable
                            );
        }

        return customers.map(this::mapToResponse);
    }

    public CustomerResponseDTO getCustomerById(Long id) {

        Customer customer =
                customerRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found with id: " + id
                                ));

        return mapToResponse(customer);
    }

    public CustomerResponseDTO updateCustomer(
            Long id,
            CustomerRequestDTO request) {

        Customer customer =
                customerRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found with id: " + id
                                ));

        if (!customer.getEmail().equals(request.getEmail())
                && customerRepository.existsByEmail(
                request.getEmail())) {

            throw new IllegalArgumentException(
                    "Customer with this email already exists"
            );
        }

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setCompany(request.getCompany());
        customer.setAddress(request.getAddress());

        Customer updatedCustomer =
                customerRepository.save(customer);

        return mapToResponse(updatedCustomer);
    }

    public void deleteCustomer(Long id) {

        Customer customer =
                customerRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found with id: " + id
                                ));

        customerRepository.delete(customer);
    }

    private CustomerResponseDTO mapToResponse(
            Customer customer) {

        return new CustomerResponseDTO(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getCompany(),
                customer.getAddress(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}