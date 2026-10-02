package com.example.springmysqllearning.controller;
import com.example.springmysqllearning.service.ProductService;
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

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    // ==========================================
    // ANONYMOUS USER
    // ==========================================

    @Test
    void getProducts_withoutAuthentication_shouldReturn401()
            throws Exception {

        mockMvc.perform(
                get("/products")
        ).andExpect(
                status().isUnauthorized()
        );
    }

    // ==========================================
    // USER
    // ==========================================

    @Test
    @WithMockUser(roles = "USER")
    void getProducts_asUser_shouldBeAllowed()
            throws Exception {

        mockMvc.perform(
                get("/products")
        ).andExpect(
                status().isOk()
        );
    }

    @Test
    @WithMockUser(roles = "USER")
    void createProduct_asUser_shouldReturn403()
            throws Exception {

        mockMvc.perform(
                post("/products")
        ).andExpect(
                status().isForbidden()
        );
    }

    @Test
    @WithMockUser(roles = "USER")
    void updateProduct_asUser_shouldReturn403()
            throws Exception {

        mockMvc.perform(
                put("/products/1")
        ).andExpect(
                status().isForbidden()
        );
    }

    @Test
    @WithMockUser(roles = "USER")
    void deleteProduct_asUser_shouldReturn403()
            throws Exception {

        mockMvc.perform(
                delete("/products/1")
        ).andExpect(
                status().isForbidden()
        );
    }

    // ==========================================
    // ADMIN
    // ==========================================

    @Test
    @WithMockUser(roles = "ADMIN")
    void getProducts_asAdmin_shouldBeAllowed()
            throws Exception {

        mockMvc.perform(
                get("/products")
        ).andExpect(
                status().isOk()
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProduct_asAdmin_shouldNotReturn403()
            throws Exception {

        mockMvc.perform(
                post("/products")
        ).andExpect(result ->
                assertNotEquals(
                        403,
                        result.getResponse().getStatus()
                )
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateProduct_asAdmin_shouldNotReturn403()
            throws Exception {

        mockMvc.perform(
                put("/products/1")
        ).andExpect(result ->
                assertNotEquals(
                        403,
                        result.getResponse().getStatus()
                )
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteProduct_asAdmin_shouldNotReturn403()
            throws Exception {

        mockMvc.perform(
                delete("/products/1")
        ).andExpect(result ->
                assertNotEquals(
                        403,
                        result.getResponse().getStatus()
                )
        );
    }
}