package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.PurchaseRequestDTO;
import com.example.springmysqllearning.entity.Supplier;
import com.example.springmysqllearning.entity.Purchase.PurchaseStatus;
import com.example.springmysqllearning.exception.InvalidPurchaseStatusException;
import com.example.springmysqllearning.repository.ProductRepository;
import com.example.springmysqllearning.repository.PurchaseRepository;
import com.example.springmysqllearning.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

class PurchaseServiceTest {

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private PurchaseService purchaseService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createPurchase_shouldRejectNonDraftStatus() {

        Supplier supplier = new Supplier();
        supplier.setId(1L);

        when(supplierRepository.findById(1L))
                .thenReturn(Optional.of(supplier));

        PurchaseRequestDTO request = new PurchaseRequestDTO();
        request.setSupplierId(1L);
        request.setPurchaseDate(LocalDate.now());
        request.setStatus(PurchaseStatus.RECEIVED);

        assertThrows(
                InvalidPurchaseStatusException.class,
                () -> purchaseService.createPurchase(request)
        );
    }
}