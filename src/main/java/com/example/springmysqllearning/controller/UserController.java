package com.example.springmysqllearning.controller;
import com.example.springmysqllearning.dto.UserRequestDTO;
import com.example.springmysqllearning.dto.UserResponseDTO;
import com.example.springmysqllearning.entity.User;
import com.example.springmysqllearning.service.UserService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.springmysqllearning.dto.UserPageResponseDTO;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public UserResponseDTO createUser(
            @Valid @RequestBody UserRequestDTO request) {
        return userService.createUser(request);
    }



    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
    @GetMapping
    public UserPageResponseDTO getUsers(Pageable pageable) {
        return userService.getUsers(pageable);
    }
    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        return userService.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);

        return "User deleted successfully";
    }
    @GetMapping("/public")
    public String publicEndpoint() {
        return "This endpoint is public";
    }
}