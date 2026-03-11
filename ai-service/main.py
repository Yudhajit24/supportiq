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

# Try to import Gemini - graceful fallback if not available
gemini_available = False
llm = None

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.prompts import ChatPromptTemplate
    
    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key and api_key != "your_gemini_api_key_here":
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.3
        )
        gemini_available = True
        logger.info("✅ Gemini AI initialized successfully")
    else:
        logger.warning("⚠️ GEMINI_API_KEY not configured. AI features will use fallback responses.")
except Exception as e:
    logger.warning(f"⚠️ Could not initialize Gemini: {e}. Using fallback responses.")

# ChromaDB for RAG
chroma_available = False
vectorstore = None

try:
    import chromadb
    chroma_client = chromadb.Client()
    chroma_available = True
    logger.info("✅ ChromaDB initialized")
except Exception as e:
    logger.warning(f"⚠️ ChromaDB not available: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AI Service starting up...")
    logger.info(f"   Gemini available: {gemini_available}")
    logger.info(f"   ChromaDB available: {chroma_available}")
    yield
    logger.info("🛑 AI Service shutting down...")


app = FastAPI(
    title="SupportIQ AI Service",
    description="AI-powered ticket intelligence with Google Gemini",
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


# ========== Request/Response Models ==========

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


# ========== AI Endpoints ==========

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "gemini_available": gemini_available,
        "chroma_available": chroma_available
    }


@app.post("/ai/categorize", response_model=CategorizeResponse)
async def categorize_ticket(request: CategorizeRequest):
    """Categorize a ticket using AI."""
    if gemini_available and llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a support ticket classifier.
Categorize tickets into exactly one of: Technical, Billing, Feature Request, Bug Report, General.
Also predict priority: LOW, MEDIUM, HIGH, URGENT.

Return ONLY a JSON object with these exact keys:
{{"category": "...", "priority": "...", "confidence": 0.0-1.0, "reasoning": "..."}}"""),
                ("user", "Subject: {subject}\nDescription: {description}")
            ])
            chain = prompt | llm
            result = chain.invoke({"subject": request.subject, "description": request.description})
            
            import json
            content = result.content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            parsed = json.loads(content)
            
            return CategorizeResponse(
                category=parsed.get("category", "General"),
                priority=parsed.get("priority", "MEDIUM"),
                confidence=float(parsed.get("confidence", 0.8)),
                reasoning=parsed.get("reasoning", "AI categorization")
            )
        except Exception as e:
            logger.error(f"Categorization error: {e}")

    # Fallback categorization using keywords
    text = f"{request.subject} {request.description}".lower()
    category = "General"
    priority = "MEDIUM"
    confidence = 0.6

    if any(w in text for w in ["bug", "crash", "error", "broken", "not working"]):
        category = "Bug Report"
        priority = "HIGH"
    elif any(w in text for w in ["billing", "invoice", "payment", "charge", "refund"]):
        category = "Billing"
        priority = "MEDIUM"
    elif any(w in text for w in ["feature", "request", "add", "want", "need", "wish"]):
        category = "Feature Request"
        priority = "LOW"
    elif any(w in text for w in ["technical", "api", "integration", "setup", "config"]):
        category = "Technical"
        priority = "MEDIUM"

    if any(w in text for w in ["urgent", "critical", "immediately", "asap", "down"]):
        priority = "URGENT"
        confidence = 0.7

    return CategorizeResponse(
        category=category, priority=priority, confidence=confidence,
        reasoning="Keyword-based categorization (AI fallback)"
    )


@app.post("/ai/analyze-sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """Analyze sentiment of text."""
    if gemini_available and llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", """Analyze the sentiment of this support ticket text.
Return ONLY a JSON object:
{{"sentiment_score": -1.0 to 1.0, "is_frustrated": true/false, "reason": "brief explanation", "label": "positive/neutral/negative"}}"""),
                ("user", "{text}")
            ])
            chain = prompt | llm
            result = chain.invoke({"text": request.text})
            
            import json
            content = result.content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            parsed = json.loads(content)
            
            return SentimentResponse(
                sentiment_score=float(parsed.get("sentiment_score", 0.0)),
                is_frustrated=bool(parsed.get("is_frustrated", False)),
                reason=parsed.get("reason", ""),
                label=parsed.get("label", "neutral")
            )
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")

    # Fallback sentiment analysis
    text = request.text.lower()
    score = 0.0
    frustrated = False
    reasons = []

    negative_words = ["frustrated", "angry", "terrible", "worst", "hate", "unacceptable",
                      "disappointed", "furious", "ridiculous", "horrible", "awful"]
    positive_words = ["thank", "great", "excellent", "love", "awesome", "appreciate",
                      "wonderful", "fantastic", "please", "help"]

    neg_count = sum(1 for w in negative_words if w in text)
    pos_count = sum(1 for w in positive_words if w in text)

    score = (pos_count - neg_count) / max(pos_count + neg_count, 1)
    score = max(-1.0, min(1.0, score))

    if neg_count >= 2 or any(w in text for w in ["frustrated", "angry", "furious"]):
        frustrated = True
        reasons.append("Multiple negative indicators detected")

    label = "neutral"
    if score > 0.3:
        label = "positive"
    elif score < -0.3:
        label = "negative"

    return SentimentResponse(
        sentiment_score=round(score, 2),
        is_frustrated=frustrated,
        reason="; ".join(reasons) if reasons else "Keyword-based analysis",
        label=label
    )


@app.post("/ai/suggest-response", response_model=SuggestResponseResponse)
async def suggest_response(request: SuggestResponseRequest):
    """Suggest a response for a ticket."""
    if gemini_available and llm:
        try:
            history_text = "\n".join(request.conversation_history) if request.conversation_history else "No prior conversation"
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a professional, empathetic customer support agent.
Write a helpful response to this support ticket. Be concise, professional, and solution-focused.
Include specific next steps when possible."""),
                ("user", """Subject: {subject}
Description: {description}
Previous conversation: {history}

Write a professional support response:""")
            ])
            chain = prompt | llm
            result = chain.invoke({
                "subject": request.ticket_subject,
                "description": request.ticket_description,
                "history": history_text
            })
            
            return SuggestResponseResponse(
                suggested_response=result.content,
                confidence=0.85,
                similar_tickets_found=0
            )
        except Exception as e:
            logger.error(f"Response suggestion error: {e}")

    # Fallback response template
    subject = request.ticket_subject.lower()
    
    if any(w in subject for w in ["login", "password", "access"]):
        response = f"""Thank you for reaching out about your login issue.

I understand how frustrating access problems can be. Here are some steps to try:

1. Clear your browser cache and cookies
2. Try using an incognito/private browsing window
3. If the issue persists, try resetting your password via the forgot password link

If none of these steps resolve the issue, please let me know and I'll escalate this to our technical team right away.

Best regards,
Support Team"""
    elif any(w in subject for w in ["billing", "invoice", "payment", "charge"]):
        response = f"""Thank you for contacting us about your billing concern.

I take billing inquiries very seriously. I've made a note of your concern and will review your account details.

To help resolve this quickly, could you please provide:
1. Your account email address
2. The invoice number in question
3. The specific charge you'd like reviewed

I'll have this investigated and follow up within 24 hours.

Best regards,
Support Team"""
    else:
        response = f"""Thank you for contacting us regarding: {request.ticket_subject}

I've reviewed your message and want to help resolve this as quickly as possible.

I'm looking into this now and will follow up with more details shortly. In the meantime, if you have any additional information that might help, please don't hesitate to share.

We appreciate your patience.

Best regards,
Support Team"""

    return SuggestResponseResponse(
        suggested_response=response,
        confidence=0.5,
        similar_tickets_found=0
    )


@app.post("/ai/predict-escalation", response_model=EscalationResponse)
async def predict_escalation(request: EscalationRequest):
    """Predict if a ticket needs escalation."""
    reasons = []
    should_escalate = False
    confidence = 0.5

    if request.priority in ["URGENT", "urgent"]:
        reasons.append("Ticket has urgent priority")
        should_escalate = True
        confidence = 0.8

    if request.sentiment_score and request.sentiment_score < -0.5:
        reasons.append("Customer shows high frustration")
        should_escalate = True
        confidence = max(confidence, 0.75)

    if request.time_open_hours and request.time_open_hours > 24:
        reasons.append(f"Ticket has been open for {request.time_open_hours:.0f} hours")
        should_escalate = True
        confidence = max(confidence, 0.7)

    text = f"{request.ticket_subject} {request.ticket_description}".lower()
    if any(w in text for w in ["legal", "lawyer", "sue", "compliance", "data breach"]):
        reasons.append("Contains legal/compliance keywords")
        should_escalate = True
        confidence = 0.9

    if not reasons:
        reasons.append("No escalation indicators detected")

    return EscalationResponse(
        should_escalate=should_escalate,
        confidence=round(confidence, 2),
        reasons=reasons
    )


@app.post("/ai/search-knowledge-base", response_model=KBSearchResponse)
async def search_knowledge_base(request: KBSearchRequest):
    """Search the knowledge base using RAG."""
    if gemini_available and llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a helpful knowledge base assistant.
Answer the question based on your training knowledge about customer support.
If you're not sure, say so.
Provide a clear, concise answer."""),
                ("user", "{question}")
            ])
            chain = prompt | llm
            result = chain.invoke({"question": request.query})
            
            return KBSearchResponse(
                answer=result.content,
                sources=[{"title": "AI-generated answer", "relevance": 0.9}],
                confidence=0.8
            )
        except Exception as e:
            logger.error(f"KB search error: {e}")

    # Fallback
    query = request.query.lower()
    
    kb_responses = {
        "password": "To reset your password: Go to the login page, click 'Forgot Password', enter your email, and follow the reset link sent to your inbox. Reset links expire after 24 hours.",
        "billing": "Billing inquiries: Check your invoice in Settings > Billing. For discrepancies, contact support with your invoice number. Refunds are processed within 5-7 business days.",
        "api": "API rate limits: Free plan: 100 req/hr, Pro: 1000 req/hr, Enterprise: 10000 req/hr. Use pagination and caching to optimize API usage.",
        "sla": "SLA targets: URGENT: 1hr response / 4hr resolution. HIGH: 4hr response / 24hr resolution. MEDIUM: 8hr response / 48hr resolution. LOW: 24hr response / 72hr resolution.",
    }

    for key, response in kb_responses.items():
        if key in query:
            return KBSearchResponse(
                answer=response,
                sources=[{"title": f"KB: {key.title()} Guide", "relevance": 0.7}],
                confidence=0.6
            )

    return KBSearchResponse(
        answer="I couldn't find a specific answer in the knowledge base. Please try rephrasing your question or contact support for assistance.",
        sources=[],
        confidence=0.2
    )


@app.post("/ai/query", response_model=NLQueryResponse)
async def natural_language_query(request: NLQueryRequest):
    """Convert natural language to SQL query."""
    if gemini_available and llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a SQL expert. Convert the natural language query to a PostgreSQL SQL query.
Available tables: tickets (id, organization_id, subject, description, status, priority, category, assigned_to, created_at, resolved_at),
ticket_metrics (ticket_id, first_response_time, resolution_time, customer_satisfaction, sla_breached),
users (id, full_name, email, role), customers (id, full_name, email, company).

Return ONLY a JSON object:
{{"sql": "SELECT ...", "explanation": "This query..."}}"""),
                ("user", "{query}")
            ])
            chain = prompt | llm
            result = chain.invoke({"query": request.query})
            
            import json
            content = result.content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            parsed = json.loads(content)
            
            return NLQueryResponse(
                sql=parsed.get("sql", ""),
                explanation=parsed.get("explanation", ""),
                results=[]
            )
        except Exception as e:
            logger.error(f"NL query error: {e}")

    # Fallback NL to SQL
    query = request.query.lower()
    
    if "urgent" in query and "ticket" in query:
        return NLQueryResponse(
            sql="SELECT id, subject, status, priority, created_at FROM tickets WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed') ORDER BY created_at DESC LIMIT 20",
            explanation="Fetches all open urgent tickets, ordered by creation date",
            results=[]
        )
    elif "resolved" in query or "last week" in query:
        return NLQueryResponse(
            sql="SELECT id, subject, status, resolved_at FROM tickets WHERE status = 'resolved' AND resolved_at >= NOW() - INTERVAL '7 days' ORDER BY resolved_at DESC",
            explanation="Shows tickets resolved in the last 7 days",
            results=[]
        )
    else:
        return NLQueryResponse(
            sql=f"SELECT id, subject, status, priority, created_at FROM tickets ORDER BY created_at DESC LIMIT 20",
            explanation="Showing most recent tickets (configure GEMINI_API_KEY for natural language queries)",
            results=[]
        )


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    type: str
    sql: Optional[str] = None

@app.post("/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Unified chat endpoint — routes to KB or NL SQL based on intent."""
    q = request.message.lower()
    kb_keywords = ["how", "what is", "explain", "procedure", "process", "policy",
                   "password", "reset", "billing", "refund", "cancel", "sla",
                   "setup", "configure", "help me", "trending", "performance", "agent"]
    
    if any(k in q for k in kb_keywords):
        # Route to KB / Gemini general answer
        kb_req = KBSearchRequest(query=request.message)
        result = await search_knowledge_base(kb_req)
        return ChatResponse(reply=result.answer, type="kb")
    else:
        # Route to NL-to-SQL
        nl_req = NLQueryRequest(query=request.message)
        result = await natural_language_query(nl_req)
        return ChatResponse(reply=result.explanation, type="sql", sql=result.sql)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
