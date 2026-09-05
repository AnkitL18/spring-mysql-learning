package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.PurchaseRequestDTO;
import com.example.springmysqllearning.dto.PurchaseResponseDTO;
import com.example.springmysqllearning.entity.Purchase.PurchaseStatus;
import com.example.springmysqllearning.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(
            PurchaseService purchaseService) {

        this.purchaseService = purchaseService;
    }

    @PostMapping
    public PurchaseResponseDTO createPurchase(
            @Valid @RequestBody PurchaseRequestDTO request) {

        return purchaseService.createPurchase(request);
    }

    @GetMapping
    public Page<PurchaseResponseDTO> getPurchases(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) PurchaseStatus status,
            Pageable pageable) {

        return purchaseService.getPurchases(
                supplierId,
                status,
                pageable
        );
    }

    @GetMapping("/{id}")
    public PurchaseResponseDTO getPurchaseById(
            @PathVariable Long id) {

        return purchaseService.getPurchaseById(id);
    }

    @PutMapping("/{id}/status")
    public PurchaseResponseDTO updatePurchaseStatus(
            @PathVariable Long id,
            @RequestParam PurchaseStatus status) {

        return purchaseService.updatePurchaseStatus(
                id,
                status
        );
    }
}