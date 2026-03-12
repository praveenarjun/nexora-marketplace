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

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Users["👥 Users"]
        C[👤 Customers]
        V[👨‍💼 Vendors]
        A[👑 Admins]
    end

    subgraph Frontend["Frontend"]
        FE["React Frontend\n(Cloudflare Pages + CDN)"]
    end

    subgraph DNS["DNS & SSL"]
        CF["Cloudflare\n(DNS + SSL)"]
    end

    subgraph AzureVM["☁️ Azure VM (B1s)"]
        NGINX["NGINX (Reverse Proxy)\napi.praveen-challa.tech → :8080\neureka.praveen-challa.tech → :8761"]
        GW["API Gateway (Port 8080)\nSpring Cloud Gateway + JWT Auth\nRate Limiting | CORS | Circuit Breaker"]
        EUR["Eureka Discovery Server (Port 8761)\nAll services register here"]

        subgraph Services["Microservices"]
            US["User Service\n:8083\nJWT Auth · 3 Roles"]
            PS["Product Service\n:8081\nRedis Cache · Search"]
            OS["Order Service\n:8082\nFeign Calls · Commission"]
            IS["Inventory Service\n:8084\nReserve · Release · Restock"]
            NS["Notification Service\n:8085\nRabbitMQ Listener · Email"]
        end
    end

    subgraph ExternalServices["☁️ External Services (free tier)"]
        DB["Neon.tech PostgreSQL\n4 separate databases"]
        RD["Upstash Redis\nProduct cache · Rate limit"]
        MQ["CloudAMQP RabbitMQ\nEvent messaging · Async"]
        MON["UptimeRobot\nMonitor + alerts"]
    end

    C & V & A --> FE
    FE -->|HTTPS| CF
    CF --> NGINX
    NGINX --> GW
    GW --> EUR
    EUR --> US & PS & OS & IS & NS
    US --> DB
    PS --> DB
    PS --> RD
    OS --> DB
    IS --> DB
    NS --> MQ
    OS --> MQ
    MON -.->|health checks| GW
```

### 🔄 Request Flow — Order Placement

```mermaid
sequenceDiagram
    actor Customer
    participant GW as API Gateway
    participant OS as Order Service
    participant PS as Product Service
    participant IS as Inventory Service
    participant MQ as RabbitMQ
    participant NS as Notification Service

    Customer->>GW: POST /api/orders (JWT token)
    Note over GW: Validate JWT · Add X-User-Id header<br/>Check rate limit (100 req/15 min)
    GW->>OS: Route via Eureka (lb://order-service)

    OS->>PS: GET /api/products/{id} (Feign)
    PS-->>OS: { name, price, vendorId }
    Note over OS,PS: Circuit breaker: fallback if PS is DOWN

    OS->>IS: POST /api/inventory/check (Feign)
    IS-->>OS: { inStock: true, available: 45 }
    OS->>IS: POST /api/inventory/reserve
    IS-->>OS: { reservationId: "RSV-ABC123" }

    Note over OS: subtotal = price × qty<br/>vendor_commission = subtotal × 0.85<br/>platform_fee = subtotal × 0.15<br/>Save order → Status: CREATED

    OS->>MQ: Publish order.created event
    Note over OS,MQ: Exchange: nexora.exchange<br/>Routing key: order.created (ASYNC)
    OS-->>Customer: { orderId, orderNumber, status }

    MQ->>NS: Consume notification.queue
    NS-->>Customer: 📧 Order confirmation email
    NS-->>Customer: 📬 Vendor notification
    Note over Customer: Total response time: ~500ms
```

### 🗄️ Database Design — Database-per-Service

```mermaid
erDiagram
    %% users_db — owned by user-service
    USERS {
        bigserial id PK
        varchar email "UNIQUE NOT NULL"
        varchar password "BCRYPT HASH"
        varchar first_name
        varchar last_name
        varchar phone
        text address
        varchar role "CUSTOMER|VENDOR|ADMIN"
        timestamp created_at
        timestamp updated_at
    }

    %% products_db — owned by product-service
    PRODUCTS {
        bigserial id PK
        varchar name "NOT NULL"
        text description
        decimal price "10,2"
        varchar category
        varchar image_url
        bigint vendor_id "NOT NULL (no FK — separate DB)"
        boolean is_approved "default false"
        boolean is_active "default true"
        timestamp created_at
        timestamp updated_at
    }

    %% orders_db — owned by order-service
    ORDERS {
        bigserial id PK
        varchar order_number "UNIQUE NX-xxx"
        bigint user_id "NOT NULL"
        decimal total_amount "10,2"
        decimal vendor_commission "85% of total"
        decimal platform_fee "15% of total"
        varchar status "CREATED|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED"
        text shipping_address
        varchar reservation_id
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        bigserial id PK
        bigint order_id FK
        bigint product_id
        varchar product_name "denormalized"
        bigint vendor_id
        int quantity
        decimal unit_price
        decimal subtotal
    }

    %% inventory_db — owned by inventory-service
    INVENTORY {
        bigserial id PK
        bigint product_id "UNIQUE NOT NULL"
        bigint vendor_id "NOT NULL"
        int quantity "total stock"
        int reserved_quantity "locked"
        int low_stock_threshold "default 10"
        timestamp last_restocked_at
        timestamp updated_at
    }

    ORDERS ||--o{ ORDER_ITEMS : "contains"
```

> **Key Design Principle:** No foreign keys or JOINs across databases. `vendor_id` is stored as a plain `Long`. Cross-service data is fetched via Feign REST calls. Each service deploys and scales independently.

### 🚀 CI/CD Pipeline — Zero-Touch Deployment

```mermaid
flowchart TD
    DEV[👨‍💻 Developer pushes to GitHub main] --> GHA

    subgraph GHA["⚙️ GitHub Actions"]
        S1["Stage 1 — BUILD\n• Detect changed services\n• Maven compile\n• Run tests\n• Generate JAR"]
        S2["Stage 2 — DOCKER\n• Build image per service\n• Multi-stage: JDK → JRE\n• Push to GHCR\n• Tag: latest + SHA"]
        S3["Stage 3 — DEPLOY\n• SSH into Azure VM\n• Pull latest images\n• docker compose up\n• Health check\n• Notify"]
        S1 --> S2 --> S3
    end

    S3 --> VM

    subgraph VM["☁️ Azure VM (B1s)"]
        DC["Docker Compose\n• discovery-server restarts first\n• All services restart after Eureka is healthy\n• Nginx: zero-downtime proxy\n• Services register with Eureka in ~30s"]
        INFO["Memory: 7 services × ~130 MB = 910 MB\nRAM: 1 GB + 3 GB swap = 4 GB\nStartup: ~3 minutes"]
        DC --- INFO
    end

    VM --> MON

    subgraph MON["📊 Monitoring"]
        UR["UptimeRobot\n• Checks /actuator/health every 5 min\n• Email alert if service goes DOWN"]
        ACT["Spring Boot Actuator\n• Exposes metrics\n• Eureka dashboard"]
        UR --- ACT
    end

    GHA -.->|"⏱ Build 3m + Docker 5m + Deploy 2m\nTotal: ~10 min to production ✅"| VM
```

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