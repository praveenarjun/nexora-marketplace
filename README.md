# ShopEase E-Commerce Microservices Platform

A highly scalable, robust, and production-ready e-commerce microservices architecture built with **Java 17**, **Spring Boot 3**, and **Spring Cloud**. This project demonstrates modern distributed system patterns suitable for large-scale enterprise applications, focusing on high availability, fault tolerance, and event-driven communication.

## 🌟 Key Features

- **Microservices Architecture**: Domain-driven design decomposing the e-commerce domain into independently scalable services.
- **API Gateway**: Single entry point handling routing, security, and cross-cutting concerns using Spring Cloud Gateway.
- **Service Discovery**: Dynamic service registration and discovery via Netflix Eureka.
- **Centralized Configuration**: Externalized and dynamic configuration management across all environments using Spring Cloud Config.
- **Event-Driven Communication**: Asynchronous messaging and decoupling between services using RabbitMQ.
- **Distributed Tracing**: End-to-end request tracking and performance monitoring with Zipkin.
- **Database per Service**: Independent PostgreSQL databases for each microservice to ensure loose coupling and data autonomy.
- **Caching Strategy**: Redis integration for high-performance data retrieval and reduced database load.
- **Containerization**: Fully containerized deployment utilizing Docker and Docker Compose.

## 🛠️ Tech Stack

- **Core**: Java 17, Spring Boot 3.3.5, Spring Cloud 2023.0.3
- **Infrastructure**: Netflix Eureka (Service Registry), Spring Cloud Config Server, Spring Cloud Gateway
- **Databases**: PostgreSQL 16 (Relational DB)
- **Caching**: Redis 7
- **Messaging/Event Bus**: RabbitMQ 3
- **Observability**: Zipkin (Distributed Tracing), Micrometer
- **Build & Tools**: Maven, Docker, Docker Compose, MapStruct, Lombok

## 🏗️ Architecture Diagram


Use Excalidraw (https://excalidraw.com/) or draw.io 
to create this diagram and attach to your post:

TITLE: "Nexora Marketplace — System Architecture"

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  👤 CUSTOMERS          👨‍💼 VENDORS           👑 ADMINS              │
│      │                     │                    │                │
│      └─────────────────────┴────────────────────┘                │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │  React Frontend │                           │
│                    │  (Cloudflare    │                           │
│                    │   Pages + CDN)  │                           │
│                    └────────┬────────┘                           │
│                             │ HTTPS                              │
│                    ┌────────▼────────┐                           │
│                    │    Cloudflare   │                           │
│                    │   (DNS + SSL)   │                           │
│                    └────────┬────────┘                           │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │                   AZURE VM (B1s)                         │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │                 NGINX                             │   │    │
│  │  │           (Reverse Proxy)                         │   │    │
│  │  │   api.praveen-challa.tech → :8080                │   │    │
│  │  │   eureka.praveen-challa.tech → :8761             │   │    │
│  │  └──────────────────────┬───────────────────────────┘   │    │
│  │                         │                                │    │
│  │  ┌──────────────────────▼───────────────────────────┐   │    │
│  │  │           API GATEWAY (Port 8080)                 │   │    │
│  │  │      Spring Cloud Gateway + JWT Auth              │   │    │
│  │  │    Rate Limiting | CORS | Circuit Breaker         │   │    │
│  │  └──────────────────────┬───────────────────────────┘   │    │
│  │                         │                                │    │
│  │  ┌──────────────────────▼───────────────────────────┐   │    │
│  │  │        EUREKA DISCOVERY SERVER (Port 8761)        │   │    │
│  │  │         All services register here                │   │    │
│  │  └──────────────────────┬───────────────────────────┘   │    │
│  │                         │                                │    │
│  │     ┌──────────┬────────┼────────┬──────────┐           │    │
│  │     │          │        │        │          │           │    │
│  │  ┌──▼───┐  ┌───▼──┐  ┌─▼────┐ ┌─▼─────┐ ┌─▼──────┐   │    │
│  │  │USER  │  │PRODCT│  │ORDER │ │INVENT. │ │NOTIF.  │   │    │
│  │  │SERV. │  │SERV. │  │SERV. │ │SERV.   │ │SERV.   │   │    │
│  │  │      │  │      │  │      │ │        │ │        │   │    │
│  │  │:8083 │  │:8081 │  │:8082 │ │:8084   │ │:8085   │   │    │
│  │  │      │  │      │  │      │ │        │ │        │   │    │
│  │  │JWT   │  │Redis │  │Feign │ │Reserve │ │RabbitMQ│   │    │
│  │  │Auth  │  │Cache │  │Calls │ │Release │ │Listener│   │    │
│  │  │3Roles│  │Search│  │Commis│ │Restock │ │Email   │   │    │
│  │  └──┬───┘  └──┬───┘  └──┬───┘ └──┬─────┘ └──┬─────┘   │    │
│  │     │         │         │        │          │           │    │
│  └─────┴─────────┴─────────┴────────┴──────────┴───────────┘    │
│            │             │             │              │           │
│  ┌─────────▼──┐  ┌───────▼───┐  ┌─────▼─────┐  ┌────▼──────┐  │
│  │            │  │           │  │           │  │           │  │
│  │  NEON.TECH │  │  UPSTASH  │  │ CLOUDAMQP │  │  UPTIME   │  │
│  │ PostgreSQL │  │   Redis   │  │ RabbitMQ  │  │  ROBOT    │  │
│  │            │  │           │  │           │  │           │  │
│  │ 4 separate │  │ Product   │  │ Event     │  │ Monitor   │  │
│  │ databases  │  │ cache     │  │ messaging │  │ + alerts  │  │
│  │            │  │ Rate limit│  │ Async     │  │           │  │
│  └────────────┘  └───────────┘  └───────────┘  └───────────┘  │
│                                                                  │
│  EXTERNAL SERVICES (all free tier)                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

### Request Flow Diagram

TITLE: "Order Placement Flow — How 5 Services Coordinate"

  👤 Customer clicks "Place Order"
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: API Gateway                                          │
│ ├── Receives POST /api/orders                                │
│ ├── Extracts JWT from Authorization header                   │
│ ├── Validates token signature + expiry                       │
│ ├── Adds headers: X-User-Id, X-User-Email, X-User-Role      │
│ ├── Checks rate limit (100 req/15 min)                       │
│ └── Routes to order-service via Eureka (lb://order-service)  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: Order Service receives request                       │
│ ├── Reads X-User-Id from header (set by gateway)             │
│ ├── Calls Product Service (via OpenFeign):                   │
│ │   GET /api/products/{id}                                   │
│ │   → Gets product name, price, vendorId                     │
│ │   → If product-service is DOWN → circuit breaker triggers  │
│ │   → Returns fallback: "Product service unavailable"        │
│ └── Got product details                                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: Order Service calls Inventory Service (via Feign)    │
│ ├── POST /api/inventory/check                                │
│ │   → Checks if enough stock available                       │
│ │   → Returns: { inStock: true, available: 45 }              │
│ ├── POST /api/inventory/reserve                              │
│ │   → Reserves quantity (available → reserved)               │
│ │   → Returns: { reservationId: "RSV-ABC123" }               │
│ │   → If insufficient → returns 409 Conflict                 │
│ └── Stock reserved                                         │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: Order Service calculates & saves                     │
│ ├── Calculate totals:                                        │
│ │   subtotal = price × quantity                              │
│ │   vendor_commission = subtotal × 0.85 (85%)                │
│ │   platform_fee = subtotal × 0.15 (15%)                     │
│ ├── Create Order record in orders_db (PostgreSQL)            │
│ ├── Status: CREATED                                          │
│ └── Order saved                                            │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: Order Service publishes event to RabbitMQ            │
│ ├── Exchange: "nexora.exchange"                              │
│ ├── Routing key: "order.created"                             │
│ ├── Message: { orderId, orderNumber, userId, totalAmount,    │
│ │              vendorId, items, shippingAddress }             │
│ ├── Message is ASYNC — order-service doesn't wait            │
│ └── Event published                                        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 6: Notification Service (listens to RabbitMQ)           │
│ ├── Queue: "notification.queue" bound to "order.*"           │
│ ├── Receives order.created event                             │
│ ├── Prepares order confirmation email                        │
│ ├── Sends email to customer (or logs in dev mode)            │
│ ├── Prepares vendor notification: "New order received!"      │
│ └── Notifications sent                                     │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
   Customer gets response: { orderId, orderNumber, status }
   Email confirmation sent asynchronously
   Vendor notified of new order
   Total response time: ~500ms (no cold start on Azure!)

### Database Design Diagram
TITLE: "Nexora — Database-per-Service Design"

┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌─────────────────────────────────────────┐                 │
│  │         users_db (PostgreSQL)           │                 │
│  │         Owned by: user-service          │                 │
│  ├─────────────────────────────────────────┤                 │
│  │  users                                  │                 │
│  │  ├── id (PK, BIGSERIAL)                │                 │
│  │  ├── email (UNIQUE, NOT NULL)          │                 │
│  │  ├── password (BCRYPT HASH)            │                 │
│  │  ├── first_name, last_name             │                 │
│  │  ├── phone, address                    │                 │
│  │  ├── role (CUSTOMER|VENDOR|ADMIN)      │                 │
│  │  ├── created_at, updated_at            │                 │
│  │  └──  Index: email (login lookup)     │                 │
│  └─────────────────────────────────────────┘                 │
│                                                               │
│  ┌─────────────────────────────────────────┐                 │
│  │       products_db (PostgreSQL)          │                 │
│  │       Owned by: product-service         │                 │
│  ├─────────────────────────────────────────┤                 │
│  │  products                               │                 │
│  │  ├── id (PK, BIGSERIAL)                │                 │
│  │  ├── name (NOT NULL)                   │                 │
│  │  ├── description (TEXT)                │                 │
│  │  ├── price (DECIMAL 10,2)              │                 │
│  │  ├── category (VARCHAR)                │                 │
│  │  ├── image_url (VARCHAR)               │                 │
│  │  ├── vendor_id (NOT NULL) ←────────────│── links to user │
│  │  ├── is_approved (BOOLEAN, def false)  │   but NOT FK!   │
│  │  ├── is_active (BOOLEAN, def true)     │   (separate DB) │
│  │  ├── created_at, updated_at            │                 │
│  │  ├──  Index: category                 │                 │
│  │  ├──  Index: vendor_id                │                 │
│  │  └──  Index: name (search)            │                 │
│  │                                         │                 │
│  │  📦 Redis Cache Layer:                  │                 │
│  │  ├── product:{id} → cached product JSON│                 │
│  │  ├── products:category:{name} → list   │                 │
│  │  └── TTL: 10 minutes                   │                 │
│  └─────────────────────────────────────────┘                 │
│                                                               │
│  ┌─────────────────────────────────────────┐                 │
│  │        orders_db (PostgreSQL)           │                 │
│  │        Owned by: order-service          │                 │
│  ├─────────────────────────────────────────┤                 │
│  │  orders                                 │                 │
│  │  ├── id (PK, BIGSERIAL)                │                 │
│  │  ├── order_number (UNIQUE, "NX-xxx")   │                 │
│  │  ├── user_id (NOT NULL)                │                 │
│  │  ├── total_amount (DECIMAL 10,2)       │                 │
│  │  ├── vendor_commission (DECIMAL 10,2)  │── 85% of total  │
│  │  ├── platform_fee (DECIMAL 10,2)       │── 15% of total  │
│  │  ├── status (CREATED|CONFIRMED|        │                 │
│  │  │         PROCESSING|SHIPPED|         │                 │
│  │  │         DELIVERED|CANCELLED)        │                 │
│  │  ├── shipping_address (TEXT)           │                 │
│  │  ├── reservation_id (VARCHAR)          │                 │
│  │  ├── created_at, updated_at            │                 │
│  │  └──  Index: user_id, status          │                 │
│  │                                         │                 │
│  │  order_items                            │                 │
│  │  ├── id (PK)                           │                 │
│  │  ├── order_id (FK → orders)            │                 │
│  │  ├── product_id                        │                 │
│  │  ├── product_name (denormalized)       │                 │
│  │  ├── vendor_id                         │                 │
│  │  ├── quantity (INT)                    │                 │
│  │  ├── unit_price (DECIMAL)              │                 │
│  │  └── subtotal (DECIMAL)               │                 │
│  └─────────────────────────────────────────┘                 │
│                                                               │
│  ┌─────────────────────────────────────────┐                 │
│  │      inventory_db (PostgreSQL)          │                 │
│  │      Owned by: inventory-service        │                 │
│  ├─────────────────────────────────────────┤                 │
│  │  inventory                              │                 │
│  │  ├── id (PK, BIGSERIAL)                │                 │
│  │  ├── product_id (UNIQUE, NOT NULL)     │                 │
│  │  ├── vendor_id (NOT NULL)              │                 │
│  │  ├── quantity (INT, total stock)       │                 │
│  │  ├── reserved_quantity (INT, locked)   │                 │
│  │  ├── low_stock_threshold (INT, def 10) │                 │
│  │  ├── last_restocked_at (TIMESTAMP)     │                 │
│  │  ├── updated_at (TIMESTAMP)            │                 │
│  │  └──  Index: product_id, vendor_id    │                 │
│  │                                         │                 │
│  │  Computed:                              │                 │
│  │  available = quantity - reserved_quantity│                 │
│  │  is_low_stock = available ≤ threshold  │                 │
│  └─────────────────────────────────────────┘                 │
│                                                               │
│  ═══════════════════════════════════════════                  │
│  KEY DESIGN PRINCIPLE:                                        │
│  ┌──────────────────────────────────────┐                    │
│  │  No foreign keys ACROSS databases  │                    │
│  │  No JOINs across services          │                    │
│  │  vendor_id stored as plain Long    │                    │
│  │ Data fetched via Feign REST calls │                    │
│  │  Each service can deploy/scale     │                    │
│  │    independently                     │                    │
│  └──────────────────────────────────────┘                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘


### Deployment Pipeline Diagram
TITLE: "CI/CD Pipeline — Zero-Touch Deployment"

  Developer pushes code to GitHub (main branch)
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS                             │
│                                                               │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │   STAGE 1   │───▶│   STAGE 2    │───▶│    STAGE 3     │  │
│  │   BUILD     │    │   DOCKER     │    │    DEPLOY      │  │
│  │             │    │              │    │                │  │
│  │ • Detect    │    │ • Build image│    │ • SSH into     │  │
│  │   changed   │    │   for each   │    │   Azure VM     │  │
│  │   services  │    │   service    │    │ • Pull latest  │  │
│  │ • Maven     │    │ • Multi-stage│    │   images       │  │
│  │   compile   │    │   (JDK→JRE)  │    │ • docker       │  │
│  │ • Run tests │    │ • Push to    │    │   compose up   │  │
│  │ • Generate  │    │   GHCR       │    │ • Health check │  │
│  │   JAR       │    │ • Tag: latest│    │ • Notify       │  │
│  │             │    │   + SHA      │    │                │  │
│  └─────────────┘    └──────────────┘    └────────────────┘  │
│                                                               │
│  Time: Build (3 min) + Docker (5 min) + Deploy (2 min)       │
│  Total: ~10 minutes from push to production ✅               │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    AZURE VM (B1s)                             │
│                                                               │
│  Docker Compose pulls new images                              │
│  ├── discovery-server restarts first (healthcheck)           │
│  ├── All other services restart after discovery is healthy   │
│  ├── Nginx continues serving (zero downtime proxy)           │
│  └── Services register with Eureka within 30 seconds         │
│                                                               │
│  Memory: 7 services × ~130 MB = 910 MB                      │
│  RAM: 1 GB + 3 GB swap = 4 GB available                     │
│  Startup: ~3 minutes total                                   │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  MONITORING                                                   │
│  ├── UptimeRobot checks /actuator/health every 5 min         │
│  ├── Email alert if any service goes DOWN                    │
│  ├── Spring Boot Actuator exposes metrics                    │
│  └── Eureka dashboard shows all registered services          │
└──────────────────────────────────────────────────────────────┘



  

## 📦 Services Overview

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | `8080` | Routes incoming requests to appropriate downstream microservices. |
| **Product Service** | `8081` | Manages product catalog, details, and categories. Uses Redis for caching. |
| **Order Service** | `8082` | Handles order creation and lifecycle. Publishes order events. |
| **User Service** | `8083` | Manages user profiles, authentication, and authorization details. |
| **Inventory Service** | `8084` | Tracks stock levels and reserves items during order placement. |
| **Notification Service** | `8085` | Consumes events (e.g., order placed) and sends notifications (Emails/SMS). |
| **Discovery Server** | `8763` | Eureka server for service registry and health monitoring. |
| **Config Server** | `8888` | Centralized configuration server for all microservices. |

## 🚀 Getting Started

### Prerequisites

- Java 17
- Maven 3.8+
- Docker & Docker Compose

### Running the Application Locally

**1. Build all microservices**

From the root directory, compile and package the microservices (skipping tests for a faster build):

```bash
./mvnw clean package -DskipTests
```

**2. Start the infrastructure and services**

Use Docker Compose to spin up the databases, message broker, tracing server, and all microservices:

```bash
docker-compose up --build -d
```

*Note: The first startup might take a few minutes as Docker downloads necessary images and initializes the PostgreSQL databases using the provided `init-databases.sql` script.*

**3. Verify Deployments**

You can verify that services are up and running by visiting their respective dashboards:

- **API Gateway**: `http://localhost:8080`
- **Eureka Dashboard**: `http://localhost:8763` (Check registered instances here)
- **RabbitMQ Management Console**: `http://localhost:15672` (Credentials: `guest` / `guest`)
- **Zipkin Distributed Tracing**: `http://localhost:9411`

### Stopping the Application

To stop the running containers and remove them:

```bash
docker-compose down
```

To also remove the associated volumes (e.g., to wipe database data):

```bash
docker-compose down -v
```

## 🧪 Testing the APIs

Once all services are healthy and registered in Eureka, you can test the entire flow using the provided script:

```bash
./test_all_apis.sh
```

This script will sequentially test product creation, user creation, inventory updates, and the full order placement flow through the API Gateway.
