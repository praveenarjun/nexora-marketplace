-- Add high-fidelity columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Create product_highlights table for the new highlights list
CREATE TABLE IF NOT EXISTS product_highlights (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    highlight VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id, highlight)
);
