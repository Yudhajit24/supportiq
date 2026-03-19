"""
SupportIQ AI Service
FastAPI service with Google Gemini integration for ticket intelligence.
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

gemini_available = False
llm = None

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.prompts import ChatPromptTemplate

    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key and api_key != "your_gemini_api_key_here":
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0.3
        )
        gemini_available = True
        logger.info("✅ Gemini 2.0 Flash initialized successfully")
    else:
        logger.warning("⚠️ GEMINI_API_KEY not set. Using keyword fallbacks.")
except Exception as e:
    logger.warning(f"⚠️ Could not initialize Gemini: {e}. Using fallbacks.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AI Service starting up...")
    logger.info(f"   Gemini available: {gemini_available}")
    yield
    logger.info("🛑 AI Service shutting down...")


app = FastAPI(
    title="SupportIQ AI Service",
    description="AI-powered ticket intelligence with Google Gemini 2.0 Flash",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========== Models ==========

class CategorizeRequest(BaseModel):
    subject: str
    description: str

class CategorizeResponse(BaseModel):
    category: str
    priority: str
    confidence: float
    reasoning: str

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment_score: float
    is_frustrated: bool
    reason: str
    label: str

class SuggestResponseRequest(BaseModel):
    ticket_subject: str
    ticket_description: str
    conversation_history: Optional[List[str]] = []

class SuggestResponseResponse(BaseModel):
    suggested_response: str
    confidence: float
    similar_tickets_found: int

class EscalationRequest(BaseModel):
    ticket_subject: str
    ticket_description: str
    priority: str
    sentiment_score: Optional[float] = 0.0
    time_open_hours: Optional[float] = 0.0

class EscalationResponse(BaseModel):
    should_escalate: bool
    confidence: float
    reasons: List[str]

class KBSearchRequest(BaseModel):
    query: str

class KBSearchResponse(BaseModel):
    answer: str
    sources: List[dict]
    confidence: float

class NLQueryRequest(BaseModel):
    query: str

class NLQueryResponse(BaseModel):
    sql: str
    explanation: str
    results: Optional[List[dict]] = []

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    type: str
    sql: Optional[str] = None


# ========== Helpers ==========

def parse_json_response(content: str) -> dict:
    import json
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:])
        if content.endswith("```"):
            content = content[:-3].strip()
    return json.loads(content)


# ========== Endpoints ==========

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "gemini_available": gemini_available,
        "model": "gemini-2.0-flash" if gemini_available else "fallback"
    }


@app.post("/ai/categorize", response_model=CategorizeResponse)
async def categorize_ticket(request: CategorizeRequest):
    if gemini_available and llm:
        try:
            from langchain_core.prompts import ChatPromptTemplate
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a support ticket classifier.
Categorize into exactly one of: Technical, Billing, Feature Request, Bug Report, General.
Predict priority: LOW, MEDIUM, HIGH, URGENT.
Return ONLY valid JSON: {{"category": "...", "priority": "...", "confidence": 0.0-1.0, "reasoning": "..."}}"""),
                ("user", "Subject: {subject}\nDescription: {description}")
            ])
            chain = prompt | llm
            result = chain.invoke({"subject": request.subject, "description": request.description})
            parsed = parse_json_response(result.content)
            return CategorizeResponse(
                category=parsed.get("category", "General"),
                priority=parsed.get("priority", "MEDIUM"),
                confidence=float(parsed.get("confidence", 0.85)),
                reasoning=parsed.get("reasoning", "AI categorization")
            )
        except Exception as e:
            logger.error(f"Categorization error: {e}")

    text = f"{request.subject} {request.description}".lower()
    category, priority, confidence = "General", "MEDIUM", 0.6
    if any(w in text for w in ["bug", "crash", "error", "broken", "not working", "exception"]):
        category, priority = "Bug Report", "HIGH"
    elif any(w in text for w in ["billing", "invoice", "payment", "charge", "refund", "overcharge"]):
        category, priority = "Billing", "MEDIUM"
    elif any(w in text for w in ["feature", "request", "add", "want", "wish", "suggest"]):
        category, priority = "Feature Request", "LOW"
    elif any(w in text for w in ["technical", "api", "integration", "setup", "config", "install"]):
        category, priority = "Technical", "MEDIUM"
    if any(w in text for w in ["urgent", "critical", "immediately", "asap", "down", "outage"]):
        priority, confidence = "URGENT", 0.75
    return CategorizeResponse(category=category, priority=priority, confidence=confidence,
                               reasoning="Keyword-based categorization (AI fallback)")


@app.post("/ai/analyze-sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    if gemini_available and llm:
        try:
            from langchain_core.prompts import ChatPromptTemplate
            prompt = ChatPromptTemplate.from_messages([
                ("system", """Analyze sentiment of this support message.
Return ONLY valid JSON: {{"sentiment_score": -1.0 to 1.0, "is_frustrated": true/false, "reason": "brief explanation", "label": "positive/neutral/negative"}}"""),
                ("user", "{text}")
            ])
            chain = prompt | llm
            result = chain.invoke({"text": request.text})
            parsed = parse_json_response(result.content)
            return SentimentResponse(
                sentiment_score=float(parsed.get("sentiment_score", 0.0)),
                is_frustrated=bool(parsed.get("is_frustrated", False)),
                reason=parsed.get("reason", ""),
                label=parsed.get("label", "neutral")
            )
        except Exception as e:
            logger.error(f"Sentiment error: {e}")

    text = request.text.lower()
    negative_words = ["frustrated", "angry", "terrible", "worst", "hate", "unacceptable",
                      "disappointed", "furious", "ridiculous", "horrible", "awful", "useless"]
    positive_words = ["thank", "great", "excellent", "love", "awesome", "appreciate",
                      "wonderful", "fantastic", "perfect", "amazing"]
    neg_count = sum(1 for w in negative_words if w in text)
    pos_count = sum(1 for w in positive_words if w in text)
    score = (pos_count - neg_count) / max(pos_count + neg_count, 1)
    score = max(-1.0, min(1.0, score))
    frustrated = neg_count >= 2 or any(w in text for w in ["frustrated", "angry", "furious"])
    label = "positive" if score > 0.3 else "negative" if score < -0.3 else "neutral"
    return SentimentResponse(sentiment_score=round(score, 2), is_frustrated=frustrated,
                              reason="Keyword-based analysis", label=label)


@app.post("/ai/suggest-response", response_model=SuggestResponseResponse)
async def suggest_response(request: SuggestResponseRequest):
    if gemini_available and llm:
        try:
            from langchain_core.prompts import ChatPromptTemplate
            history_text = "\n".join(request.conversation_history) if request.conversation_history else "No prior conversation"
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a professional, empathetic customer support agent.
Write a concise, helpful response to this support ticket. Include specific next steps.
Be warm but professional. Do not include a subject line."""),
                ("user", "Subject: {subject}\nDescription: {description}\nPrevious conversation: {history}\n\nWrite the response:")
            ])
            chain = prompt | llm
            result = chain.invoke({
                "subject": request.ticket_subject,
                "description": request.ticket_description,
                "history": history_text
            })
            return SuggestResponseResponse(suggested_response=result.content, confidence=0.88, similar_tickets_found=0)
        except Exception as e:
            logger.error(f"Response suggestion error: {e}")

    subject = request.ticket_subject.lower()
    if any(w in subject for w in ["login", "password", "access", "sign in"]):
        response = """Thank you for reaching out about your login issue.

I understand how frustrating access problems can be. Please try these steps:

1. Clear your browser cache and cookies
2. Try an incognito/private browsing window  
3. Use the "Forgot Password" link to reset your credentials

If the issue persists after trying these steps, please share what error message you see and I'll escalate this to our technical team right away.

Best regards,
Support Team"""
    elif any(w in subject for w in ["billing", "invoice", "payment", "charge", "refund"]):
        response = """Thank you for contacting us about your billing concern.

I take billing issues seriously and want to resolve this quickly. Could you please provide:
1. Your account email address
2. The invoice number or charge date in question
3. The specific discrepancy you noticed

I'll review your account and follow up within 24 hours with a resolution.

Best regards,
Support Team"""
    else:
        response = f"""Thank you for reaching out about: {request.ticket_subject}

I've reviewed your message and I'm looking into this now. I'll follow up with more details shortly.

If you have any additional information that might help, please don't hesitate to share it. We appreciate your patience.

Best regards,
Support Team"""
    return SuggestResponseResponse(suggested_response=response, confidence=0.5, similar_tickets_found=0)


@app.post("/ai/predict-escalation", response_model=EscalationResponse)
async def predict_escalation(request: EscalationRequest):
    reasons = []
    should_escalate = False
    confidence = 0.4

    if request.priority in ["URGENT", "urgent"]:
        reasons.append("Ticket marked as urgent priority")
        should_escalate = True
        confidence = 0.85

    if request.sentiment_score and request.sentiment_score < -0.5:
        reasons.append("Customer showing high frustration")
        should_escalate = True
        confidence = max(confidence, 0.78)

    if request.time_open_hours and request.time_open_hours > 24:
        reasons.append(f"Open for {request.time_open_hours:.0f} hours without resolution")
        should_escalate = True
        confidence = max(confidence, 0.72)

    text = f"{request.ticket_subject} {request.ticket_description}".lower()
    if any(w in text for w in ["legal", "lawyer", "sue", "compliance", "data breach", "gdpr", "lawsuit"]):
        reasons.append("Legal/compliance keywords detected")
        should_escalate = True
        confidence = 0.95

    if not reasons:
        reasons.append("No escalation indicators detected")

    return EscalationResponse(should_escalate=should_escalate, confidence=round(confidence, 2), reasons=reasons)


@app.post("/ai/search-knowledge-base", response_model=KBSearchResponse)
async def search_knowledge_base(request: KBSearchRequest):
    if gemini_available and llm:
        try:
            from langchain_core.prompts import ChatPromptTemplate
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a helpful customer support knowledge base assistant.
Answer the question clearly and concisely based on general customer support best practices.
If you don't know, say so. Keep answers under 150 words."""),
                ("user", "{question}")
            ])
            chain = prompt | llm
            result = chain.invoke({"question": request.query})
            return KBSearchResponse(answer=result.content,
                                    sources=[{"title": "AI-generated answer", "relevance": 0.9}],
                                    confidence=0.82)
        except Exception as e:
            logger.error(f"KB search error: {e}")

    query = request.query.lower()
    kb = {
        "password": "To reset your password: go to the login page, click 'Forgot Password', enter your email, and follow the reset link. Links expire after 24 hours.",
        "billing": "For billing issues: check your invoice in Settings > Billing. Refunds are processed within 5-7 business days. Contact support with your invoice number for discrepancies.",
        "api": "API rate limits: Free plan 100 req/hr, Pro 1000 req/hr, Enterprise 10000 req/hr. Use pagination and caching to optimize usage.",
        "sla": "SLA targets: URGENT 1hr response/4hr resolution, HIGH 4hr/24hr, MEDIUM 8hr/48hr, LOW 24hr/72hr.",
        "refund": "Refunds are processed within 5-7 business days back to the original payment method. Contact billing@support.com with your invoice number.",
    }
    for key, answer in kb.items():
        if key in query:
            return KBSearchResponse(answer=answer, sources=[{"title": f"KB: {key.title()}", "relevance": 0.75}], confidence=0.65)

    return KBSearchResponse(
        answer="I couldn't find a specific answer in the knowledge base. Please try rephrasing your question or contact support directly.",
        sources=[], confidence=0.2)


@app.post("/ai/query", response_model=NLQueryResponse)
async def natural_language_query(request: NLQueryRequest):
    if gemini_available and llm:
        try:
            from langchain_core.prompts import ChatPromptTemplate
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a PostgreSQL expert. Convert natural language to SQL.
Tables: tickets (id, organization_id, subject, description, status, priority, category, assigned_to, created_at, resolved_at),
ticket_metrics (ticket_id, first_response_time, resolution_time, customer_satisfaction, sla_breached),
users (id, full_name, email, role), customers (id, full_name, email, company).
Return ONLY valid JSON: {{"sql": "SELECT ...", "explanation": "This query..."}}"""),
                ("user", "{query}")
            ])
            chain = prompt | llm
            result = chain.invoke({"query": request.query})
            parsed = parse_json_response(result.content)
            return NLQueryResponse(sql=parsed.get("sql", ""), explanation=parsed.get("explanation", ""), results=[])
        except Exception as e:
            logger.error(f"NL query error: {e}")

    query = request.query.lower()
    if "urgent" in query:
        return NLQueryResponse(
            sql="SELECT id, subject, status, priority, created_at FROM tickets WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed') ORDER BY created_at DESC LIMIT 20",
            explanation="Fetches all open urgent tickets ordered by creation date", results=[])
    elif "resolved" in query or "last week" in query:
        return NLQueryResponse(
            sql="SELECT id, subject, status, resolved_at FROM tickets WHERE status = 'resolved' AND resolved_at >= NOW() - INTERVAL '7 days' ORDER BY resolved_at DESC",
            explanation="Shows tickets resolved in the last 7 days", results=[])
    return NLQueryResponse(
        sql="SELECT id, subject, status, priority, created_at FROM tickets ORDER BY created_at DESC LIMIT 20",
        explanation="Showing most recent tickets (set GEMINI_API_KEY for natural language queries)", results=[])


@app.post("/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    q = request.message.lower()
    kb_keywords = ["how", "what is", "explain", "procedure", "process", "policy",
                   "password", "reset", "billing", "refund", "cancel", "sla",
                   "setup", "configure", "help", "trending", "performance", "agent",
                   "best practice", "guide", "documentation"]
    if any(k in q for k in kb_keywords):
        kb_req = KBSearchRequest(query=request.message)
        result = await search_knowledge_base(kb_req)
        return ChatResponse(reply=result.answer, type="kb")
    else:
        nl_req = NLQueryRequest(query=request.message)
        result = await natural_language_query(nl_req)
        return ChatResponse(reply=result.explanation, type="sql", sql=result.sql)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)