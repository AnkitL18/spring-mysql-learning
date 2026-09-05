package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.OrderItemRequestDTO;
import com.example.springmysqllearning.dto.OrderRequestDTO;
import com.example.springmysqllearning.dto.OrderResponseDTO;
import com.example.springmysqllearning.entity.Customer;
import com.example.springmysqllearning.entity.Inventory;
import com.example.springmysqllearning.entity.Order;
import com.example.springmysqllearning.entity.Order.OrderStatus;
import com.example.springmysqllearning.entity.OrderItem;
import com.example.springmysqllearning.entity.Product;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.repository.CustomerRepository;
import com.example.springmysqllearning.repository.InventoryRepository;
import com.example.springmysqllearning.repository.OrderRepository;
import com.example.springmysqllearning.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            InventoryService inventoryService) {

        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public OrderResponseDTO createOrder(
            OrderRequestDTO request) {

        Customer customer =
                customerRepository.findById(
                                request.getCustomerId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found with id: "
                                                + request.getCustomerId()
                                ));

        Order order = new Order();

        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING);

        BigDecimal total =
                BigDecimal.ZERO;

        for (OrderItemRequestDTO itemRequest
                : request.getItems()) {

            Product product =
                    productRepository.findById(
                                    itemRequest.getProductId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Product not found with id: "
                                                    + itemRequest.getProductId()
                                    ));

            Inventory inventory =
                    inventoryRepository
                            .findByProductId(
                                    product.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Inventory not found for product id: "
                                                    + product.getId()
                                    ));

            /*
             * We validate stock at order creation,
             * but don't reduce it until confirmation.
             */
            if (inventory.getCurrentStock()
                    < itemRequest.getQuantity()) {

                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            BigDecimal unitPrice =
                    product.getPrice();

            BigDecimal subtotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    itemRequest.getQuantity()
                            )
                    );

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setProduct(product);
            orderItem.setQuantity(
                    itemRequest.getQuantity()
            );
            orderItem.setUnitPrice(unitPrice);
            orderItem.setSubtotal(subtotal);

            order.addItem(orderItem);

            total = total.add(subtotal);
        }

        order.setTotalAmount(total);

        Order savedOrder =
                orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getOrders(
            Long customerId,
            OrderStatus status,
            Pageable pageable) {

        Page<Order> orders;

        if (customerId != null) {

            orders =
                    orderRepository.findByCustomerId(
                            customerId,
                            pageable
                    );

        } else if (status != null) {

            orders =
                    orderRepository.findByStatus(
                            status,
                            pageable
                    );

        } else {

            orders =
                    orderRepository.findAll(pageable);
        }

        return orders.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with id: " + id
                                ));

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(
            Long id,
            OrderStatus newStatus) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with id: " + id
                                ));

        OrderStatus oldStatus =
                order.getStatus();

        if (oldStatus == newStatus) {
            return mapToResponse(order);
        }

        if (oldStatus == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Cancelled order cannot change status"
            );
        }

        if (oldStatus == OrderStatus.DELIVERED) {
            throw new IllegalArgumentException(
                    "Delivered order cannot change status"
            );
        }

        /*
         * Stock is reduced exactly when
         * the order becomes CONFIRMED.
         */
        if (newStatus == OrderStatus.CONFIRMED
                && oldStatus == OrderStatus.PENDING) {

            for (OrderItem item : order.getItems()) {

                inventoryService.decreaseStock(
                        item.getProduct().getId(),
                        item.getQuantity()
                );
            }
        }

        validateStatusTransition(
                oldStatus,
                newStatus
        );

        order.setStatus(newStatus);

        return mapToResponse(
                orderRepository.save(order)
        );
    }

    private void validateStatusTransition(
            OrderStatus oldStatus,
            OrderStatus newStatus) {

        boolean valid = false;

        if (oldStatus == OrderStatus.PENDING) {

            valid =
                    newStatus == OrderStatus.CONFIRMED
                            || newStatus == OrderStatus.CANCELLED;

        } else if (oldStatus == OrderStatus.CONFIRMED) {

            valid =
                    newStatus == OrderStatus.PROCESSING
                            || newStatus == OrderStatus.CANCELLED;

        } else if (oldStatus == OrderStatus.PROCESSING) {

            valid =
                    newStatus == OrderStatus.SHIPPED;

        } else if (oldStatus == OrderStatus.SHIPPED) {

            valid =
                    newStatus == OrderStatus.DELIVERED;
        }

        if (!valid) {

            throw new IllegalArgumentException(
                    "Invalid order status transition from "
                            + oldStatus
                            + " to "
                            + newStatus
            );
        }
    }

    private OrderResponseDTO mapToResponse(
            Order order) {

        List<OrderResponseDTO.OrderItemResponse>
                itemResponses =
                new ArrayList<>();

        for (OrderItem item :
                order.getItems()) {

            Product product =
                    item.getProduct();

            itemResponses.add(
                    new OrderResponseDTO.OrderItemResponse(
                            item.getId(),
                            product.getId(),
                            product.getName(),
                            product.getSku(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            item.getSubtotal()
                    )
            );
        }

        return new OrderResponseDTO(
                order.getId(),
                order.getCustomer().getId(),
                order.getCustomer().getName(),
                order.getStatus(),
                order.getTotalAmount(),
                itemResponses,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}