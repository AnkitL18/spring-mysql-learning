package com.example.springmysqllearning.controller;
import com.example.springmysqllearning.dto.LoginRequestDTO;
import com.example.springmysqllearning.dto.LoginResponseDTO;
import com.example.springmysqllearning.dto.JwtResponseDTO;
import com.example.springmysqllearning.dto.UserRequestDTO;
import com.example.springmysqllearning.dto.UserResponseDTO;
import com.example.springmysqllearning.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public UserResponseDTO register(
            @Valid @RequestBody UserRequestDTO request) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public JwtResponseDTO login(
            @Valid @RequestBody LoginRequestDTO request) {

        return authService.login(request);
    }
    @GetMapping("/test")
    public String test() {
        return "Auth endpoint is working";
    }
}