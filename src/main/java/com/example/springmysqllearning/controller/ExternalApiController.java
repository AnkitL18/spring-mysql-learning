package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.ExternalUserDTO;
import com.example.springmysqllearning.service.ExternalApiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/external")
public class ExternalApiController {

    private final ExternalApiService externalApiService;

    public ExternalApiController(
            ExternalApiService externalApiService) {

        this.externalApiService = externalApiService;
    }

    @GetMapping("/users/{id}")
    public ExternalUserDTO getExternalUser(
            @PathVariable Long id) {

        return externalApiService.getExternalUser(id);
    }
}