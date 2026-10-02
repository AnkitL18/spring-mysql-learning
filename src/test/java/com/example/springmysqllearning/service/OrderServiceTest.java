package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.OrderItemRequestDTO;
import com.example.springmysqllearning.dto.OrderRequestDTO;
import com.example.springmysqllearning.entity.Customer;
import com.example.springmysqllearning.entity.Inventory;
import com.example.springmysqllearning.entity.Order;
import com.example.springmysqllearning.entity.Product;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.repository.CustomerRepository;
import com.example.springmysqllearning.repository.InventoryRepository;
import com.example.springmysqllearning.repository.OrderRepository;
import com.example.springmysqllearning.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createOrder_shouldCreatePendingOrderAndCalculateTotal() {

        Customer customer = new Customer();
        customer.setId(1L);

        Product product = new Product();
        product.setId(10L);
        product.setName("Laptop");
        product.setPrice(new BigDecimal("50000"));

        Inventory inventory = new Inventory();
        inventory.setCurrentStock(10);

        when(customerRepository.findById(1L))
                .thenReturn(Optional.of(customer));

        when(productRepository.findById(10L))
                .thenReturn(Optional.of(product));

        when(inventoryRepository.findByProductId(10L))
                .thenReturn(Optional.of(inventory));

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> {
                    Order order = invocation.getArgument(0);
                    order.setId(100L);
                    return order;
                });

        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO();
        itemRequest.setProductId(10L);
        itemRequest.setQuantity(2);

        OrderRequestDTO request = new OrderRequestDTO();
        request.setCustomerId(1L);
        request.setItems(List.of(itemRequest));

        var response = orderService.createOrder(request);

        assertEquals(100L, response.getId());
        assertEquals(new BigDecimal("100000"), response.getTotalAmount());

        verify(customerRepository).findById(1L);
        verify(productRepository).findById(10L);
        verify(inventoryRepository).findByProductId(10L);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_shouldThrowExceptionWhenCustomerDoesNotExist() {

        when(customerRepository.findById(1L))
                .thenReturn(Optional.empty());

        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO();
        itemRequest.setProductId(10L);
        itemRequest.setQuantity(1);

        OrderRequestDTO request = new OrderRequestDTO();
        request.setCustomerId(1L);
        request.setItems(List.of(itemRequest));

        assertThrows(
                ResourceNotFoundException.class,
                () -> orderService.createOrder(request)
        );

        verify(customerRepository).findById(1L);
        verifyNoInteractions(productRepository);
        verifyNoInteractions(orderRepository);
    }

    @Test
    void createOrder_shouldRejectInsufficientStock() {

        Customer customer = new Customer();
        customer.setId(1L);

        Product product = new Product();
        product.setId(10L);
        product.setName("Laptop");
        product.setPrice(new BigDecimal("50000"));

        Inventory inventory = new Inventory();
        inventory.setCurrentStock(2);

        when(customerRepository.findById(1L))
                .thenReturn(Optional.of(customer));

        when(productRepository.findById(10L))
                .thenReturn(Optional.of(product));

        when(inventoryRepository.findByProductId(10L))
                .thenReturn(Optional.of(inventory));

        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO();
        itemRequest.setProductId(10L);
        itemRequest.setQuantity(5);

        OrderRequestDTO request = new OrderRequestDTO();
        request.setCustomerId(1L);
        request.setItems(List.of(itemRequest));

        assertThrows(
                IllegalArgumentException.class,
                () -> orderService.createOrder(request)
        );

        verify(orderRepository, never()).save(any(Order.class));
    }
}