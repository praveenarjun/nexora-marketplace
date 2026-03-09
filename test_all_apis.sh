#!/bin/bash
# =============================================================================
# ShopEase — Full Backend API Test Script (FINAL FIXED)
# Fixes applied:
#   1. ok() function uses true instead of ((pass++)) to avoid bash exit-code bug
#   2. Category created FIRST, its ID used in product creation
#   3. PUT profile includes required 'address' field
#   4. OrderRequest.shippingAddress is a plain String
# =============================================================================

BASE="http://localhost:8080"
G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; C='\033[0;36m'; NC='\033[0m'
pass=0; fail=0

# FIX: Use 'true' at end so function always exits 0 — prevents false-fail in &&/||
ok() {
  echo -e "  ${G}✓ PASS${NC} [$1] $2"
  ((pass++)) || true
}
err() {
  echo -e "  ${R}✗ FAIL${NC} [got $1, want $2] $3"
  ((fail++)) || true
}
check() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" -eq "$expected" ] 2>/dev/null; then ok "$actual" "$label"
  else err "$actual" "$expected" "$label"; fi
}
section() {
  echo -e "\n${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${Y}  $1${NC}"
  echo -e "${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. AUTH SERVICE
# Fields: email, password, firstName, lastName, address  (NO role field!)
# ─────────────────────────────────────────────────────────────────────────────
section "1. AUTH SERVICE"

echo -e "\n→ POST /api/auth/register (user1)"
R1=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"shopeasetest1@gmail.com","password":"Test@1234","firstName":"Alice","lastName":"Smith","address":"123 Main Street, Mumbai 400001"}')
C1=$(echo "$R1" | tail -1)
if [ "$C1" -eq 201 ] || [ "$C1" -eq 409 ]; then ok "$C1" "Register user1 (201=new, 409=exists)"
else err "$C1" "201 or 409" "Register user1"; echo -e "  Body: $(echo "$R1" | head -1)"; fi

echo -e "\n→ POST /api/auth/register (user2)"
R2=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"shopeasetest2@gmail.com","password":"Test@5678","firstName":"Bob","lastName":"Jones","address":"456 Park Avenue, Delhi 110001"}')
C2=$(echo "$R2" | tail -1)
if [ "$C2" -eq 201 ] || [ "$C2" -eq 409 ]; then ok "$C2" "Register user2 (201=new, 409=exists)"
else err "$C2" "201 or 409" "Register user2"; echo -e "  Body: $(echo "$R2" | head -1)"; fi

echo -e "\n→ POST /api/auth/login (user1)"
LR1=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shopeasetest1@gmail.com","password":"Test@1234"}')
TOKEN1=$(echo "$LR1" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN1" ]; then ok "200" "Login user1 — token captured"
else err "no-token" "JWT" "Login user1"; echo -e "  Response: $LR1"; fi

echo -e "\n→ POST /api/auth/login (user2)"
LR2=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shopeasetest2@gmail.com","password":"Test@5678"}')
TOKEN2=$(echo "$LR2" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN2" ]; then ok "200" "Login user2 — token captured"
else err "no-token" "JWT" "Login user2"; echo -e "  Response: $LR2"; fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. USER PROFILE
# UpdateProfileRequest: firstName, lastName, address (all @NotBlank), phone (optional)
# ─────────────────────────────────────────────────────────────────────────────
section "2. USER PROFILE"

echo -e "\n→ GET /api/users/profile"
check "GET my profile" 200 \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/users/profile \
    -H "Authorization: Bearer $TOKEN1")

echo -e "\n→ PUT /api/users/profile (firstName + lastName + address all required)"
check "PUT update profile" 200 \
  $(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE/api/users/profile \
    -H "Authorization: Bearer $TOKEN1" \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Alicia","lastName":"Smith","address":"123 Main Street, Mumbai 400001"}')

# ─────────────────────────────────────────────────────────────────────────────
# 3. PRODUCTS — Public (no auth)
# ─────────────────────────────────────────────────────────────────────────────
section "3. PRODUCTS — Public Reads (no auth)"

echo -e "\n→ GET /api/products"
check "GET all products (paginated)" 200 $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/products)

echo -e "\n→ GET /api/products/featured"
check "GET featured products" 200 $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/products/featured)

echo -e "\n→ GET /api/products/low-stock"
check "GET low-stock products" 200 $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/products/low-stock)

echo -e "\n→ GET /api/products/filter?search=phone"
check "GET filter by keyword" 200 \
  $(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/products/filter?search=phone")

echo -e "\n→ GET /api/products/filter?minPrice=10&maxPrice=999&status=ACTIVE"
check "GET filter by price + status" 200 \
  $(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/products/filter?minPrice=10&maxPrice=999&status=ACTIVE")

# ─────────────────────────────────────────────────────────────────────────────
# 4. CATEGORIES — Must create FIRST before creating products
#    Product creation needs a valid categoryId that exists in DB
# ─────────────────────────────────────────────────────────────────────────────
section "4. CATEGORIES (create FIRST — product needs a valid categoryId)"

echo -e "\n→ GET /api/categories"
check "GET all categories" 200 $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/categories)

echo -e "\n→ POST /api/categories (create test category)"
CCRESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/categories \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic gadgets and devices"}')
CCCODE=$(echo "$CCRESP" | tail -1)
CAT_ID=$(echo "$CCRESP" | head -1 | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ "$CCCODE" -eq 201 ] || [ "$CCCODE" -eq 409 ]; then
  ok "$CCCODE" "POST create category 'Electronics'"
  # If 409 (already exists), get its ID from the list
  if [ -z "$CAT_ID" ]; then
    CATLIST=$(curl -s $BASE/api/categories)
    CAT_ID=$(echo "$CATLIST" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo -e "  ${C}→ Found existing category ID: $CAT_ID${NC}"
  else
    echo -e "  ${C}→ Created category ID: $CAT_ID${NC}"
  fi
else
  err "$CCCODE" "201 or 409" "POST create category"
  echo -e "  Body: $(echo "$CCRESP" | head -1)"
fi

if [ -n "$CAT_ID" ]; then
  echo -e "\n→ GET /api/categories/$CAT_ID"
  check "GET category by ID" 200 $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/categories/$CAT_ID)

  # Create a second category just to test update/delete on it
  echo -e "\n→ POST /api/categories (create temp category for update/delete test)"
  TMPCRESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/categories \
    -H "Authorization: Bearer $TOKEN1" \
    -H "Content-Type: application/json" \
    -d '{"name":"TempDeleteCategory","description":"Will be deleted by test"}')
  TMPCODE=$(echo "$TMPCRESP" | tail -1)
  TMP_CAT_ID=$(echo "$TMPCRESP" | head -1 | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  if [ "$TMPCODE" -eq 201 ] && [ -n "$TMP_CAT_ID" ]; then
    echo -e "\n→ PUT /api/categories/$TMP_CAT_ID"
    check "PUT update category" 200 \
      $(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE/api/categories/$TMP_CAT_ID \
        -H "Authorization: Bearer $TOKEN1" \
        -H "Content-Type: application/json" \
        -d '{"name":"TempDeleteCategoryUpdated","description":"Updated description"}')
    echo -e "\n→ DELETE /api/categories/$TMP_CAT_ID"
    check "DELETE category" 200 \
      $(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE/api/categories/$TMP_CAT_ID \
        -H "Authorization: Bearer $TOKEN1")
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. PRODUCTS — Protected Writes (uses CAT_ID from section 4)
#    ValidSKU: ^[A-Z]{2,5}-[A-Z]{2,5}-[A-Z0-9]{2,5}$  e.g. ELEC-PHN-X01
# ─────────────────────────────────────────────────────────────────────────────
section "5. PRODUCTS — Protected Writes (auth required)"

if [ -z "$CAT_ID" ]; then
  echo -e "  ${R}✗ SKIP — No category ID available, cannot create product (categoryId is required)${NC}"
  ((fail++)) || true
else
  echo -e "\n→ POST /api/products (create — sku must match [A-Z]{2,5}-[A-Z]{2,5}-[A-Z0-9]{2,5})"
  PCRESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/products \
    -H "Authorization: Bearer $TOKEN1" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Smartphone X1\",\"description\":\"Flagship test device\",\"sku\":\"ELEC-PHN-X01\",\"price\":499.99,\"status\":\"ACTIVE\",\"categoryId\":$CAT_ID,\"brand\":\"TestBrand\",\"quantity\":0}")
  PCCODE=$(echo "$PCRESP" | tail -1)
  PID=$(echo "$PCRESP" | head -1 | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

  if [ "$PCCODE" -eq 201 ] || [ "$PCCODE" -eq 409 ]; then
    ok "$PCCODE" "POST create product (201=new, 409=sku exists)"
  else
    err "$PCCODE" "201 or 409" "POST create product"
    echo -e "  Body: $(echo "$PCRESP" | head -1)"
  fi

  # If SKU already exists (409), fetch the existing product's ID
  if [ -z "$PID" ]; then
    SKURESP=$(curl -s $BASE/api/products/sku/ELEC-PHN-X01)
    PID=$(echo "$SKURESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  fi
  echo -e "  ${C}→ Working with Product ID: ${PID:-NOT_FOUND}${NC}"

  echo -e "\n→ GET /api/products/$PID"
  check "GET product by ID" 200 $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/products/$PID)

  echo -e "\n→ GET /api/products/sku/ELEC-PHN-X01"
  check "GET product by SKU" 200 $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/products/sku/ELEC-PHN-X01)

  if [ -n "$PID" ]; then
    echo -e "\n→ PUT /api/products/$PID"
    check "PUT update product" 200 \
      $(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE/api/products/$PID \
        -H "Authorization: Bearer $TOKEN1" \
        -H "Content-Type: application/json" \
        -d '{"name":"Test Smartphone X1 Pro","description":"Updated flagship","price":449.99,"status":"ACTIVE"}')

    echo -e "\n→ PATCH /api/products/$PID/status?status=INACTIVE"
    check "PATCH status → INACTIVE" 200 \
      $(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
        "$BASE/api/products/$PID/status?status=INACTIVE" \
        -H "Authorization: Bearer $TOKEN1")

    echo -e "\n→ PATCH /api/products/$PID/status?status=ACTIVE (restoring)"
    curl -s -o /dev/null -X PATCH "$BASE/api/products/$PID/status?status=ACTIVE" \
      -H "Authorization: Bearer $TOKEN1"
    echo -e "  ${C}→ Restored to ACTIVE${NC}"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. INVENTORY SERVICE (uses PID from section 5)
# ─────────────────────────────────────────────────────────────────────────────
section "6. INVENTORY SERVICE"

if [ -z "$PID" ]; then
  echo -e "  ${Y}⚠ Skipping — no product ID available${NC}"
else
  echo -e "\n→ POST /api/inventory/restock?productId=$PID&quantity=100"
  check "POST restock inventory" 200 \
    $(curl -s -o /dev/null -w "%{http_code}" -X POST \
      "$BASE/api/inventory/restock?productId=$PID&quantity=100" \
      -H "Authorization: Bearer $TOKEN1")

  echo -e "\n→ GET /api/inventory/$PID"
  check "GET inventory for product" 200 \
    $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/inventory/$PID \
      -H "Authorization: Bearer $TOKEN1")

  echo -e "\n→ POST /api/inventory/check"
  check "POST check stock availability" 200 \
    $(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/inventory/check \
      -H "Authorization: Bearer $TOKEN1" \
      -H "Content-Type: application/json" \
      -d "[{\"productId\":$PID,\"quantity\":5}]")
fi

# ─────────────────────────────────────────────────────────────────────────────
# 7. ORDER SERVICE
# shippingAddress = plain String (NOT a JSON object!)
# ─────────────────────────────────────────────────────────────────────────────
section "7. ORDER SERVICE"

echo -e "\n→ GET /api/orders (my orders)"
check "GET my orders (empty or not)" 200 \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/orders \
    -H "Authorization: Bearer $TOKEN2")

if [ -z "$PID" ]; then
  echo -e "  ${Y}⚠ Skipping place-order test — no product ID${NC}"
else
  echo -e "\n→ POST /api/orders (place order — shippingAddress is a plain string)"
  ORESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/orders \
    -H "Authorization: Bearer $TOKEN2" \
    -H "Content-Type: application/json" \
    -d "{\"items\":[{\"productId\":$PID,\"quantity\":1}],\"shippingAddress\":\"123 Park Street, Mumbai 400001, India\"}")
  OCODE=$(echo "$ORESP" | tail -1)
  OID=$(echo "$ORESP" | head -1 | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

  if [ "$OCODE" -eq 201 ]; then
    ok "$OCODE" "POST place order — Order ID: $OID"
  else
    err "$OCODE" "201" "POST place order"
    echo -e "  Body: $(echo "$ORESP" | head -1)"
  fi

  if [ -n "$OID" ]; then
    echo -e "\n→ GET /api/orders/$OID"
    check "GET order by ID" 200 \
      $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/orders/$OID \
        -H "Authorization: Bearer $TOKEN2")

    echo -e "\n→ POST /api/orders/$OID/cancel"
    check "POST cancel order" 200 \
      $(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/orders/$OID/cancel \
        -H "Authorization: Bearer $TOKEN2")
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# 8. SECURITY — Unauthenticated requests must return 401
# ─────────────────────────────────────────────────────────────────────────────
section "8. SECURITY CHECKS (no token → must get 401)"

echo -e "\n→ POST /api/products (no token)"
check "POST /api/products without auth → 401" 401 \
  $(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/products \
    -H "Content-Type: application/json" -d '{"name":"hack"}')

echo -e "\n→ GET /api/orders (no token)"
check "GET /api/orders without auth → 401" 401 \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/orders)

echo -e "\n→ GET /api/users/profile (no token)"
check "GET /api/users/profile without auth → 401" 401 \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/api/users/profile)

echo -e "\n→ POST /api/inventory/restock (no token)"
check "POST /api/inventory/restock without auth → 401" 401 \
  $(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "$BASE/api/inventory/restock?productId=1&quantity=10")

# ─────────────────────────────────────────────────────────────────────────────
section "FINAL SUMMARY"
total=$((pass + fail))
echo ""
echo -e "  Total Tests : $total"
echo -e "  ${G}Passed      : $pass${NC}"
echo -e "  ${R}Failed      : $fail${NC}"
echo ""
if [ $fail -eq 0 ]; then
  echo -e "  ${G}🎉 ALL TESTS PASSED — ShopEase backend is fully working!${NC}"
else
  echo -e "  ${Y}⚠  $fail test(s) failed — see details above.${NC}"
fi
echo ""
