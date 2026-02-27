#!/bin/bash
TOKEN=$(curl -s -X POST "https://shop-api.praveen-challa.tech/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin4@example.com", "password":"Password123!"}' | jq -r .token)

curl -s -v -X POST "https://shop-api.praveen-challa.tech/api/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "This is a test product",
    "price": 99.99,
    "skuCode": "TEST-PROD-002",
    "categoryId": 1
  }' > response4.txt 2>&1

cat response4.txt
