package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.report.DashboardSummaryDTO;
import com.example.springmysqllearning.service.ReportService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final ReportService reportService;

    public DashboardController(
            ReportService reportService) {

        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary() {

        return reportService.getDashboardSummary();
    }
}