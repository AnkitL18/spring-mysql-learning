package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.InventoryRequestDTO;
import com.example.springmysqllearning.dto.InventoryResponseDTO;
import com.example.springmysqllearning.dto.StockAdjustmentRequestDTO;
import com.example.springmysqllearning.entity.Inventory;
import com.example.springmysqllearning.entity.Product;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.repository.InventoryRepository;
import com.example.springmysqllearning.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public InventoryService(
            InventoryRepository inventoryRepository,
            ProductRepository productRepository) {

        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public InventoryResponseDTO createInventory(
            Long productId,
            InventoryRequestDTO request) {

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + productId
                                ));

        if (inventoryRepository.existsByProductId(productId)) {
            throw new IllegalArgumentException(
                    "Inventory already exists for product id: "
                            + productId
            );
        }

        if (request.getMaximumStock()
                < request.getReorderLevel()) {

            throw new IllegalArgumentException(
                    "Maximum stock must be greater than or equal to reorder level"
            );
        }

        Inventory inventory = new Inventory();

        inventory.setProduct(product);
        inventory.setCurrentStock(0);
        inventory.setReorderLevel(
                request.getReorderLevel()
        );
        inventory.setMaximumStock(
                request.getMaximumStock()
        );

        Inventory savedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(savedInventory);
    }

    @Transactional(readOnly = true)
    public Page<InventoryResponseDTO> getInventory(
            Pageable pageable) {

        return inventoryRepository
                .findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public InventoryResponseDTO getInventoryByProductId(
            Long productId) {

        Inventory inventory =
                inventoryRepository.findByProductId(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found for product id: "
                                                + productId
                                ));

        return mapToResponse(inventory);
    }

    @Transactional
    public InventoryResponseDTO updateInventorySettings(
            Long productId,
            InventoryRequestDTO request) {

        Inventory inventory =
                inventoryRepository.findByProductId(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found for product id: "
                                                + productId
                                ));

        if (request.getMaximumStock()
                < request.getReorderLevel()) {

            throw new IllegalArgumentException(
                    "Maximum stock must be greater than or equal to reorder level"
            );
        }

        inventory.setReorderLevel(
                request.getReorderLevel()
        );

        inventory.setMaximumStock(
                request.getMaximumStock()
        );

        return mapToResponse(
                inventoryRepository.save(inventory)
        );
    }

    @Transactional
    public InventoryResponseDTO adjustStock(
            Long productId,
            StockAdjustmentRequestDTO request) {

        Inventory inventory =
                inventoryRepository.findByProductId(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found for product id: "
                                                + productId
                                ));

        int currentStock =
                inventory.getCurrentStock();

        int quantity =
                request.getQuantity();

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        int newStock;

        if (request.getIncrease()) {

            newStock = currentStock + quantity;

            if (newStock >
                    inventory.getMaximumStock()) {

                throw new IllegalArgumentException(
                        "Stock cannot exceed maximum stock of "
                                + inventory.getMaximumStock()
                );
            }

        } else {

            newStock = currentStock - quantity;

            if (newStock < 0) {

                throw new IllegalArgumentException(
                        "Insufficient stock"
                );
            }
        }

        inventory.setCurrentStock(newStock);

        Inventory updatedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }

    @Transactional
    public void increaseStock(
            Long productId,
            int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        Inventory inventory =
                inventoryRepository.findByProductId(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found for product id: "
                                                + productId
                                ));

        int newStock =
                inventory.getCurrentStock() + quantity;

        /*
         * We don't block received purchases from exceeding
         * maximumStock. maximumStock is a planning threshold,
         * not an absolute database limit.
         */
        inventory.setCurrentStock(newStock);

        inventoryRepository.save(inventory);
    }

    @Transactional
    public void decreaseStock(
            Long productId,
            int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        Inventory inventory =
                inventoryRepository.findByProductId(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found for product id: "
                                                + productId
                                ));

        int newStock =
                inventory.getCurrentStock() - quantity;

        if (newStock < 0) {
            throw new IllegalArgumentException(
                    "Insufficient stock for product id: "
                            + productId
            );
        }

        inventory.setCurrentStock(newStock);

        inventoryRepository.save(inventory);
    }

    @Transactional(readOnly = true)
    public Page<InventoryResponseDTO> getOutOfStock(
            Pageable pageable) {

        return inventoryRepository
                .findByCurrentStock(0, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<InventoryResponseDTO> getLowStock(
            Pageable pageable) {

        return inventoryRepository
                .findLowStock(pageable)
                .map(this::mapToResponse);
    }

    private InventoryResponseDTO mapToResponse(
            Inventory inventory) {

        Product product =
                inventory.getProduct();

        return new InventoryResponseDTO(
                inventory.getId(),
                product.getId(),
                product.getName(),
                product.getSku(),
                inventory.getCurrentStock(),
                inventory.getReorderLevel(),
                inventory.getMaximumStock(),
                calculateStatus(inventory),
                inventory.getCreatedAt(),
                inventory.getUpdatedAt()
        );
    }

    private String calculateStatus(
            Inventory inventory) {

        int stock =
                inventory.getCurrentStock();

        if (stock == 0) {
            return "OUT_OF_STOCK";
        }

        if (stock <= inventory.getReorderLevel()) {
            return "LOW_STOCK";
        }

        return "IN_STOCK";
    }
}