package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.OrderRequestDTO;
import com.example.springmysqllearning.dto.OrderResponseDTO;
import com.example.springmysqllearning.entity.Order.OrderStatus;
import com.example.springmysqllearning.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(
            OrderService orderService) {

        this.orderService = orderService;
    }

    @PostMapping
    public OrderResponseDTO createOrder(
            @Valid @RequestBody OrderRequestDTO request) {

        return orderService.createOrder(request);
    }

    @GetMapping
    public Page<OrderResponseDTO> getOrders(
            @RequestParam(required = false)
            Long customerId,

            @RequestParam(required = false)
            OrderStatus status,

            Pageable pageable) {

        return orderService.getOrders(
                customerId,
                status,
                pageable
        );
    }

    @GetMapping("/{id}")
    public OrderResponseDTO getOrderById(
            @PathVariable Long id) {

        return orderService.getOrderById(id);
    }

    @PutMapping("/{id}/status")
    public OrderResponseDTO updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        return orderService.updateOrderStatus(
                id,
                status
        );
    }
}