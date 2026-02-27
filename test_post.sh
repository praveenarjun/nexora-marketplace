#!/bin/bash
curl -s -X POST "https://shop-api.praveen-challa.tech/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Admin","lastName":"User","email":"admin4@example.com","password":"Password123!","address":"123 Fake St"}'

TOKEN=$(curl -s -X POST "https://shop-api.praveen-challa.tech/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin4@example.com", "password":"Password123!"}' | jq -r .data.token)

echo "Got token, length: ${#TOKEN}"

curl -s -v -X POST "https://shop-api.praveen-challa.tech/api/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "This is a test product",
    "price": 99.99,
    "skuCode": "TEST-PROD-002",
    "categoryId": 1
  }' > response2.txt 2>&1

cat response2.txt
