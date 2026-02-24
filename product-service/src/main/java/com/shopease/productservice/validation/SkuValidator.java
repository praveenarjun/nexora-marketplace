package com.shopease.productservice.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class SkuValidator implements ConstraintValidator<ValidSKU, String> {

    // Pattern: 2-4 uppercase letters, hyphen, 2-4 uppercase letters, hyphen, 2-5
    // alphanumeric characters
    // Example: ELEC-PHN-IP15 or BK-SCI-101
    private static final String SKU_PATTERN = "^[A-Z]{2,5}-[A-Z]{2,5}-[A-Z0-9]{2,5}$";
    private static final Pattern PATTERN = Pattern.compile(SKU_PATTERN);

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true; // Use @NotBlank regarding nullability
        }
        return PATTERN.matcher(value).matches();
    }
}
