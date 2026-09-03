package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.ExternalUserDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ExternalApiService {

    private final RestClient restClient;

    public ExternalApiService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://jsonplaceholder.typicode.com")
                .build();
    }

    public ExternalUserDTO getExternalUser(Long id) {

        return restClient
                .get()
                .uri("/users/{id}", id)
                .retrieve()
                .body(ExternalUserDTO.class);
    }
}