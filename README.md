# SupportIQ - AI-Powered Customer Support Intelligence

> Smart ticket routing, real-time analytics, and AI-powered insights to transform your customer support experience.

## 🎯 Features

- **Ticket Management** — Full CRUD with status workflow, assignment, SLA tracking
- **AI Categorization** — Auto-classify tickets by category and priority using Google Gemini
- **Sentiment Analysis** — Detect frustrated customers and predict escalations
- **Response Suggestions** — AI-generated professional responses with RAG
- **Analytics Dashboard** — Real-time metrics, agent leaderboard, trend charts
- **Natural Language Queries** — Ask questions in plain English, get SQL results
- **Knowledge Base Search** — RAG-powered knowledge base search
- **Multi-platform Integrations** — Zendesk, email, webhooks
- **Dark Mode** — Full dark/light theme support

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│ API Gateway  │────▶│   Ticket     │
│  React + TS  │     │  Port 8080   │     │   Service    │
│  Port 5173   │     │  JWT Auth    │     │   Port 8081  │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐     ┌──────────────┐
                     │  Analytics   │     │ Integration  │
                     │   Service    │     │   Service    │
                     │   Port 8082  │     │   Port 8083  │
                     └──────────────┘     └──────────────┘
                     
┌──────────────┐     ┌──────────────┐
│  AI Service  │     │    Docker    │
│  Python/     │     │  PostgreSQL  │
│  FastAPI     │     │  Redis       │
│  Port 8001   │     │  Kafka       │
└──────────────┘     │  Elastic     │
                     └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Java 17+
- Node.js 18+
- Python 3.11+

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Start Backend Services
```bash
# API Gateway
cd api-gateway && ./mvnw spring-boot:run

# Ticket Service
cd ticket-service && ./mvnw spring-boot:run

# Analytics Service
cd analytics-service && ./mvnw spring-boot:run

# Integration Service
cd integration-service && ./mvnw spring-boot:run
```

### 3. Start AI Service
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Open in Browser
Navigate to `http://localhost:5173`

**Demo credentials:** `admin@techcorp.com` / `password123`

## 📁 Project Structure

```
supportiq/
├── docker-compose.yml          # Infrastructure
├── database/
│   ├── schema.sql              # Full DB schema (15 tables) 
│   └── seed_data.sql           # Sample data
├── api-gateway/                # Spring Boot (port 8080)
├── ticket-service/             # Spring Boot (port 8081)
├── analytics-service/          # Spring Boot (port 8082)
├── integration-service/        # Spring Boot (port 8083)
├── ai-service/                 # Python FastAPI (port 8001)
└── frontend/                   # React + TypeScript (port 5173)
```

## 🤖 AI Features (Google Gemini)

Set `GEMINI_API_KEY` in your environment for full AI features. Without it, the service uses intelligent keyword-based fallbacks.

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Categorize | `POST /ai/categorize` | Auto-classify tickets |
| Sentiment | `POST /ai/analyze-sentiment` | Detect frustration |
| Suggest Response | `POST /ai/suggest-response` | Generate replies |
| Escalation | `POST /ai/predict-escalation` | Predict escalation need |
| KB Search | `POST /ai/search-knowledge-base` | RAG-based search |
| NL Query | `POST /ai/query` | Natural language to SQL |

## 📊 Sample Data

Pre-loaded with: 3 organizations, 10 users, 50 customers, 200 tickets, 500+ comments, 20 KB articles, and 30 days of metrics.
