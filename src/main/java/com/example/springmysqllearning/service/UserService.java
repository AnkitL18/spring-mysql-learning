package com.example.springmysqllearning.service;
import com.example.springmysqllearning.dto.UserRequestDTO;
import com.example.springmysqllearning.dto.UserResponseDTO;
import com.example.springmysqllearning.entity.User;
import com.example.springmysqllearning.repository.UserRepository;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.springmysqllearning.dto.UserPageResponseDTO;
import com.example.springmysqllearning.dto.UserResponseDTO;
import org.springframework.data.domain.Page;
import java.util.List;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        )
                );
    }

    public User updateUser(Long id, User updatedUser) {

        User existingUser = userRepository.findById(id)
                .orElse(null);

        if (existingUser == null) {
            return null;
        }

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());

        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    public UserResponseDTO createUser(UserRequestDTO request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        User savedUser = userRepository.save(user);

        UserResponseDTO response = new UserResponseDTO();

        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());

        return response;
    }
    public UserPageResponseDTO getUsers(Pageable pageable) {

        Page<User> userPage = userRepository.findAll(pageable);

        List<UserResponseDTO> users = userPage
                .getContent()
                .stream()
                .map(user -> {
                    UserResponseDTO response = new UserResponseDTO();

                    response.setId(user.getId());
                    response.setName(user.getName());
                    response.setEmail(user.getEmail());

                    return response;
                })
                .toList();

        UserPageResponseDTO response = new UserPageResponseDTO();

        response.setUsers(users);
        response.setPage(userPage.getNumber());
        response.setSize(userPage.getSize());
        response.setTotalElements(userPage.getTotalElements());
        response.setTotalPages(userPage.getTotalPages());

        return response;
    }
}