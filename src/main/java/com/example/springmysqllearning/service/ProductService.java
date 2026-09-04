package com.example.springmysqllearning.service;

import com.example.springmysqllearning.dto.ProductRequestDTO;
import com.example.springmysqllearning.dto.ProductResponseDTO;
import com.example.springmysqllearning.entity.Category;
import com.example.springmysqllearning.entity.Product;
import com.example.springmysqllearning.exception.ResourceNotFoundException;
import com.example.springmysqllearning.repository.CategoryRepository;
import com.example.springmysqllearning.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public ProductResponseDTO createProduct(
            ProductRequestDTO request) {

        if (productRepository.existsBySkuIgnoreCase(
                request.getSku())) {

            throw new IllegalArgumentException(
                    "Product with this SKU already exists"
            );
        }

        Category category =
                categoryRepository.findById(
                                request.getCategoryId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found with id: "
                                                + request.getCategoryId()
                                ));

        Product product = new Product();

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);

        Product savedProduct =
                productRepository.save(product);

        return mapToResponse(savedProduct);
    }

    public Page<ProductResponseDTO> getProducts(
            String search,
            Long categoryId,
            Pageable pageable) {

        Page<Product> products;

        boolean hasSearch =
                search != null && !search.isBlank();

        boolean hasCategory =
                categoryId != null;

        if (hasSearch && hasCategory) {

            products =
                    productRepository
                            .findByNameContainingIgnoreCaseAndCategoryId(
                                    search,
                                    categoryId,
                                    pageable
                            );

        } else if (hasSearch) {

            products =
                    productRepository
                            .findByNameContainingIgnoreCase(
                                    search,
                                    pageable
                            );

        } else if (hasCategory) {

            products =
                    productRepository.findByCategoryId(
                            categoryId,
                            pageable
                    );

        } else {

            products =
                    productRepository.findAll(pageable);
        }

        return products.map(this::mapToResponse);
    }

    public ProductResponseDTO getProductById(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: " + id
                                ));

        return mapToResponse(product);
    }

    public ProductResponseDTO updateProduct(
            Long id,
            ProductRequestDTO request) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: " + id
                                ));

        if (!product.getSku().equalsIgnoreCase(
                request.getSku())
                && productRepository.existsBySkuIgnoreCase(
                request.getSku())) {

            throw new IllegalArgumentException(
                    "Product with this SKU already exists"
            );
        }

        Category category =
                categoryRepository.findById(
                                request.getCategoryId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found with id: "
                                                + request.getCategoryId()
                                ));

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);

        Product updatedProduct =
                productRepository.save(product);

        return mapToResponse(updatedProduct);
    }

    public void deleteProduct(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: " + id
                                ));

        productRepository.delete(product);
    }

    private ProductResponseDTO mapToResponse(
            Product product) {

        return new ProductResponseDTO(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}