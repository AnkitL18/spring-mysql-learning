package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.CategoryRequestDTO;
import com.example.springmysqllearning.dto.CategoryResponseDTO;
import com.example.springmysqllearning.entity.Category;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public CategoryResponseDTO createCategory(
            CategoryRequestDTO request) {

        if (categoryRepository.existsByNameIgnoreCase(
                request.getName())) {

            throw new IllegalArgumentException(
                    "Category with this name already exists"
            );
        }

        Category category = new Category();

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category savedCategory =
                categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    public Page<CategoryResponseDTO> getCategories(
            String search,
            Pageable pageable) {

        Page<Category> categories;

        if (search == null || search.isBlank()) {

            categories =
                    categoryRepository.findAll(pageable);

        } else {

            categories =
                    categoryRepository
                            .findByNameContainingIgnoreCase(
                                    search,
                                    pageable
                            );
        }

        return categories.map(this::mapToResponse);
    }

    public CategoryResponseDTO getCategoryById(Long id) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found with id: " + id
                                ));

        return mapToResponse(category);
    }

    public CategoryResponseDTO updateCategory(
            Long id,
            CategoryRequestDTO request) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found with id: " + id
                                ));

        if (!category.getName().equalsIgnoreCase(
                request.getName())
                && categoryRepository.existsByNameIgnoreCase(
                request.getName())) {

            throw new IllegalArgumentException(
                    "Category with this name already exists"
            );
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updatedCategory =
                categoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }

    public void deleteCategory(Long id) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found with id: " + id
                                ));

        categoryRepository.delete(category);
    }

    private CategoryResponseDTO mapToResponse(
            Category category) {

        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}