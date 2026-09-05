package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.InventoryResponseDTO;
import com.example.springmysqllearning.report.DashboardSummaryDTO;
import com.example.springmysqllearning.report.OrderStatusSummaryDTO;
import com.example.springmysqllearning.report.TopCustomerDTO;
import com.example.springmysqllearning.report.TopProductDTO;
import com.example.springmysqllearning.service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(
            ReportService reportService) {

        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary() {

        return reportService.getDashboardSummary();
    }

    @GetMapping("/top-products")
    public Page<TopProductDTO> getTopProducts(
            Pageable pageable) {

        return reportService.getTopProducts(
                pageable
        );
    }

    @GetMapping("/top-customers")
    public Page<TopCustomerDTO> getTopCustomers(
            Pageable pageable) {

        return reportService.getTopCustomers(
                pageable
        );
    }

    @GetMapping("/order-status")
    public List<OrderStatusSummaryDTO>
    getOrderStatus() {

        return reportService.getOrderStatusSummary();
    }

    @GetMapping("/low-stock")
    public Page<InventoryResponseDTO>
    getLowStock(Pageable pageable) {

        return reportService.getLowStockProducts(
                pageable
        );
    }
}