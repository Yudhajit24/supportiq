import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, RefreshCw, Database, Brain } from 'lucide-react';
import { aiService } from '../lib/api';

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
    { label: 'Password reset help', icon: '🔑', query: 'How do I help a customer reset their password?' },
    { label: 'Billing process', icon: '💳', query: 'What is the refund process for overcharges?' },
];

async function callAI(query: string): Promise<Message> {
    const id = String(Date.now() + 1);
    const t = new Date();
    try {
        const res = await aiService.chat(query);
        const data = res.data;
        return {
            id, role: 'assistant', timestamp: t,
            type: data.type as 'sql' | 'kb',
            sql: data.sql,
            content: data.reply || 'No response from AI.',
        };
    } catch (err: any) {
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message;
        const isDown = err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.response?.status >= 500;
        return {
            id, role: 'assistant', timestamp: t,
            content: isDown
                ? '⚠️ AI service is offline. Make sure the Python AI service is running on port 8001.\n\nRun: `cd ai-service && python main.py`'
                : `⚠️ Error: ${msg}`,
        };
    }
}

export default function AiAssistant() {
    const [messages, setMessages] = useState<Message[]>([{
        id: '1', role: 'assistant', timestamp: new Date(),
        content: "Hello! I can help with:\n\n• **Data queries** — Ask about your tickets, agents, or SLA\n• **Knowledge base** — Search procedures and policies\n• **Insights** — Powered by Google Gemini 2.0 ✨\n\nWhat would you like to know?",
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async (text?: string) => {
        const q = (text || input).trim();
        if (!q || loading) return;
        setInput('');
        const userMsg: Message = { id: String(Date.now()), role: 'user', content: q, timestamp: new Date() };
        setMessages(p => [...p, userMsg]);
        setLoading(true);
        const reply = await callAI(q);
        setMessages(p => [...p, reply]);
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col pb-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full nm-inset flex items-center justify-center animate-float">
                        <Bot className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">AI Assistant</h2>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-1">
                            <span className={`w-2.5 h-2.5 rounded-full ${gemini_available_indicator}`} />
                            Powered by Google Gemini 2.0 Flash
                        </p>
                    </div>
                </div>
                <button onClick={() => setMessages([messages[0]])} className="nm-button flex items-center gap-2 px-5 py-2.5 font-bold text-sm">
                    <RefreshCw className="w-4 h-4" /> New Chat
                </button>
            </div>

            {messages.length <= 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {quickActions.map(a => (
                        <button key={a.label} onClick={() => send(a.query)} className="nm-flat p-5 text-left group hover:bg-background/60 transition-colors flex flex-col gap-3">
                            <span className="text-2xl">{a.icon}</span>
                            <span className="text-sm font-bold group-hover:text-primary transition-colors">{a.label}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-1 overflow-y-auto nm-flat p-6 rounded-[32px] space-y-6 scrollbar-hide flex flex-col relative">
                <AnimatePresence>
                    {messages.map(msg => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'nm-inset text-primary' : 'nm-flat text-accent-sage'}`}>
                                {msg.role === 'assistant' ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                            <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`inline-block px-6 py-4 text-[15px] font-medium leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'nm-flat rounded-3xl rounded-tr-sm text-foreground' : 'nm-inset rounded-3xl rounded-tl-sm text-foreground bg-background/50'}`}>
                                    {msg.content}
                                </div>
                                {msg.sql && (
                                    <div className="mt-3 p-4 rounded-2xl nm-inset text-left">
                                        <div className="flex items-center gap-2 text-xs font-bold text-accent-indigo mb-2 uppercase tracking-widest">
                                            <Database className="w-3.5 h-3.5" /> Generated SQL
                                        </div>
                                        <code className="text-[13px] break-all font-mono opacity-80">{msg.sql}</code>
                                    </div>
                                )}
                                {msg.type === 'kb' && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-accent-sage uppercase tracking-widest justify-start">
                                        <Brain className="w-3.5 h-3.5" /> Knowledge Base Match
                                    </div>
                                )}
                                <p className="text-[11px] font-bold text-muted-foreground mt-2 opacity-60">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 w-full">
                        <div className="w-10 h-10 rounded-full nm-inset flex items-center justify-center flex-shrink-0 text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="nm-inset rounded-3xl rounded-tl-sm px-6 py-4 flex items-center gap-3 bg-background/50">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-[15px] font-medium text-muted-foreground animate-pulse">Thinking with Gemini 2.0...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={ref} className="h-4" />
            </div>

            <div className="mt-6 flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about your support data..."
                    className="flex-1 nm-inset px-6 py-5 rounded-2xl bg-transparent outline-none text-foreground font-semibold placeholder:text-muted-foreground/50 transition-all focus:ring-0"
                    disabled={loading}
                />
                <button
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    className="nm-button px-8 rounded-2xl flex items-center justify-center text-primary disabled:opacity-40"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

const gemini_available_indicator = 'bg-accent-emerald animate-pulse shadow-[0_0_8px_var(--accent-emerald)]';