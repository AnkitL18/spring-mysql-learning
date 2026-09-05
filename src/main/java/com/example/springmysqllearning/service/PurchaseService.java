package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.PurchaseItemRequestDTO;
import com.example.springmysqllearning.dto.PurchaseResponseDTO;
import com.example.springmysqllearning.dto.PurchaseRequestDTO;
import com.example.springmysqllearning.entity.Product;
import com.example.springmysqllearning.entity.Purchase;
import com.example.springmysqllearning.entity.Purchase.PurchaseStatus;
import com.example.springmysqllearning.entity.PurchaseItem;
import com.example.springmysqllearning.entity.Supplier;
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

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    public PurchaseService(
            PurchaseRepository purchaseRepository,
            SupplierRepository supplierRepository,
            ProductRepository productRepository) {

        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
    }

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

        Purchase purchase = new Purchase();

        purchase.setSupplier(supplier);
        purchase.setPurchaseDate(
                request.getPurchaseDate()
        );

        if (request.getStatus() == null) {
            purchase.setStatus(PurchaseStatus.DRAFT);
        } else {
            purchase.setStatus(request.getStatus());
        }

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

            PurchaseItem item = new PurchaseItem();

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

        Purchase savedPurchase =
                purchaseRepository.save(purchase);

        return mapToResponse(savedPurchase);
    }

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

    public PurchaseResponseDTO getPurchaseById(Long id) {

        Purchase purchase =
                purchaseRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase not found with id: " + id
                                ));

        return mapToResponse(purchase);
    }

    @Transactional
    public PurchaseResponseDTO updatePurchaseStatus(
            Long id,
            PurchaseStatus status) {

        Purchase purchase =
                purchaseRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase not found with id: " + id
                                ));

        purchase.setStatus(status);

        return mapToResponse(
                purchaseRepository.save(purchase)
        );
    }

    private PurchaseResponseDTO mapToResponse(
            Purchase purchase) {

        List<PurchaseResponseDTO.PurchaseItemResponse>
                itemResponses = new ArrayList<>();

        for (PurchaseItem item : purchase.getItems()) {

            Product product = item.getProduct();

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