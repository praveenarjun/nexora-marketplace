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

```mermaid
graph TD
    Client([Client / Frontend]) --> API_Gateway[API Gateway]

    subgraph Core Microservices
        API_Gateway --> Product_Service[Product Service :8081]
        API_Gateway --> Order_Service[Order Service :8082]
        API_Gateway --> User_Service[User Service :8083]
        API_Gateway --> Inventory_Service[Inventory Service :8084]
    end

    subgraph Event Bus
        RabbitMQ[[RabbitMQ Message Broker]]
    end

    subgraph Background Services
        Notification_Service[Notification Service :8085]
    end

    subgraph Infrastructure Services
        Discovery_Server[Discovery Server - Eureka :8763]
        Config_Server[Config Server :8888]
        Zipkin[Zipkin Tracing :9411]
    end

    subgraph Data Layer
        Product_DB[(Product DB - PostgreSQL)]
        Order_DB[(Order DB - PostgreSQL)]
        User_DB[(User DB - PostgreSQL)]
        Inventory_DB[(Inventory DB - PostgreSQL)]
        Redis[(Redis Cache)]
    end

    %% Database connections
    Product_Service -.-> Product_DB
    Order_Service -.-> Order_DB
    User_Service -.-> User_DB
    Inventory_Service -.-> Inventory_DB

    %% Caching
    Product_Service -.-> Redis

    %% Asynchronous Messaging
    Order_Service -.-> RabbitMQ
    Inventory_Service -.-> RabbitMQ
    RabbitMQ -.-> Notification_Service

    %% Infrastructure bindings
    Core Microservices -.-> Discovery_Server
    Core Microservices -.-> Config_Server
    Core Microservices -.-> Zipkin
    API_Gateway -.-> Discovery_Server
    API_Gateway -.-> Config_Server
    API_Gateway -.-> Zipkin
    Notification_Service -.-> Discovery_Server
    Notification_Service -.-> Config_Server
    Notification_Service -.-> Zipkin
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

This script will sequentially test product creation, user creation, inventory updates, and the full order placement flow through the API Gateway.
