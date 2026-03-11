import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, ChevronDown, ArrowUpDown, Clock, AlertCircle, CheckCircle2, Loader2, X, Send } from 'lucide-react';

const initialTickets = Array.from({ length: 50 }, (_, i) => ({
    id: `ticket-${i + 1}`,
    subject: ['Cannot login to dashboard', 'Billing discrepancy', 'Feature: Dark mode', 'App crashes on upload', 'Password reset help', 'API rate limit', 'Payment failed', 'Export to CSV', 'Chart not rendering', 'Pricing inquiry', 'SSL expired', 'Refund request', 'Webhook support', 'Data loss', 'Setup help', 'Slow page load', 'Invoice missing', 'Slack integration', '2FA not working', 'Account deletion'][i % 20],
    status: ['open', 'in_progress', 'pending', 'resolved', 'closed'][i % 5] as string,
    priority: ['low', 'medium', 'high', 'urgent'][i % 4] as string,
    category: ['Technical', 'Billing', 'Feature Request', 'Bug Report', 'General'][i % 5],
    customer: ['John Doe', 'Jane Smith', 'Bob Jones', 'Alice Brown', 'Charlie Wilson'][i % 5],
    assignedTo: ['Mike Johnson', 'Emily Davis', 'Alex Rivera', 'Jane Smith', 'Unassigned'][i % 5],
    created: new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString(),
}));

const statusCfg: Record<string, { icon: any; bg: string }> = {
    open: { icon: AlertCircle, bg: 'bg-white' },
    in_progress: { icon: Loader2, bg: 'bg-nb-yellow' },
    pending: { icon: Clock, bg: 'bg-nb-sage' },
    resolved: { icon: CheckCircle2, bg: 'bg-nb-charcoal text-white' },
    closed: { icon: CheckCircle2, bg: 'bg-gray-200' },
};

const prioColor: Record<string, string> = { low: 'bg-nb-sage', medium: 'bg-nb-yellow', high: 'bg-orange-400', urgent: 'bg-red-500' };

export default function TicketList() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState(initialTickets);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium', category: 'Technical' });

    const handleCreate = () => {
        if (!newTicket.subject.trim()) return;
        const ticket = {
            id: `ticket-${Date.now()}`,
            subject: newTicket.subject,
            status: 'open',
            priority: newTicket.priority,
            category: newTicket.category,
            customer: 'You',
            assignedTo: 'Unassigned',
            created: new Date().toLocaleDateString(),
        };
        setTickets([ticket, ...tickets]);
        setNewTicket({ subject: '', description: '', priority: 'medium', category: 'Technical' });
        setShowCreate(false);
    };

    const filtered = tickets.filter(t => {
        if (search && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter && t.status !== statusFilter) return false;
        if (priorityFilter && t.priority !== priorityFilter) return false;
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-heading text-3xl font-extrabold tracking-tighter">Tickets</h2>
                    <p className="text-sm font-body text-muted-foreground">{filtered.length} tickets found</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="nb-btn nb-btn-yellow shadow-nb-lg">
                    <Plus className="w-4 h-4" /> New Ticket
                </button>
            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {showCreate && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCreate(false)} className="fixed inset-0 bg-black/40 z-50" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="nb-card-lg p-6 w-full max-w-lg bg-white" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-heading text-xl font-extrabold">Create New Ticket</h3>
                                    <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center hover:bg-nb-yellow transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-heading font-bold mb-1.5">Subject</label>
                                        <input type="text" value={newTicket.subject} onChange={e => setNewTicket(f => ({ ...f, subject: e.target.value }))}
                                            className="nb-input" placeholder="Brief description of the issue" autoFocus />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-heading font-bold mb-1.5">Description</label>
                                        <textarea value={newTicket.description} onChange={e => setNewTicket(f => ({ ...f, description: e.target.value }))}
                                            className="nb-input min-h-[100px] resize-none" placeholder="Explain the issue in detail..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-heading font-bold mb-1.5">Priority</label>
                                            <div className="flex gap-1 flex-wrap">
                                                {['low', 'medium', 'high', 'urgent'].map(p => (
                                                    <button key={p} onClick={() => setNewTicket(f => ({ ...f, priority: p }))}
                                                        className={`px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-black capitalize transition-all ${newTicket.priority === p ? 'bg-nb-charcoal text-white shadow-nb-sm' : 'bg-white hover:bg-nb-yellow'}`}>
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-heading font-bold mb-1.5">Category</label>
                                            <select value={newTicket.category} onChange={e => setNewTicket(f => ({ ...f, category: e.target.value }))}
                                                className="nb-input text-sm">
                                                {['Technical', 'Billing', 'Feature Request', 'Bug Report', 'General'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={handleCreate} disabled={!newTicket.subject.trim()}
                                        className="nb-btn nb-btn-yellow w-full justify-center shadow-nb-lg disabled:opacity-40 disabled:cursor-not-allowed">
                                        <Send className="w-4 h-4" /> Create Ticket
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[280px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                    <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
                        className="nb-input pl-10" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                    className={`nb-btn nb-btn-sm ${showFilters ? 'nb-btn-yellow' : 'nb-btn-white'}`}>
                    <Filter className="w-4 h-4" /> Filters <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="nb-card p-4 flex gap-6 flex-wrap">
                    <div>
                        <label className="text-xs font-heading font-bold block mb-1.5">Status</label>
                        <div className="flex gap-1 flex-wrap">
                            {['', 'open', 'in_progress', 'pending', 'resolved', 'closed'].map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-black transition-all ${statusFilter === s ? 'bg-nb-charcoal text-white shadow-nb-sm' : 'bg-white hover:bg-nb-yellow'}`}>
                                    {s ? s.replace('_', ' ') : 'All'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-heading font-bold block mb-1.5">Priority</label>
                        <div className="flex gap-1">
                            {['', 'low', 'medium', 'high', 'urgent'].map(p => (
                                <button key={p} onClick={() => setPriorityFilter(p)}
                                    className={`px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-black transition-all ${priorityFilter === p ? 'bg-nb-charcoal text-white shadow-nb-sm' : 'bg-white hover:bg-nb-yellow'}`}>
                                    {p || 'All'}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="nb-card-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-black bg-nb-sage/30">
                                {['Subject', 'Status', 'Priority', 'Category', 'Customer', 'Assigned', 'Created'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-heading font-extrabold uppercase tracking-wider">
                                        <button className="flex items-center gap-1 hover:text-nb-charcoal">
                                            {h} <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((ticket, i) => {
                                const cfg = statusCfg[ticket.status];
                                const Icon = cfg.icon;
                                return (
                                    <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}
                                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                                        className="border-b-2 border-black/10 hover:bg-nb-yellow/30 cursor-pointer transition-colors group">
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-heading font-bold group-hover:underline decoration-2 underline-offset-2">{ticket.subject}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`nb-badge ${cfg.bg}`}>
                                                <Icon className="w-3 h-3" /> {ticket.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-sm border-2 border-black ${prioColor[ticket.priority]}`} />
                                                <span className="text-xs font-heading font-bold capitalize">{ticket.priority}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-body">{ticket.category}</td>
                                        <td className="px-4 py-3 text-sm font-heading font-bold">{ticket.customer}</td>
                                        <td className="px-4 py-3 text-sm font-body text-muted-foreground">{ticket.assignedTo}</td>
                                        <td className="px-4 py-3 text-xs font-body text-muted-foreground">{ticket.created}</td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="p-12 text-center">
                        <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p className="font-heading font-bold">No tickets found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

