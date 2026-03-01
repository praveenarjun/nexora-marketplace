CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    parent_id BIGINT REFERENCES categories(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(255),
    price DECIMAL(19, 2) NOT NULL,
    compare_at_price DECIMAL(19, 2),
    cost_price DECIMAL(19, 2),
    status VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    brand VARCHAR(255),
    weight_grams DOUBLE PRECISION,
    category_id BIGINT REFERENCES categories(id),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_tags (
    product_id BIGINT NOT NULL REFERENCES products(id),
    tag VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id, tag)
);

CREATE TABLE IF NOT EXISTS product_images (
    product_id BIGINT NOT NULL REFERENCES products(id),
    image_url VARCHAR(1000) NOT NULL,
    PRIMARY KEY (product_id, image_url)
);
