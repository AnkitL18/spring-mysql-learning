package com.example.springmysqllearning.controller;

import com.example.springmysqllearning.dto.CategoryRequestDTO;
import com.example.springmysqllearning.dto.CategoryResponseDTO;
import com.example.springmysqllearning.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(
            CategoryService categoryService) {

        this.categoryService = categoryService;
    }

    @PostMapping
    public CategoryResponseDTO createCategory(
            @Valid @RequestBody CategoryRequestDTO request) {

        return categoryService.createCategory(request);
    }

    @GetMapping
    public Page<CategoryResponseDTO> getCategories(
            @RequestParam(required = false) String search,
            Pageable pageable) {

        return categoryService.getCategories(
                search,
                pageable
        );
    }

    @GetMapping("/{id}")
    public CategoryResponseDTO getCategoryById(
            @PathVariable Long id) {

        return categoryService.getCategoryById(id);
    }

    @PutMapping("/{id}")
    public CategoryResponseDTO updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequestDTO request) {

        return categoryService.updateCategory(
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(
            @PathVariable Long id) {

        categoryService.deleteCategory(id);
    }
}