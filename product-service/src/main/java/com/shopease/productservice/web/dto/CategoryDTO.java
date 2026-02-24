package com.shopease.productservice.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private boolean active;
    private Long parentId;
    private List<CategoryDTO> subCategories;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
