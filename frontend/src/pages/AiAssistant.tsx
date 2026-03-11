import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, RefreshCw, Database, Brain } from 'lucide-react';
import axios from 'axios';

const AI_URL = (import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'sql' | 'kb' | 'insight';
  sql?: string;
  timestamp: Date;
}

const quickActions = [
  { label: 'Show urgent tickets', icon: '🔥', query: 'Show me all urgent tickets' },
  { label: 'Agent performance', icon: '👥', query: 'How are my agents performing this month?' },
  { label: 'Trending issues', icon: '📈', query: 'What are the trending support issues?' },
  { label: 'SLA compliance', icon: '🎯', query: 'What is our SLA compliance rate?' },
  { label: 'Password reset', icon: '🔑', query: 'How do I help a customer reset their password?' },
  { label: 'Billing process', icon: '💳', query: 'What is the refund process for overcharges?' },
];

async function callAI(query: string): Promise<Message> {
  const id = String(Date.now() + 1);
  const t = new Date();

  try {
    const res = await axios.post(`${AI_URL}/ai/chat`, { message: query });
    const data = res.data;
    return {
      id, role: 'assistant', timestamp: t,
      type: data.type as 'sql' | 'kb',
      sql: data.sql,
      content: data.reply || 'No response from AI.',
    };
  } catch (err: any) {
    const isDown = err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED';
    return {
      id, role: 'assistant', timestamp: t,
      content: isDown
        ? '⚠️ AI service is offline. Make sure the Python AI service is running on port 8001.\n\nRun: `cd ai-service && python main.py`'
        : `⚠️ Error: ${err.response?.data?.detail || err.message}`,
    };
  }
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1', role: 'assistant', timestamp: new Date(),
    content: "Hello! I can help with:\n\n• **Data queries** — Ask about your tickets, agents, SLA\n• **Knowledge base** — Search procedures and policies\n• **Insights** — Powered by Google Gemini ✨\n\nWhat would you like to know?",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    const userMsg: Message = { id: String(Date.now()), role: 'user', content: q, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setLoading(true);
    const reply = await callAI(q);
    setMessages(p => [...p, reply]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-nb-charcoal rounded-xl border-2 border-black flex items-center justify-center shadow-nb-sm">
            <Bot className="w-6 h-6 text-nb-yellow" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-extrabold tracking-tighter">AI Assistant</h2>
            <p className="text-xs font-body text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 border border-black animate-pulse" /> Powered by Google Gemini
            </p>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="nb-btn nb-btn-sm nb-btn-white">
          <RefreshCw className="w-3.5 h-3.5" /> New Chat
        </button>
      </div>

      {messages.length <= 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {quickActions.map(a => (
            <button key={a.label} onClick={() => send(a.query)}
              className="nb-card p-4 text-left group">
              <span className="text-xl mb-1 block">{a.icon}</span>
              <span className="text-sm font-heading font-bold group-hover:underline decoration-2 underline-offset-2">{a.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto nb-card-lg p-4 space-y-4">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-nb-charcoal text-nb-yellow' : 'bg-nb-sage'}`}>
                {msg.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-xl px-4 py-3 text-sm font-body leading-relaxed whitespace-pre-wrap border-2 border-black ${msg.role === 'user' ? 'bg-nb-charcoal text-white rounded-tr-none shadow-nb-sm' : 'bg-white rounded-tl-none shadow-nb-sm'}`}>
                  {msg.content}
                </div>
                {msg.sql && (
                  <div className="mt-2 p-2 rounded-lg bg-nb-sage/20 border-2 border-black">
                    <div className="flex items-center gap-1 text-xs font-heading font-bold mb-1"><Database className="w-3 h-3" /> Generated SQL</div>
                    <code className="text-xs break-all font-mono">{msg.sql}</code>
                  </div>
                )}
                {msg.type === 'kb' && <div className="mt-1 flex items-center gap-1 text-xs font-heading font-bold"><Brain className="w-3 h-3" /> Knowledge Base</div>}
                <p className="text-[10px] font-body text-muted-foreground mt-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl border-2 border-black bg-nb-charcoal flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-nb-yellow" />
            </div>
            <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 border-2 border-black shadow-nb-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-body">Thinking with Gemini...</span>
            </div>
          </motion.div>
        )}
        <div ref={ref} />
      </div>

      <div className="mt-4 flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask anything about your support data..." className="nb-input flex-1" />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="nb-btn nb-btn-yellow disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
