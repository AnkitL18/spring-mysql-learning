package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.AddressRequestDTO;
import com.example.springmysqllearning.dto.AddressResponseDTO;
import com.example.springmysqllearning.service.AddressService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/{userId}/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping
    public AddressResponseDTO createAddress(
            @PathVariable Long userId,
            @RequestBody AddressRequestDTO request) {

        return addressService.createAddress(userId, request);
    }
}