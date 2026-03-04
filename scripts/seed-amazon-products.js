/**
 * ShopEase Premium Product Seeder
 * Integrates with Real-Time Amazon Data API (RapidAPI)
 */
const http = require('http');
const https = require('https');

const RAPID_API_KEY = '09a2b93fdcmsh19fcc910eff2c55p116973isna7f333c5efe2';
const RAPID_API_HOST = 'real-time-amazon-data.p.rapidapi.com';
const PRODUCT_SERVICE_URL = 'https://shop-api.praveen-challa.tech/api';

// Test Admin Credentials from test_all_apis.sh
const ADMIN_EMAIL = 'shopeasetest1@gmail.com';
const ADMIN_PASSWORD = 'Test@1234';

let JWT_TOKEN = '';

async function fetchFromAmazon(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
        const query = new URLSearchParams(params).toString();
        const options = {
            method: 'GET',
            hostname: RAPID_API_HOST,
            port: null,
            path: `${endpoint}?${query}`,
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        };

        const req = https.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                if (res.statusCode >= 400) {
                    reject(new Error(`RapidAPI Error: ${body}`));
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function login() {
    console.log(`🔐 Logging in as ${ADMIN_EMAIL}...`);
    try {
        const response = await postToShopEase('/auth/login', {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        }, false);
        JWT_TOKEN = response.token || response.data?.token;
        if (!JWT_TOKEN) throw new Error('No token in response');
        console.log('✅ Auth successful.');
    } catch (e) {
        console.error(`❌ Login failed: ${e.message}`);
        // Attempt registration if login fails (401 or user not found)
        console.log('📝 Attempting to register test user...');
        try {
            await postToShopEase('/auth/register', {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                firstName: 'Admin',
                lastName: 'Seed',
                address: 'Seeding Robot HQ'
            }, false);
            console.log('✅ Registration successful. Logging in again...');
            await login();
        } catch (regError) {
            console.error(`❌ Registration also failed: ${regError.message}`);
            process.exit(1);
        }
    }
}

async function postToShopEase(endpoint, data, useAuth = true) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const url = new URL(`${PRODUCT_SERVICE_URL}${endpoint}`);

        const options = {
            method: 'POST',
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        if (useAuth && JWT_TOKEN) {
            options.headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
        }

        const requester = url.protocol === 'https:' ? https : http;
        const req = requester.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                if (res.statusCode >= 400) {
                    reject(new Error(`ShopEase Error [${res.statusCode}]: ${body}`));
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function getCategories() {
    return new Promise((resolve, reject) => {
        const url = new URL(`${PRODUCT_SERVICE_URL}/categories`);
        const requester = url.protocol === 'https:' ? https : http;
        requester.get(url, (res) => {
            let chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                try {
                    const data = JSON.parse(body);
                    resolve(data.data || data.content || data);
                } catch (e) { resolve([]); }
            });
        }).on('error', () => resolve([]));
    });
}

async function seed() {
    console.log('🚀 Starting Premium Product Seeding (Amazon API Mode)...');

    await login();

    // 1. Get/Create Categories
    const existingCats = await getCategories();
    console.log(`Found ${existingCats.length} existing categories.`);

    const targetCategories = [
        { name: 'Electronics', description: 'Premium tech and gadgets', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1000' },
        { name: 'Home & Living', description: 'Luxury home essentials', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000' },
        { name: 'Audio', description: 'High-fidelity sound systems', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000' },
        { name: 'Computers', description: 'High-performance computing', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000' }
    ];

    const categoryMap = {};
    for (const cat of targetCategories) {
        let found = existingCats.find(c => c.name?.toLowerCase().includes(cat.name.toLowerCase()));
        if (!found) {
            console.log(`Creating category: ${cat.name}...`);
            try {
                const response = await postToShopEase('/categories', cat);
                found = response.data || response;
            } catch (e) {
                console.error(`Failed to create category ${cat.name}: ${e.message}`);
                continue;
            }
        }
        categoryMap[cat.name] = found.id;
    }

    // 2. Fetch from Amazon and Seed
    const searchTerms = [
        { query: 'MacBook Pro M3 Max', category: 'Computers' },
        { query: 'Sony WH-1000XM5', category: 'Audio' },
        { query: 'iPhone 15 Pro Titanium', category: 'Electronics' },
        { query: 'Dyson Airwrap Multi-Styler', category: 'Home & Living' },
        { query: 'Apple Watch Ultra 2', category: 'Electronics' },
        { query: 'Bose QuietComfort Ultra', category: 'Audio' },
        { query: 'Samsung Galaxy S24 Ultra', category: 'Electronics' }
    ];

    for (const term of searchTerms) {
        console.log(`\n🔍 Searching Amazon for "${term.query}"...`);
        try {
            const result = await fetchFromAmazon('/search', { q: term.query, country: 'US' });

            if (result.status === 'OK' && result.data && result.data.products) {
                const topProducts = result.data.products.slice(0, 5);

                for (const amz of topProducts) {
                    const priceStr = amz.product_price ? amz.product_price.replace(/[^\d.]/g, '') : '999';
                    const price = parseFloat(priceStr) || 999;

                    // Standardizing SKU to match ^[A-Z]{2,5}-[A-Z]{2,5}-[A-Z0-9]{2,5}$
                    // E.g. AMZ-APL-ASIN
                    const prefix = term.category.slice(0, 3).toUpperCase();
                    const brand = (amz.product_title.split(' ')[0] || 'GEN').slice(0, 3).toUpperCase();
                    const suffix = (amz.asin || Math.random().toString(36).substring(7)).toUpperCase().slice(0, 5);
                    const sku = `${prefix}-${brand}-${suffix}`;

                    const productData = {
                        name: amz.product_title,
                        description: `Premium ${term.query}. ${amz.product_title}. Rated ${amz.product_star_rating} stars by customers.`,
                        sku: sku,
                        price: price,
                        status: 'ACTIVE',
                        categoryId: categoryMap[term.category],
                        quantity: 100,
                        featured: true,
                        brand: amz.product_title.split(' ')[0],
                        rating: parseFloat(amz.product_star_rating) || 4.8,
                        reviewsCount: amz.product_num_ratings || 120,
                        imageUrls: [amz.product_photo],
                        highlights: [
                            `Amazon Best Seller`,
                            `${amz.product_star_rating} Star Rating`,
                            `${amz.product_num_ratings} Reviews`,
                            `Real-time Amazon Data`
                        ]
                    };

                    console.log(`📤 Ingesting: ${productData.name.slice(0, 40)}...`);
                    try {
                        await postToShopEase('/products', productData);
                        console.log(`✅ Success: ${productData.sku}`);
                    } catch (e) {
                        console.log(`⏭️  Skip: ${e.message}`);
                    }
                }
            } else {
                console.log(`⚠️ No products found for "${term.query}" or API returned unexpected format.`);
            }
        } catch (e) {
            console.error(`❌ RapidAPI Error for "${term.query}": ${e.message}`);
            if (e.message.includes('403') || e.message.includes('subscription')) {
                console.log('\n💡 TIP: Please verify you have subscribed to the "Real-Time Amazon Data API" on the RapidAPI portal.');
                console.log('Even with a Free Plan, you MUST click "Subscribe" to activate the key for this specific API.');
                process.exit(1);
            }
        }
    }

    console.log('\n✨ Seeding completed with real-time Amazon Data.');
}

async function putToShopEase(endpoint, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const url = new URL(`${PRODUCT_SERVICE_URL}${endpoint}`);

        const options = {
            method: 'PUT',
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Authorization': `Bearer ${JWT_TOKEN}`
            }
        };

        const requester = url.protocol === 'https:' ? https : http;
        const req = requester.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                if (res.statusCode >= 400) {
                    reject(new Error(`ShopEase Error [${res.statusCode}]: ${body}`));
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

seed();
