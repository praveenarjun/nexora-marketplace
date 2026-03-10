-- V4__optimize_images_and_hard_delete.sql

-- 1. Hyper-optimize image URLs across the entire catalog
-- We target Unsplash URLs and replace larger width/quality parameters with optimized ones.
UPDATE product_images 
SET image_url = REPLACE(REPLACE(image_url, 'w=1000', 'w=600&q=60'), 'w=800', 'w=600&q=60')
WHERE image_url LIKE '%unsplash.com%';

-- 2. Hard-delete user-requested products (IDs: 16, 17, 22, 27, 28, 32)
-- We must remove child records first to satisfy foreign key constraints.
DELETE FROM product_highlights WHERE product_id IN (16, 17, 22, 27, 28, 32);
DELETE FROM product_images WHERE product_id IN (16, 17, 22, 27, 28, 32);
DELETE FROM product_tags WHERE product_id IN (16, 17, 22, 27, 28, 32);

-- Finally, remove the product records themselves.
DELETE FROM products WHERE id IN (16, 17, 22, 27, 28, 32);
