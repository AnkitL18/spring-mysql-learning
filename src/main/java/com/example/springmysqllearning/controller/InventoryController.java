package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.InventoryRequestDTO;
import com.example.springmysqllearning.dto.InventoryResponseDTO;
import com.example.springmysqllearning.dto.StockAdjustmentRequestDTO;
import com.example.springmysqllearning.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(
            InventoryService inventoryService) {

        this.inventoryService = inventoryService;
    }

    @PostMapping("/products/{productId}")
    public InventoryResponseDTO createInventory(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryRequestDTO request) {

        return inventoryService.createInventory(
                productId,
                request
        );
    }

    @GetMapping
    public Page<InventoryResponseDTO> getInventory(
            Pageable pageable) {

        return inventoryService.getInventory(
                pageable
        );
    }

    @GetMapping("/product/{productId}")
    public InventoryResponseDTO getInventoryByProduct(
            @PathVariable Long productId) {

        return inventoryService
                .getInventoryByProductId(productId);
    }

    @PutMapping("/product/{productId}/settings")
    public InventoryResponseDTO updateInventorySettings(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryRequestDTO request) {

        return inventoryService.updateInventorySettings(
                productId,
                request
        );
    }

    @PostMapping("/product/{productId}/adjust")
    public InventoryResponseDTO adjustStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequestDTO request) {

        return inventoryService.adjustStock(
                productId,
                request
        );
    }

    @GetMapping("/low-stock")
    public Page<InventoryResponseDTO> getLowStock(
            Pageable pageable) {

        return inventoryService.getLowStock(
                pageable
        );
    }

    @GetMapping("/out-of-stock")
    public Page<InventoryResponseDTO> getOutOfStock(
            Pageable pageable) {

        return inventoryService.getOutOfStock(
                pageable
        );
    }
}