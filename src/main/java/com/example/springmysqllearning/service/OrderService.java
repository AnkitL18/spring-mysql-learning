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
import com.example.springmysqllearning.exception.InsufficientStockException;
import com.example.springmysqllearning.exception.InvalidOrderStatusException;
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

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository) {

        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

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

        Order order =
                new Order();

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
                    inventoryRepository.findByProductId(
                                    product.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Inventory not found for product id: "
                                                    + product.getId()
                                    ));

            /*
             * We only CHECK stock here.
             *
             * Stock is actually deducted when the order
             * moves from PENDING → CONFIRMED.
             */
            if (inventory.getCurrentStock()
                    < itemRequest.getQuantity()) {

                throw new InsufficientStockException(
                        "Insufficient stock for product: "
                                + product.getName()
                                + ". Available: "
                                + inventory.getCurrentStock()
                                + ", Required: "
                                + itemRequest.getQuantity()
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

            total =
                    total.add(subtotal);
        }

        order.setTotalAmount(total);

        Order savedOrder =
                orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    // =========================================================
    // GET ORDERS
    // =========================================================

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

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(
            Long id) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with id: "
                                                + id
                                ));

        return mapToResponse(order);
    }

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @Transactional
    public OrderResponseDTO updateOrderStatus(
            Long orderId,
            OrderStatus newStatus) {

        if (newStatus == null) {

            throw new IllegalArgumentException(
                    "New order status cannot be null"
            );
        }

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with id: "
                                                + orderId
                                ));

        OrderStatus currentStatus =
                order.getStatus();

        // -----------------------------------------------------
        // Same status = no operation
        // -----------------------------------------------------

        if (currentStatus == newStatus) {
            return mapToResponse(order);
        }

        // -----------------------------------------------------
        // Terminal states
        // -----------------------------------------------------

        if (currentStatus == OrderStatus.DELIVERED) {

            throw new InvalidOrderStatusException(
                    "Delivered order cannot be changed"
            );
        }

        if (currentStatus == OrderStatus.CANCELLED) {

            throw new InvalidOrderStatusException(
                    "Cancelled order cannot be changed"
            );
        }

        // -----------------------------------------------------
        // Validate transition
        // -----------------------------------------------------

        validateStatusTransition(
                currentStatus,
                newStatus
        );

        // -----------------------------------------------------
        // PENDING → CONFIRMED
        //
        // LOCK each inventory row before checking/decreasing.
        // -----------------------------------------------------

        if (currentStatus == OrderStatus.PENDING
                && newStatus == OrderStatus.CONFIRMED) {

            for (OrderItem item :
                    order.getItems()) {

                Inventory inventory =
                        inventoryRepository
                                .findByProductIdForUpdate(
                                        item.getProduct().getId()
                                )
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Inventory not found for product id: "
                                                        + item.getProduct().getId()
                                        ));

                int currentStock =
                        inventory.getCurrentStock();

                if (currentStock
                        < item.getQuantity()) {

                    throw new InsufficientStockException(
                            "Insufficient stock for product: "
                                    + item.getProduct().getName()
                                    + ". Available: "
                                    + currentStock
                                    + ", Required: "
                                    + item.getQuantity()
                    );
                }

                inventory.setCurrentStock(
                        currentStock
                                - item.getQuantity()
                );

                inventoryRepository.save(inventory);
            }
        }

        // -----------------------------------------------------
        // CONFIRMED → CANCELLED
        //
        // Restore stock.
        // -----------------------------------------------------

        if (currentStatus == OrderStatus.CONFIRMED
                && newStatus == OrderStatus.CANCELLED) {

            for (OrderItem item :
                    order.getItems()) {

                Inventory inventory =
                        inventoryRepository
                                .findByProductIdForUpdate(
                                        item.getProduct().getId()
                                )
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Inventory not found for product id: "
                                                        + item.getProduct().getId()
                                        ));

                inventory.setCurrentStock(
                        inventory.getCurrentStock()
                                + item.getQuantity()
                );

                inventoryRepository.save(inventory);
            }
        }

        // -----------------------------------------------------
        // SAVE STATUS
        // -----------------------------------------------------

        order.setStatus(newStatus);

        Order savedOrder =
                orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    // =========================================================
    // ORDER STATE MACHINE
    // =========================================================

    private void validateStatusTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus) {

        boolean valid =
                switch (currentStatus) {

                    case PENDING ->
                            newStatus == OrderStatus.CONFIRMED
                                    || newStatus == OrderStatus.CANCELLED;

                    case CONFIRMED ->
                            newStatus == OrderStatus.PROCESSING
                                    || newStatus == OrderStatus.CANCELLED;

                    case PROCESSING ->
                            newStatus == OrderStatus.SHIPPED;

                    case SHIPPED ->
                            newStatus == OrderStatus.DELIVERED;

                    case DELIVERED, CANCELLED ->
                            false;
                };

        if (!valid) {

            throw new InvalidOrderStatusException(
                    "Invalid order status transition: "
                            + currentStatus
                            + " → "
                            + newStatus
            );
        }
    }

    // =========================================================
    // MAP ENTITY → RESPONSE DTO
    // =========================================================

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