package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.PurchaseItemRequestDTO;
import com.example.springmysqllearning.dto.PurchaseRequestDTO;
import com.example.springmysqllearning.dto.PurchaseResponseDTO;
import com.example.springmysqllearning.entity.Product;
import com.example.springmysqllearning.entity.Purchase;
import com.example.springmysqllearning.entity.Purchase.PurchaseStatus;
import com.example.springmysqllearning.entity.PurchaseItem;
import com.example.springmysqllearning.entity.Supplier;
import com.example.springmysqllearning.exception.InvalidPurchaseStatusException;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.repository.ProductRepository;
import com.example.springmysqllearning.repository.PurchaseRepository;
import com.example.springmysqllearning.repository.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseService {

    private final InventoryService inventoryService;
    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    public PurchaseService(
            PurchaseRepository purchaseRepository,
            SupplierRepository supplierRepository,
            ProductRepository productRepository,
            InventoryService inventoryService) {

        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
    }

    // =========================================================
    // CREATE PURCHASE
    // =========================================================

    @Transactional
    public PurchaseResponseDTO createPurchase(
            PurchaseRequestDTO request) {

        Supplier supplier =
                supplierRepository.findById(
                                request.getSupplierId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Supplier not found with id: "
                                                + request.getSupplierId()
                                ));

        /*
         * A new purchase must start as DRAFT.
         *
         * We don't allow a client to create a purchase
         * directly as RECEIVED because receiving a purchase
         * has a business operation: stock must be increased.
         */
        if (request.getStatus() != null
                && request.getStatus() != PurchaseStatus.DRAFT) {

            throw new InvalidPurchaseStatusException(
                    "New purchase must start with DRAFT status"
            );
        }

        Purchase purchase = new Purchase();

        purchase.setSupplier(supplier);

        purchase.setPurchaseDate(
                request.getPurchaseDate()
        );

        purchase.setStatus(
                PurchaseStatus.DRAFT
        );

        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseItemRequestDTO itemRequest
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

            PurchaseItem item =
                    new PurchaseItem();

            item.setProduct(product);

            item.setQuantity(
                    itemRequest.getQuantity()
            );

            item.setUnitPrice(
                    itemRequest.getUnitPrice()
            );

            BigDecimal subtotal =
                    itemRequest.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            itemRequest.getQuantity()
                                    )
                            );

            item.setSubtotal(subtotal);

            purchase.addItem(item);

            total = total.add(subtotal);
        }

        purchase.setTotalAmount(total);

        /*
         * stockApplied should remain false
         * until the purchase is actually RECEIVED.
         */
        purchase.setStockApplied(false);

        Purchase savedPurchase =
                purchaseRepository.save(purchase);

        return mapToResponse(savedPurchase);
    }

    // =========================================================
    // GET PURCHASES
    // =========================================================

    @Transactional(readOnly = true)
    public Page<PurchaseResponseDTO> getPurchases(
            Long supplierId,
            PurchaseStatus status,
            Pageable pageable) {

        Page<Purchase> purchases;

        if (supplierId != null) {

            purchases =
                    purchaseRepository.findBySupplierId(
                            supplierId,
                            pageable
                    );

        } else if (status != null) {

            purchases =
                    purchaseRepository.findByStatus(
                            status,
                            pageable
                    );

        } else {

            purchases =
                    purchaseRepository.findAll(pageable);
        }

        return purchases.map(this::mapToResponse);
    }

    // =========================================================
    // GET PURCHASE BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public PurchaseResponseDTO getPurchaseById(Long id) {

        Purchase purchase =
                purchaseRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase not found with id: "
                                                + id
                                ));

        return mapToResponse(purchase);
    }

    // =========================================================
    // UPDATE PURCHASE STATUS
    // =========================================================

    @Transactional
    public PurchaseResponseDTO updatePurchaseStatus(
            Long id,
            PurchaseStatus newStatus) {

        if (newStatus == null) {
            throw new IllegalArgumentException(
                    "New purchase status cannot be null"
            );
        }

        Purchase purchase =
                purchaseRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase not found with id: "
                                                + id
                                ));

        PurchaseStatus currentStatus =
                purchase.getStatus();

        // -----------------------------------------------------
        // Same status = no operation
        // -----------------------------------------------------

        if (currentStatus == newStatus) {
            return mapToResponse(purchase);
        }

        // -----------------------------------------------------
        // Terminal states
        // -----------------------------------------------------

        if (currentStatus == PurchaseStatus.RECEIVED) {

            throw new InvalidPurchaseStatusException(
                    "Received purchase cannot change status"
            );
        }

        if (currentStatus == PurchaseStatus.CANCELLED) {

            throw new InvalidPurchaseStatusException(
                    "Cancelled purchase cannot change status"
            );
        }

        // -----------------------------------------------------
        // Validate transition
        // -----------------------------------------------------

        validatePurchaseStatusTransition(
                currentStatus,
                newStatus
        );

        // -----------------------------------------------------
        // ORDERED → RECEIVED
        //
        // Increase stock exactly once.
        // -----------------------------------------------------

        if (currentStatus == PurchaseStatus.ORDERED
                && newStatus == PurchaseStatus.RECEIVED) {

            /*
             * Extra protection against accidental duplicate
             * inventory application.
             */
            if (purchase.isStockApplied()) {

                throw new InvalidPurchaseStatusException(
                        "Stock has already been applied for purchase id: "
                                + id
                );
            }

            for (PurchaseItem item : purchase.getItems()) {

                inventoryService.increaseStock(
                        item.getProduct().getId(),
                        item.getQuantity()
                );
            }

            purchase.setStockApplied(true);
        }

        // -----------------------------------------------------
        // Save new status
        // -----------------------------------------------------

        purchase.setStatus(newStatus);

        Purchase savedPurchase =
                purchaseRepository.save(purchase);

        return mapToResponse(savedPurchase);
    }

    // =========================================================
    // VALIDATE PURCHASE STATUS TRANSITION
    // =========================================================

    private void validatePurchaseStatusTransition(
            PurchaseStatus currentStatus,
            PurchaseStatus newStatus) {

        boolean valid =
                switch (currentStatus) {

                    case DRAFT ->
                            newStatus == PurchaseStatus.ORDERED
                                    || newStatus == PurchaseStatus.CANCELLED;

                    case ORDERED ->
                            newStatus == PurchaseStatus.RECEIVED
                                    || newStatus == PurchaseStatus.CANCELLED;

                    case RECEIVED, CANCELLED ->
                            false;
                };

        if (!valid) {

            throw new InvalidPurchaseStatusException(
                    "Invalid purchase status transition: "
                            + currentStatus
                            + " → "
                            + newStatus
            );
        }
    }

    // =========================================================
    // MAP ENTITY → RESPONSE DTO
    // =========================================================

    private PurchaseResponseDTO mapToResponse(
            Purchase purchase) {

        List<PurchaseResponseDTO.PurchaseItemResponse>
                itemResponses =
                new ArrayList<>();

        for (PurchaseItem item :
                purchase.getItems()) {

            Product product =
                    item.getProduct();

            itemResponses.add(
                    new PurchaseResponseDTO.PurchaseItemResponse(
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

        return new PurchaseResponseDTO(
                purchase.getId(),
                purchase.getSupplier().getId(),
                purchase.getSupplier().getName(),
                purchase.getPurchaseDate(),
                purchase.getStatus(),
                purchase.getTotalAmount(),
                itemResponses,
                purchase.getCreatedAt(),
                purchase.getUpdatedAt()
        );
    }
}