# SupportIQ Deployment Guide

## Local Development

### 1. Start Infrastructure
```bash
cp .env.example .env
docker-compose up -d
```

### 2. Start Services (each in separate terminal)
```bash
cd api-gateway && ./mvnw spring-boot:run
cd ticket-service && ./mvnw spring-boot:run
cd analytics-service && ./mvnw spring-boot:run
cd integration-service && ./mvnw spring-boot:run
cd ai-service && pip install -r requirements.txt && python main.py
cd frontend && npm install && npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `POSTGRES_*` — Database connection
- `GEMINI_API_KEY` — Google Gemini AI (optional, falls back to keyword-based)
- `JWT_SECRET` — JWT signing secret (generate a secure random string)
- `ZENDESK_*` — Zendesk integration (optional)

## Ports

| Service | Port |
|---------|------|
| Frontend | 5173 |
| API Gateway | 8080 |
| Ticket Service | 8081 |
| Analytics Service | 8082 |
| Integration Service | 8083 |
| AI Service | 8001 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Kafka | 9092 |
| Elasticsearch | 9200 |
