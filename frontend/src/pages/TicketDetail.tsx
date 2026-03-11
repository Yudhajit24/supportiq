import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Clock, User, Tag, AlertTriangle, MessageSquare, Sparkles, ThumbsUp, Copy, Check } from 'lucide-react';

const mockTicket = {
    id: 'ticket-1', subject: 'Cannot login to dashboard',
    description: 'I have been trying to login for 30 minutes. Every time I enter credentials, it shows a spinner and times out.',
    status: 'in_progress', priority: 'high', category: 'Technical',
    customer: { name: 'John Doe', email: 'john.doe@acme.com' },
    assignedTo: { name: 'Mike Johnson' },
    created: '2024-02-15T10:30:00Z', slaDeadline: '2024-02-16T10:30:00Z', sentiment: -0.6,
};

const initialComments = [
    { id: '1', author: 'John Doe', isCustomer: true, content: 'Login keeps timing out. Very frustrating!', time: '10:30 AM' },
    { id: '2', author: 'Mike Johnson', isCustomer: false, content: 'Hi John, let me look into this. Could you try clearing your browser cache?', time: '10:45 AM' },
    { id: '3', author: 'John Doe', isCustomer: true, content: 'Tried clearing cache and incognito mode — still broken.', time: '11:00 AM' },
    { id: '4', author: 'Mike Johnson', isCustomer: false, content: 'Found the issue — session conflict in auth service. Cleared your sessions. Try now.', time: '11:15 AM' },
];

const aiSuggestion = {
    response: "Thank you for your patience. This is typically caused by a cached auth token conflict.\n\n1. Clear all browser data for our domain\n2. Try logging in with incognito\n3. If it persists, I can reset your session\n\nI'll escalate to engineering to prevent future issues.",
    confidence: 0.87, category: 'Technical', sentiment: 'Frustrated',
};

const statusOpts = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
const statusBg: Record<string, string> = { open: 'bg-white', in_progress: 'bg-nb-yellow', pending: 'bg-nb-sage', resolved: 'bg-nb-charcoal text-white', closed: 'bg-gray-200' };

export default function TicketDetail() {
    const navigate = useNavigate();
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(initialComments);
    const [showAi, setShowAi] = useState(false);
    const [status, setStatus] = useState(mockTicket.status);
    const [usedResponse, setUsedResponse] = useState(false);
    const [statusSaved, setStatusSaved] = useState(false);

    const handleSendComment = () => {
        if (!newComment.trim()) return;
        const comment = {
            id: String(Date.now()),
            author: 'You (Agent)',
            isCustomer: false,
            content: newComment,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setComments([...comments, comment]);
        setNewComment('');
    };

    const handleUseResponse = () => {
        setNewComment(aiSuggestion.response);
        setUsedResponse(true);
        setTimeout(() => setUsedResponse(false), 2000);
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        setStatusSaved(true);
        setTimeout(() => setStatusSaved(false), 1500);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-heading font-bold mb-4 hover:underline decoration-2 underline-offset-2">
                <ArrowLeft className="w-4 h-4" /> Back to tickets
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="nb-card-lg p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-sm border-2 border-black ${statusBg[status]}`} />
                                <select value={status} onChange={e => handleStatusChange(e.target.value)}
                                    className="px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-black bg-white capitalize">
                                    {statusOpts.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                                {statusSaved && <span className="text-xs font-heading font-bold text-green-700 flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                                <span className="nb-badge bg-orange-200 border-orange-400">
                                    {mockTicket.priority.toUpperCase()}
                                </span>
                            </div>
                            <button onClick={() => setShowAi(!showAi)}
                                className={`nb-btn-sm nb-btn ${showAi ? '' : 'nb-btn-yellow'}`}>
                                <Sparkles className="w-3.5 h-3.5" /> AI Assist
                            </button>
                        </div>
                        <h1 className="font-heading text-2xl font-extrabold tracking-tighter mb-2">{mockTicket.subject}</h1>
                        <p className="text-sm font-body leading-relaxed text-muted-foreground">{mockTicket.description}</p>
                    </motion.div>

                    {/* Conversation */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nb-card-lg p-6">
                        <h3 className="font-heading font-extrabold flex items-center gap-2 mb-4">
                            <MessageSquare className="w-4 h-4" /> Conversation ({comments.length})
                        </h3>
                        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                            {comments.map(c => (
                                <motion.div key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${c.isCustomer ? '' : 'flex-row-reverse'}`}>
                                    <div className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.isCustomer ? 'bg-nb-sage' : 'bg-nb-charcoal text-nb-yellow'}`}>
                                        {c.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className={`max-w-[75%] ${c.isCustomer ? '' : 'text-right'}`}>
                                        <div className={`inline-block rounded-xl px-4 py-3 text-sm font-body border-2 border-black whitespace-pre-wrap ${c.isCustomer ? 'bg-white rounded-tl-none shadow-nb-sm' : 'bg-nb-yellow rounded-tr-none shadow-nb-sm'}`}>
                                            {c.content}
                                        </div>
                                        <p className="text-xs font-body text-muted-foreground mt-1">{c.author} · {c.time}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-4 border-t-2 border-black">
                            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                                placeholder="Type your reply..." className="nb-input flex-1" />
                            <button onClick={handleSendComment}
                                disabled={!newComment.trim()}
                                className="nb-btn nb-btn-yellow disabled:opacity-40 disabled:cursor-not-allowed">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="nb-card-lg p-5">
                        <h3 className="font-heading font-extrabold mb-4">Details</h3>
                        <div className="space-y-3">
                            {[
                                { icon: User, label: 'Customer', value: mockTicket.customer.name },
                                { icon: Tag, label: 'Category', value: mockTicket.category },
                                { icon: User, label: 'Assigned', value: mockTicket.assignedTo.name },
                                { icon: Clock, label: 'Created', value: new Date(mockTicket.created).toLocaleDateString() },
                                { icon: AlertTriangle, label: 'SLA Deadline', value: new Date(mockTicket.slaDeadline).toLocaleDateString() },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg border-2 border-black/10 bg-nb-sage/10">
                                    <item.icon className="w-4 h-4" />
                                    <div>
                                        <p className="text-[10px] font-heading font-bold uppercase">{item.label}</p>
                                        <p className="text-sm font-heading font-bold">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {showAi && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="nb-card-lg p-5 bg-nb-yellow overflow-hidden">
                                <h3 className="font-heading font-extrabold flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4" /> AI Insights
                                </h3>
                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl bg-white border-2 border-black">
                                        <p className="text-[10px] font-heading font-bold uppercase mb-1">Sentiment</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-3 rounded-lg bg-nb-sage/30 border-2 border-black overflow-hidden">
                                                <div className="h-full bg-red-500 rounded-lg" style={{ width: '80%' }} />
                                            </div>
                                            <span className="text-xs font-heading font-bold text-red-600">{aiSuggestion.sentiment}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white border-2 border-black">
                                        <p className="text-[10px] font-heading font-bold uppercase mb-1">Category</p>
                                        <p className="text-sm font-heading font-bold">{aiSuggestion.category} ({Math.round(aiSuggestion.confidence * 100)}%)</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white border-2 border-black">
                                        <p className="text-[10px] font-heading font-bold uppercase mb-2">Suggested Response</p>
                                        <p className="text-xs font-body whitespace-pre-line leading-relaxed">{aiSuggestion.response}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={handleUseResponse} className="nb-btn-sm nb-btn nb-btn-yellow">
                                                {usedResponse ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Use Response</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
