-- V3__seed_high_fidelity_products.sql
-- Seed Categories
INSERT INTO categories (name, description, image_url, active) VALUES
('Electronics', 'Premium gadgets, smartphones, and professional gear.', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800', true),
('Fashion', 'Modern apparel, designer accessories, and trending styles.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800', true),
('Home & Living', 'Minimalist furniture, gourmet kitchenware, and elegant decor.', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=800', true),
('Fitness & Outdoors', 'High-performance sports gear, smart wearables, and outdoor equipment.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800', true)
ON CONFLICT DO NOTHING;

-- Seed Products: Electronics (Category ID 1)
INSERT INTO products (sku, name, description, short_description, price, compare_at_price, status, quantity, brand, category_id, featured, badge, rating, reviews_count) VALUES
('ELEC-IPH-15PRO', 'iPhone 15 Pro', 'Experience the ultimate in mobile performance with the A17 Pro chip and a pro-grade camera system.', 'Titanium design, A17 Pro chip.', 999.99, 1099.99, 'ACTIVE', 50, 'Apple', 1, true, 'Trending', 4.9, 1250),
('ELEC-MBP-14', 'MacBook Pro 14"', 'Power through the most demanding tasks with the M3 Pro chip and a stunning Liquid Retina XDR display.', 'M3 Pro chip, Liquid Retina display.', 1999.99, 2199.99, 'ACTIVE', 25, 'Apple', 1, true, 'Premium', 4.8, 850),
('ELEC-SNY-XM5', 'Sony WH-1000XM5', 'Industry-leading noise cancellation and exceptional sound quality for an immersive listening experience.', 'Silent comfort, superior sound.', 399.99, 449.99, 'ACTIVE', 100, 'Sony', 1, false, 'Best Seller', 4.7, 3200),
('ELEC-IPD-PRO', 'iPad Pro 12.9"', 'The ultimate tablet experience with the M2 chip, mini-LED display, and Apple Pencil support.', 'Mobile power, stunning display.', 1099.99, 1199.99, 'ACTIVE', 40, 'Apple', 1, false, 'New Arrival', 4.9, 420);

-- Product Images: Electronics
INSERT INTO product_images (product_id, image_url) VALUES
((SELECT id FROM products WHERE sku = 'ELEC-IPH-15PRO'), 'https://images.unsplash.com/photo-1695468122159-4f7f6da9fc02?auto=format&fit=crop&q=80&w=800'),
((SELECT id FROM products WHERE sku = 'ELEC-MBP-14'), 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'),
((SELECT id FROM products WHERE sku = 'ELEC-SNY-XM5'), 'https://images.unsplash.com/photo-1644747069123-6e8dd1217fc7?auto=format&fit=crop&q=80&w=800'),
((SELECT id FROM products WHERE sku = 'ELEC-IPD-PRO'), 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800');

-- Product Highlights: Electronics
INSERT INTO product_highlights (product_id, highlight) VALUES
((SELECT id FROM products WHERE sku = 'ELEC-IPH-15PRO'), 'A17 Pro chip with 6-core GPU'),
((SELECT id FROM products WHERE sku = 'ELEC-IPH-15PRO'), 'Pro camera system with 48MP Main'),
((SELECT id FROM products WHERE sku = 'ELEC-MBP-14'), 'Apple M3 Pro chip'),
((SELECT id FROM products WHERE sku = 'ELEC-MBP-14'), 'MagSafe 3 charging port'),
((SELECT id FROM products WHERE sku = 'ELEC-SNY-XM5'), 'Dual processors for industry-leading noise cancellation'),
((SELECT id FROM products WHERE sku = 'ELEC-SNY-XM5'), 'Up to 30-hour battery life');

-- Seed Products: Fashion (Category ID 2)
INSERT INTO products (sku, name, description, short_description, price, compare_at_price, status, quantity, brand, category_id, featured, badge, rating, reviews_count) VALUES
('FASH-NK-AJ1', 'Air Jordan 1 High OG', 'The legendary basketball sneaker that started it all, featuring iconic colorblocking.', 'Classic comfort, iconic style.', 180.00, 200.00, 'ACTIVE', 15, 'Nike', 2, true, 'Hype', 4.9, 5600),
('FASH-LV-MONO', 'Luxury Leather Wallet', 'Crafted from premium Italian leather with a sleek, minimalist design.', 'Italian leather, slim profile.', 120.00, 150.00, 'ACTIVE', 30, 'Shopease', 2, false, 'Limited', 4.6, 120),
('FASH-RT-CHRONO', 'Silver Chronograph Watch', 'A timeless timepiece featuring a polished stainless steel case and sapphire glass.', 'Stainless steel, water resistant.', 250.00, 350.00, 'ACTIVE', 10, 'Rotary', 2, true, 'Trending', 4.8, 85);

-- Product Images: Fashion
INSERT INTO product_images (product_id, image_url) VALUES
((SELECT id FROM products WHERE sku = 'FASH-NK-AJ1'), 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=800'),
((SELECT id FROM products WHERE sku = 'FASH-LV-MONO'), 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'),
((SELECT id FROM products WHERE sku = 'FASH-RT-CHRONO'), 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800');

-- Seed Products: Home & Living (Category ID 3)
INSERT INTO products (sku, name, description, short_description, price, compare_at_price, status, quantity, brand, category_id, featured, badge, rating, reviews_count) VALUES
('HOME-HMN-AERO', 'Aeron Ergonomic Chair', 'The gold standard in ergonomic seating, designed for all-day comfort and support.', 'Breathable mesh, lumbar support.', 1400.00, 1650.00, 'ACTIVE', 8, 'Herman Miller', 3, true, 'Top Tier', 4.9, 12000),
('HOME-BRV-ORCL', 'Barista Express Coffee Machine', 'Create professional-quality espresso at home with a built-in grinder and steam wand.', 'Bean-to-cup espresso.', 699.00, 799.00, 'ACTIVE', 12, 'Breville', 3, true, 'Popular', 4.7, 4500),
('HOME-MIN-LAMP', 'Minimalist Oak Desk Lamp', 'A sleek, contemporary lighting solution for your workspace with adjustable brightness.', 'Natural oak, warm LED.', 85.00, 110.00, 'ACTIVE', 45, 'Nordic', 3, false, 'Eco', 4.5, 310);

-- Product Images: Home & Living
INSERT INTO product_images (product_id, image_url) VALUES
((SELECT id FROM products WHERE sku = 'HOME-HMN-AERO'), 'https://images.unsplash.com/photo-1589384267710-7a25993e9391?auto=format&fit=crop&q=80&w=800'),
((SELECT id FROM products WHERE sku = 'HOME-BRV-ORCL'), 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&q=80&w=800'),
((SELECT id FROM products WHERE sku = 'HOME-MIN-LAMP'), 'https://images.unsplash.com/photo-1507473885765-e6ed657afbb2?auto=format&fit=crop&q=80&w=800');

-- Seed Products: Fitness & Outdoors (Category ID 4)
INSERT INTO products (sku, name, description, short_description, price, status, quantity, brand, category_id, featured, badge, rating, reviews_count) VALUES
('FIT-GRM-EPX', 'Garmin Epix Pro (Gen 2)', 'The high-performance smartwatch with a stunning AMOLED display and advanced mapping.', 'AMOLED, 30-day battery.', 899.99, 'ACTIVE', 20, 'Garmin', 4, true, 'Pro', 4.8, 620),
('FIT-YOGA-MAT', 'Premium Eco-Grip Yoga Mat', 'Non-slip surface with superior cushioning for the perfect practice, made from natural rubber.', 'Non-slip, eco-friendly.', 120.00, 'ACTIVE', 100, 'Lululemon', 4, false, 'Top Rated', 4.9, 1800),
('FIT-TNF-BCK', 'North Face Terra 55', 'A durable, high-capacity backpack designed for multi-day trekking and mountaineering.', '55L capacity, Dyno Lift.', 170.00, 'ACTIVE', 15, 'The North Face', 4, true, 'Outdoor', 4.7, 950);

-- Product Images: Fitness & Outdoors
INSERT INTO product_images (product_id, image_url) VALUES
((SELECT id FROM products WHERE sku = 'FIT-GRM-EPX'), 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'),
((SELECT id FROM products WHERE sku = 'FIT-YOGA-MAT'), 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=800'),
((SELECT id FROM products WHERE sku = 'FIT-TNF-BCK'), 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800');
