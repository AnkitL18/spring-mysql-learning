package com.example.springmysqllearning.exception;

public class InvalidPurchaseStatusException extends RuntimeException {

    public InvalidPurchaseStatusException(String message) {
        super(message);
    }
}