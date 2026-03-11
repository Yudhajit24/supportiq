# SupportIQ Architecture

## System Overview

SupportIQ is a microservices-based platform with 4 Java Spring Boot services, 1 Python AI service, and a React frontend.

## Service Communication

- **Frontend → API Gateway**: REST over HTTP (JWT auth)
- **API Gateway → Microservices**: REST with user context headers (X-User-Id, X-Organization-Id, X-User-Role)
- **Ticket Service → Kafka**: Async event publishing (ticket.created, ticket.updated, etc.)
- **AI Service**: Standalone FastAPI service, called via proxy through API Gateway

## Data Flow

1. User authenticates via API Gateway → JWT token issued
2. Frontend sends requests with JWT to API Gateway
3. API Gateway validates JWT, extracts user context, proxies to target service
4. Services process requests against PostgreSQL
5. Ticket Service publishes Kafka events on state changes
6. AI Service provides categorization, sentiment, and response suggestions

## Database Schema (15 tables)

Core: organizations, users, customers, teams
Tickets: tickets, ticket_comments, ticket_history, ticket_metrics
Support: knowledge_base_articles, custom_fields
Analytics: agent_daily_metrics, organization_daily_metrics
Integrations: integrations, integration_sync_logs
SLA: sla_policies

## Security

- JWT-based stateless authentication
- Password hashing with BCrypt
- Role-based access (admin, manager, agent)
- Multi-tenant via organization_id scoping
- CORS configured for frontend origins
