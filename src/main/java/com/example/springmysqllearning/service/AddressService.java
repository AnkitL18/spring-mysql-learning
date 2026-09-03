package com.example.springmysqllearning.service;
import com.example.springmysqllearning.dto.AddressRequestDTO;
import com.example.springmysqllearning.dto.AddressResponseDTO;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.entity.Address;
import com.example.springmysqllearning.entity.User;
import com.example.springmysqllearning.repository.AddressRepository;
import com.example.springmysqllearning.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(
            AddressRepository addressRepository,
            UserRepository userRepository) {

        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }
    public AddressResponseDTO createAddress(
            Long userId,
            AddressRequestDTO request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );

        Address address = new Address();

        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setPincode(request.getPincode());

        address.setUser(user);

        Address savedAddress = addressRepository.save(address);

        AddressResponseDTO response = new AddressResponseDTO();

        response.setId(savedAddress.getId());
        response.setStreet(savedAddress.getStreet());
        response.setCity(savedAddress.getCity());
        response.setPincode(savedAddress.getPincode());

        return response;
    }
}