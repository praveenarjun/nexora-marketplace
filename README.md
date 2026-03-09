# Nexora Marketplace (ShopEase Microservices)

A microservices-based e-commerce marketplace built with **Spring Boot + Spring Cloud**, backed by **PostgreSQL**, **Redis**, and **RabbitMQ**, with distributed tracing via **Zipkin**, and a **React + Vite** frontend.

> **Note**: Some configuration values in this repo still use the name **“ShopEase”** (e.g., Maven artifactId/groupId and Docker compose variables). This README documents the project as it exists today.

---

## Architecture

### Services

Backend services (Spring Boot, Java 17):

- **discovery-server** – Service discovery (Eureka)
- **config-server** – Centralized configuration (Spring Cloud Config)
- **api-gateway** – Edge gateway (Spring Cloud Gateway)
- **product-service** – Product catalog
- **order-service** – Orders
- **user-service** – Users & authentication
- **inventory-service** – Inventory management
- **notification-service** – Notifications/events

Infrastructure:

- **PostgreSQL** (local dev via Docker)
- **Redis** (caching)
- **RabbitMQ** (messaging)
- **Zipkin** (distributed tracing)

Frontend:

- **frontend/** – React + Vite app

### Local ports (docker-compose)

| Component | Port |
|---|---:|
| API Gateway | `8080` |
| Product Service | `8081` |
| Order Service | `8082` |
| User Service | `8083` |
| Inventory Service | `8084` |
| Notification Service | `8085` |
| Discovery Server (Eureka) | `8763` |
| Config Server | `8888` |
| PostgreSQL | `5433` (host) → `5432` (container) |
| Redis | `6379` |
| RabbitMQ | `5672` (AMQP), `15672` (UI) |
| Zipkin | `9411` |

---

## Tech stack

- **Java 17**, **Spring Boot 3.3.5**, **Spring Cloud 2023.0.3**
- **PostgreSQL**, **Redis**, **RabbitMQ**
- **Zipkin** tracing
- **React** + **Vite** + **Tailwind CSS** (frontend)
- **Docker Compose** for local development

---

## Prerequisites

For local development you can use either Docker Compose (recommended) or run services directly.

### Recommended

- **Docker** + **Docker Compose**

### If running without Docker

- **Java 17**
- **Maven** (or use the provided `./mvnw` wrapper)
- **Node.js** (for `frontend/`)

---

## Quick start (Local Development)

### 1) Start the backend (Docker Compose)

From repo root:

```bash
docker compose up --build
```

This will start:

- Postgres + Redis + RabbitMQ + Zipkin
- Eureka (discovery-server)
- Config Server
- API Gateway
- All core microservices

### 2) Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend uses a Vite environment variable for API base URL.

- Example file: `frontend/.env.example`

Create `frontend/.env`:

```bash
cp .env.example .env
```

Then adjust `VITE_API_URL` as needed.

---

## Environment variables

The system is designed to work with sensible defaults in **local Docker Compose**.

### Common variables

| Variable | Used by | Notes |
|---|---|---|
| `CONFIG_SERVER_URL` | services | Defaults to `http://localhost:8888` in many configs |
| `EUREKA_HOST` / `EUREKA_URL` | services | Service discovery settings |
| `JWT_SECRET` | api-gateway, user-service | JWT signing secret |

### Database variables (examples)

| Variable | Used by | Example |
|---|---|---|
| `PRODUCT_DB_URL` | product-service | `jdbc:postgresql://postgres:5432/product_db` |
| `USER_DB_URL` | user-service | `jdbc:postgresql://postgres:5432/user_db` |
| `INVENTORY_DB_URL` | inventory-service | `jdbc:postgresql://postgres:5432/inventory_db` |
| `ORDER_DB_URL` | order-service | `jdbc:postgresql://postgres:5432/order_db` |

### Frontend variables

| Variable | Meaning |
|---|---|
| `VITE_API_URL` | API base URL used by the React frontend |

---

## Useful URLs (Local)

- Eureka dashboard: `http://localhost:8763`
- Config server actuator health: `http://localhost:8888/actuator/health`
- API gateway: `http://localhost:8080`
- Zipkin UI: `http://localhost:9411`
- RabbitMQ management UI: `http://localhost:15672`

---

## Build / Run without Docker (advanced)

> This repo is a multi-module Maven project.

Build everything:

```bash
./mvnw -q -DskipTests package
```

Then you can run individual services from their module directories, e.g.: 

```bash
cd discovery-server
../mvnw spring-boot:run
```

Repeat for other services. You will need to provide infrastructure (Postgres/Redis/RabbitMQ/Zipkin) separately.

---

## Testing

There are a few shell scripts in the repo root that can help test endpoints:

- `test_all_apis.sh`
- `test_post.sh`
- `test_post2.sh`
- `test_post3.sh`

(These scripts assume a running gateway and specific endpoints; you may need to edit them for your environment.)

---

## Troubleshooting

- If a service fails to start, check logs and ensure dependencies are healthy:
  - `docker compose ps`
  - `docker compose logs -f <service>`
- If you change config in `config-server`, services may need restart to pick up changes.
- For CORS issues in local dev, check gateway CORS settings in `config-server/src/main/resources/configurations/api-gateway.yml`.

---

## Repository notes

- The root `package.json` is minimal and currently only includes a `pg` dependency. The primary Node project is under `frontend/`.
- The repository currently includes a committed `node_modules/` directory. For most projects, this is not recommended; consider removing it and relying on `package-lock.json` instead.

---

## License

No license file was found in the repository at the time this README was written. Add a `LICENSE` file if you intend to open-source this project.