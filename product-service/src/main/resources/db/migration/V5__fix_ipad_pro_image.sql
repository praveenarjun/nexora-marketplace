-- Fix broken image for iPad Pro 13 (M4)
UPDATE product_images 
SET image_url = 'https://www.cnet.com/a/img/resize/fbbdeaaf59fb6938e4b5b4f5fa93d01d1f324406/hub/2020/09/16/77a4cda1-0d41-449f-8eb2-66c1a8c37414/011-apple-ipad-2020.jpg?auto=webp&width=1200'
WHERE product_id = (SELECT id FROM products WHERE sku = 'ELEC-IPD-PRO');

-- Fix broken image for Herman Miller Aeron Chair (ID 39)
UPDATE product_images 
SET image_url = 'https://m.media-amazon.com/images/I/71kMNZWwNjL._AC_UF894,1000_QL80_.jpg'
WHERE product_id = 39;

