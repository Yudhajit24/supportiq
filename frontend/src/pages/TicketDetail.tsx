import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Clock, User, Tag, AlertTriangle, MessageSquare, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { ticketApi, aiService } from '../lib/api';

const statusOpts = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
const statusBg: Record<string, string> = {
    open: 'bg-white', in_progress: 'bg-nb-yellow', pending: 'bg-nb-sage',
    resolved: 'bg-nb-charcoal text-white', closed: 'bg-gray-200',
};

function Skeleton({ className }: { className: string }) {
    return <div className={`animate-pulse bg-black/10 rounded-lg ${className}`} />;
}

export default function TicketDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');
    const [showAi, setShowAi] = useState(false);
    const [usedResponse, setUsedResponse] = useState(false);
    const [statusSaved, setStatusSaved] = useState(false);

    const { data: ticket, isLoading: ticketLoading } = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => ticketApi.getById(id!).then(r => r.data),
        enabled: !!id,
        retry: 1,
    });

    const { data: commentsData, isLoading: commentsLoading } = useQuery({
        queryKey: ['ticket-comments', id],
        queryFn: () => ticketApi.getComments(id!).then(r => r.data),
        enabled: !!id,
        retry: 1,
    });

    const { data: aiInsights, isLoading: aiLoading } = useQuery({
        queryKey: ['ai-suggest', id, ticket?.subject],
        queryFn: () => aiService.suggestResponse({
            ticket_subject: ticket!.subject,
            ticket_description: ticket!.description || '',
        }).then(r => r.data),
        enabled: showAi && !!ticket,
        retry: 1,
    });

    const comments = commentsData?.content || commentsData || [];

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => ticketApi.updateStatus(id!, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
            setStatusSaved(true);
            setTimeout(() => setStatusSaved(false), 1500);
        },
    });

    const addCommentMutation = useMutation({
        mutationFn: (content: string) => ticketApi.addComment(id!, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket-comments', id] });
            setNewComment('');
        },
    });

    const handleSendComment = () => {
        if (!newComment.trim()) return;
        addCommentMutation.mutate(newComment);
    };

    const handleUseResponse = () => {
        if (aiInsights?.suggested_response) {
            setNewComment(aiInsights.suggested_response);
            setUsedResponse(true);
            setTimeout(() => setUsedResponse(false), 2000);
        }
    };

    if (ticketLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-4">
                <Skeleton className="h-8 w-40" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-80 w-full" />
                    </div>
                    <Skeleton className="h-60 w-full" />
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="max-w-7xl mx-auto text-center py-20">
                <p className="font-heading font-bold text-xl">Ticket not found</p>
                <button onClick={() => navigate('/tickets')} className="nb-btn nb-btn-yellow mt-4">Back to tickets</button>
            </div>
        );
    }

    const currentStatus = (ticket.status || 'open').toLowerCase();
    const priority = (ticket.priority || 'medium').toLowerCase();

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
                                <div className={`w-3 h-3 rounded-sm border-2 border-black ${statusBg[currentStatus] || 'bg-white'}`} />
                                <select value={currentStatus}
                                    onChange={e => updateStatusMutation.mutate(e.target.value)}
                                    className="px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-black bg-white capitalize">
                                    {statusOpts.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                                {statusSaved && <span className="text-xs font-heading font-bold text-green-700 flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                                <span className="nb-badge bg-orange-200 border-orange-400">{priority.toUpperCase()}</span>
                            </div>
                            <button onClick={() => setShowAi(!showAi)}
                                className={`nb-btn-sm nb-btn ${showAi ? '' : 'nb-btn-yellow'}`}>
                                <Sparkles className="w-3.5 h-3.5" /> AI Assist
                            </button>
                        </div>
                        <h1 className="font-heading text-2xl font-extrabold tracking-tighter mb-2">{ticket.subject}</h1>
                        <p className="text-sm font-body leading-relaxed text-muted-foreground">{ticket.description}</p>
                    </motion.div>

                    {/* Conversation */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nb-card-lg p-6">
                        <h3 className="font-heading font-extrabold flex items-center gap-2 mb-4">
                            <MessageSquare className="w-4 h-4" /> Conversation ({commentsLoading ? '…' : comments.length})
                        </h3>
                        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                            {commentsLoading ? (
                                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                            ) : comments.length === 0 ? (
                                <p className="text-sm font-body text-muted-foreground text-center py-6">No messages yet — start the conversation</p>
                            ) : (
                                comments.map((c: any) => {
                                    const isCustomer = c.isCustomer ?? c.authorRole === 'CUSTOMER';
                                    const authorName = c.author || c.authorName || 'Unknown';
                                    const time = c.time || (c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
                                    return (
                                        <motion.div key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${isCustomer ? '' : 'flex-row-reverse'}`}>
                                            <div className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCustomer ? 'bg-nb-sage' : 'bg-nb-charcoal text-nb-yellow'}`}>
                                                {authorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div className={`max-w-[75%] ${isCustomer ? '' : 'text-right'}`}>
                                                <div className={`inline-block rounded-xl px-4 py-3 text-sm font-body border-2 border-black whitespace-pre-wrap ${isCustomer ? 'bg-white rounded-tl-none shadow-nb-sm' : 'bg-nb-yellow rounded-tr-none shadow-nb-sm'}`}>
                                                    {c.content}
                                                </div>
                                                <p className="text-xs font-body text-muted-foreground mt-1">{authorName} · {time}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                        <div className="flex gap-2 pt-4 border-t-2 border-black">
                            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                                placeholder="Type your reply..." className="nb-input flex-1" />
                            <button onClick={handleSendComment}
                                disabled={!newComment.trim() || addCommentMutation.isPending}
                                className="nb-btn nb-btn-yellow disabled:opacity-40 disabled:cursor-not-allowed">
                                {addCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
                                { icon: User, label: 'Customer', value: ticket.customerName || ticket.customer?.name || '—' },
                                { icon: Tag, label: 'Category', value: ticket.category || '—' },
                                { icon: User, label: 'Assigned', value: ticket.assignedToName || ticket.assignedTo?.name || 'Unassigned' },
                                { icon: Clock, label: 'Created', value: ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '—' },
                                { icon: AlertTriangle, label: 'SLA Deadline', value: ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleDateString() : 'Not set' },
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
                                {aiLoading ? (
                                    <div className="flex items-center gap-2 text-sm font-body">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Analyzing with AI…
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {aiInsights?.suggested_response && (
                                            <div className="p-3 rounded-xl bg-white border-2 border-black">
                                                <p className="text-[10px] font-heading font-bold uppercase mb-2">Suggested Response</p>
                                                <p className="text-xs font-body whitespace-pre-line leading-relaxed">{aiInsights.suggested_response}</p>
                                                <button onClick={handleUseResponse} className="nb-btn-sm nb-btn nb-btn-yellow mt-2">
                                                    {usedResponse ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Use Response</>}
                                                </button>
                                            </div>
                                        )}
                                        {!aiInsights && (
                                            <p className="text-xs font-body">AI service unavailable. Start the Python service to enable AI insights.</p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
