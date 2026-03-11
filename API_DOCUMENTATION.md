# SupportIQ API Documentation

## Authentication

### POST `/api/v1/auth/login`
```json
// Request
{ "email": "admin@techcorp.com", "password": "password123" }

// Response
{
  "token": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "type": "Bearer",
  "userId": "bbbb0001-...",
  "email": "admin@techcorp.com",
  "fullName": "Sarah Chen",
  "role": "admin",
  "organizationId": "11111111-..."
}
```

### POST `/api/v1/auth/register`
```json
{ "fullName": "New User", "email": "new@example.com", "password": "pass123" }
```

### POST `/api/v1/auth/refresh`
```json
{ "refreshToken": "eyJhbG..." }
```

### GET `/api/v1/auth/me`
Headers: `Authorization: Bearer <token>`

---

## Tickets (Port 8081)

### POST `/api/v1/tickets` — Create ticket
```json
{
  "subject": "Cannot login",
  "description": "Login page shows error...",
  "priority": "high",
  "category": "Technical",
  "source": "web"
}
```

### GET `/api/v1/tickets` — List tickets
Query params: `status`, `priority`, `category`, `page`, `size`, `sortBy`

### GET `/api/v1/tickets/{id}` — Get ticket by ID

### PATCH `/api/v1/tickets/{id}` — Update ticket
```json
{ "status": "in_progress", "priority": "urgent" }
```

### DELETE `/api/v1/tickets/{id}` — Delete ticket

### PATCH `/api/v1/tickets/{id}/assign`
```json
{ "agentId": "bbbb0002-..." }
```

### PATCH `/api/v1/tickets/{id}/status`
```json
{ "status": "resolved" }
```

### POST `/api/v1/tickets/{id}/comments`
```json
{ "content": "Working on it!", "isInternal": false }
```

### GET `/api/v1/tickets/{id}/comments` — Get comments
### GET `/api/v1/tickets/search?q=login` — Search tickets
### GET `/api/v1/tickets/my-tickets` — Agent's assigned tickets

---

## Analytics (Port 8082)

### GET `/api/v1/analytics/dashboard-metrics`
Returns: totalTickets, openTickets, resolvedTickets, avgResolutionTime, avgCsat, slaBreachCount

### GET `/api/v1/analytics/agent-performance?from=&to=`
Returns: Agent leaderboard with resolution stats and CSAT

### GET `/api/v1/analytics/ticket-trends?period=30d`
Returns: Daily ticket counts (created, resolved, open)

### GET `/api/v1/analytics/category-distribution`
Returns: Ticket counts grouped by category

### GET `/api/v1/analytics/sla-compliance`
Returns: SLA compliance rates by priority

---

## AI Service (Port 8001)

### POST `/ai/categorize`
```json
{ "subject": "Cannot login", "description": "Login page error..." }
// Response: { "category": "Technical", "priority": "HIGH", "confidence": 0.92 }
```

### POST `/ai/analyze-sentiment`
```json
{ "text": "This is frustrating!" }
// Response: { "sentiment_score": -0.7, "is_frustrated": true, "label": "negative" }
```

### POST `/ai/suggest-response`
```json
{ "ticket_subject": "Login issue", "ticket_description": "Can't login..." }
// Response: { "suggested_response": "Thank you for...", "confidence": 0.85 }
```

### POST `/ai/predict-escalation`
```json
{ "ticket_subject": "...", "priority": "URGENT", "sentiment_score": -0.8 }
// Response: { "should_escalate": true, "reasons": ["..."] }
```

### POST `/ai/search-knowledge-base`
```json
{ "query": "How to reset password?" }
```

### POST `/ai/query`
```json
{ "query": "Show me urgent tickets from last week" }
// Response: { "sql": "SELECT ...", "explanation": "..." }
```

---

## Integration Service (Port 8083)

### POST `/api/v1/integrations/zendesk/sync` — Sync Zendesk tickets
### POST `/api/v1/webhooks/ticket-created` — Webhook endpoint
### GET `/api/v1/integrations/status` — Integration health check
### POST `/api/v1/integrations/email/process` — Process incoming email
