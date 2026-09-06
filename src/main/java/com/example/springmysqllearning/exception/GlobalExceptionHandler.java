package com.example.springmysqllearning.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================
    // 404 NOT FOUND
    // =========================================================

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleResourceNotFound(
            ResourceNotFoundException exception) {

        return Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 404,
                "error", "Not Found",
                "message", exception.getMessage()
        );
    }

    // =========================================================
    // 409 INSUFFICIENT STOCK
    // =========================================================

    @ExceptionHandler(InsufficientStockException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, Object> handleInsufficientStock(
            InsufficientStockException exception) {

        return Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 409,
                "error", "Conflict",
                "message", exception.getMessage()
        );
    }

    // =========================================================
    // 409 INVALID ORDER STATUS
    // =========================================================

    @ExceptionHandler(InvalidOrderStatusException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, Object> handleInvalidOrderStatus(
            InvalidOrderStatusException exception) {

        return Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 409,
                "error", "Conflict",
                "message", exception.getMessage()
        );
    }

    // =========================================================
    // 409 INVALID PURCHASE STATUS
    // =========================================================

    @ExceptionHandler(InvalidPurchaseStatusException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, Object> handleInvalidPurchaseStatus(
            InvalidPurchaseStatusException exception) {

        return Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 409,
                "error", "Conflict",
                "message", exception.getMessage()
        );
    }

    // =========================================================
    // 400 BAD REQUEST
    // =========================================================

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleIllegalArgument(
            IllegalArgumentException exception) {

        return Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 400,
                "error", "Bad Request",
                "message", exception.getMessage()
        );
    }
}