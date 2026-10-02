package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.service.CustomerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CustomerController.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerService customerService;

    // ==========================================
    // ANONYMOUS USER
    // ==========================================

    @Test
    void getCustomers_withoutAuthentication_shouldReturn401()
            throws Exception {

        mockMvc.perform(
                get("/customers")
        ).andExpect(
                status().isUnauthorized()
        );
    }

    @Test
    void createCustomer_withoutAuthentication_shouldReturn401()
            throws Exception {

        mockMvc.perform(
                post("/customers")
        ).andExpect(
                status().isUnauthorized()
        );
    }

    @Test
    void updateCustomer_withoutAuthentication_shouldReturn401()
            throws Exception {

        mockMvc.perform(
                put("/customers/1")
        ).andExpect(
                status().isUnauthorized()
        );
    }

    @Test
    void deleteCustomer_withoutAuthentication_shouldReturn401()
            throws Exception {

        mockMvc.perform(
                delete("/customers/1")
        ).andExpect(
                status().isUnauthorized()
        );
    }

    // ==========================================
    // USER
    // ==========================================

    @Test
    @WithMockUser(roles = "USER")
    void getCustomers_asUser_shouldBeAllowed()
            throws Exception {

        mockMvc.perform(
                get("/customers")
        ).andExpect(
                status().isOk()
        );
    }

    @Test
    @WithMockUser(roles = "USER")
    void createCustomer_asUser_shouldNotReturn403()
            throws Exception {

        mockMvc.perform(
                post("/customers")
        ).andExpect(result ->
                assertNotEquals(
                        403,
                        result.getResponse().getStatus()
                )
        );
    }

    @Test
    @WithMockUser(roles = "USER")
    void updateCustomer_asUser_shouldNotReturn403()
            throws Exception {

        mockMvc.perform(
                put("/customers/1")
        ).andExpect(result ->
                assertNotEquals(
                        403,
                        result.getResponse().getStatus()
                )
        );
    }

    @Test
    @WithMockUser(roles = "USER")
    void deleteCustomer_asUser_shouldReturn403()
            throws Exception {

        mockMvc.perform(
                delete("/customers/1")
        ).andExpect(
                status().isForbidden()
        );
    }

    // ==========================================
    // ADMIN
    // ==========================================

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCustomers_asAdmin_shouldBeAllowed()
            throws Exception {

        mockMvc.perform(
                get("/customers")
        ).andExpect(
                status().isOk()
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCustomer_asAdmin_shouldNotReturn403()
            throws Exception {

        mockMvc.perform(
                post("/customers")
        ).andExpect(result ->
                assertNotEquals(
                        403,
                        result.getResponse().getStatus()
                )
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateCustomer_asAdmin_shouldNotReturn403()
            throws Exception {

        mockMvc.perform(
                put("/customers/1")
        ).andExpect(result ->
                assertNotEquals(
                        403,
                        result.getResponse().getStatus()
                )
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCustomer_asAdmin_shouldNotReturn403()
            throws Exception {

        mockMvc.perform(
                delete("/customers/1")
        ).andExpect(result ->
                assertNotEquals(
                        403,
                        result.getResponse().getStatus()
                )
        );
    }
}