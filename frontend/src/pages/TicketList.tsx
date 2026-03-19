import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, Filter, Plus, ChevronDown, ArrowUpDown,
    Clock, AlertCircle, CheckCircle2, Loader2, X, Send, Edit2, Save
} from 'lucide-react';
import { ticketApi } from '../lib/api';

const statusCfg: Record<string, { icon: any; bg: string }> = {
    open: { icon: AlertCircle, bg: 'bg-white' },
    in_progress: { icon: Loader2, bg: 'bg-nb-yellow' },
    pending: { icon: Clock, bg: 'bg-nb-sage' },
    resolved: { icon: CheckCircle2, bg: 'bg-nb-charcoal text-white' },
    closed: { icon: CheckCircle2, bg: 'bg-gray-200' },
};
const prioColor: Record<string, string> = {
    low: 'bg-nb-sage', medium: 'bg-nb-yellow', high: 'bg-orange-400', urgent: 'bg-red-500'
};

function Skeleton({ className }: { className: string }) {
    return <div className={`animate-pulse bg-black/10 rounded-lg ${className}`} />;
}

interface EditTicketForm {
    subject: string;
    description: string;
    priority: string;
    category: string;
    status: string;
}

export default function TicketList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [editingTicket, setEditingTicket] = useState<any | null>(null);
    const [newTicket, setNewTicket] = useState({
        subject: '', description: '', priority: 'medium', category: 'Technical'
    });
    const [editForm, setEditForm] = useState<EditTicketForm>({
        subject: '', description: '', priority: '', category: '', status: ''
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['tickets', statusFilter, priorityFilter, search],
        queryFn: () => ticketApi.getAll({
            ...(statusFilter && { status: statusFilter }),
            ...(priorityFilter && { priority: priorityFilter }),
            ...(search && { q: search }),
            size: '50',
        }).then(r => r.data),
        retry: 1,
    });

    const tickets = data?.content || data || [];

    const createMutation = useMutation({
        mutationFn: (payload: any) => ticketApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['recent-tickets'] });
            setNewTicket({ subject: '', description: '', priority: 'medium', category: 'Technical' });
            setShowCreate(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => ticketApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
            setEditingTicket(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ticketApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
        },
    });

    const handleCreate = () => {
        if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
        createMutation.mutate(newTicket);
    };

    const handleEditOpen = (ticket: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTicket(ticket);
        setEditForm({
            subject: ticket.subject || '',
            description: ticket.description || '',
            priority: ticket.priority || 'medium',
            category: ticket.category || 'Technical',
            status: ticket.status || 'open',
        });
    };

    const handleEditSave = () => {
        if (!editingTicket || !editForm.subject.trim() || !editForm.description.trim()) return;
        updateMutation.mutate({ id: editingTicket.id, data: editForm });
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this ticket? This cannot be undone.')) {
            deleteMutation.mutate(id);
        }
    };

    const canCreate = newTicket.subject.trim() && newTicket.description.trim();
    const canSave = editForm.subject.trim() && editForm.description.trim();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-heading text-3xl font-extrabold tracking-tighter">Tickets</h2>
                    <p className="text-sm font-body text-muted-foreground">
                        {isLoading ? 'Loading…' : `${tickets.length} tickets found`}
                    </p>
                </div>
                <button onClick={() => setShowCreate(true)} className="nb-btn nb-btn-yellow shadow-nb-lg">
                    <Plus className="w-4 h-4" /> New Ticket
                </button>
            </div>

            {/* ===== Create Ticket Modal ===== */}
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
                                    <button onClick={() => setShowCreate(false)}
                                        className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center hover:bg-nb-yellow transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-heading font-bold mb-1.5">
                                            Subject <span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" value={newTicket.subject}
                                            onChange={e => setNewTicket(f => ({ ...f, subject: e.target.value }))}
                                            className="nb-input" placeholder="Brief description of the issue" autoFocus />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-heading font-bold mb-1.5">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea value={newTicket.description}
                                            onChange={e => setNewTicket(f => ({ ...f, description: e.target.value }))}
                                            className="nb-input min-h-[100px] resize-none"
                                            placeholder="Explain the issue in detail..." />
                                        {!newTicket.description.trim() && newTicket.subject.trim() && (
                                            <p className="text-xs text-red-500 mt-1 font-heading font-bold">Description is required</p>
                                        )}
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
                                            <select value={newTicket.category}
                                                onChange={e => setNewTicket(f => ({ ...f, category: e.target.value }))}
                                                className="nb-input text-sm">
                                                {['Technical', 'Billing', 'Feature Request', 'Bug Report', 'General'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={handleCreate} disabled={!canCreate || createMutation.isPending}
                                        className="nb-btn nb-btn-yellow w-full justify-center shadow-nb-lg disabled:opacity-40 disabled:cursor-not-allowed">
                                        {createMutation.isPending
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                                            : <><Send className="w-4 h-4" /> Create Ticket</>}
                                    </button>
                                    {createMutation.isError && (
                                        <p className="text-xs text-red-600 font-heading font-bold text-center">
                                            Failed to create ticket. Make sure the backend is running.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ===== Edit Ticket Modal ===== */}
            <AnimatePresence>
                {editingTicket && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setEditingTicket(null)} className="fixed inset-0 bg-black/40 z-50" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="nb-card-lg p-6 w-full max-w-lg bg-white" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-heading text-xl font-extrabold">Edit Ticket</h3>
                                    <button onClick={() => setEditingTicket(null)}
                                        className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center hover:bg-nb-yellow transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-heading font-bold mb-1.5">
                                            Subject <span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" value={editForm.subject}
                                            onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                                            className="nb-input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-heading font-bold mb-1.5">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea value={editForm.description}
                                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                            className="nb-input min-h-[100px] resize-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-heading font-bold mb-1.5">Status</label>
                                            <select value={editForm.status}
                                                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                                                className="nb-input text-sm">
                                                {['open', 'in_progress', 'pending', 'resolved', 'closed'].map(s => (
                                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-heading font-bold mb-1.5">Priority</label>
                                            <select value={editForm.priority}
                                                onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}
                                                className="nb-input text-sm">
                                                {['low', 'medium', 'high', 'urgent'].map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-heading font-bold mb-1.5">Category</label>
                                        <select value={editForm.category}
                                            onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                                            className="nb-input text-sm">
                                            {['Technical', 'Billing', 'Feature Request', 'Bug Report', 'General'].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button onClick={handleEditSave} disabled={!canSave || updateMutation.isPending}
                                        className="nb-btn nb-btn-yellow w-full justify-center shadow-nb-lg disabled:opacity-40 disabled:cursor-not-allowed">
                                        {updateMutation.isPending
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                            : <><Save className="w-4 h-4" /> Save Changes</>}
                                    </button>
                                    {updateMutation.isError && (
                                        <p className="text-xs text-red-600 font-heading font-bold text-center">
                                            Failed to save. Please try again.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ===== Search + Filters ===== */}
            <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[280px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                    <input type="text" placeholder="Search tickets..." value={search}
                        onChange={e => setSearch(e.target.value)} className="nb-input pl-10" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                    className={`nb-btn nb-btn-sm ${showFilters ? 'nb-btn-yellow' : 'nb-btn-white'}`}>
                    <Filter className="w-4 h-4" /> Filters
                    <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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

            {/* ===== Table ===== */}
            <div className="nb-card-lg overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                ) : isError ? (
                    <div className="p-12 text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-500" />
                        <p className="font-heading font-bold">Could not load tickets</p>
                        <p className="text-xs font-body text-muted-foreground mt-1">Make sure the API gateway is running on port 8080</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-black bg-nb-sage/30">
                                    {['Subject', 'Status', 'Priority', 'Category', 'Customer', 'Assigned', 'Created', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-heading font-extrabold uppercase tracking-wider">
                                            {h === 'Actions' ? h : (
                                                <button className="flex items-center gap-1 hover:text-nb-charcoal">
                                                    {h} <ArrowUpDown className="w-3 h-3" />
                                                </button>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket: any, i: number) => {
                                    const statusKey = (ticket.status || 'open').toLowerCase();
                                    const cfg = statusCfg[statusKey] || statusCfg.open;
                                    const Icon = cfg.icon;
                                    return (
                                        <motion.tr key={ticket.id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            transition={{ delay: Math.min(i * 0.02, 0.5) }}
                                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                                            className="border-b-2 border-black/10 hover:bg-nb-yellow/30 cursor-pointer transition-colors group">
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-heading font-bold group-hover:underline decoration-2 underline-offset-2">
                                                    {ticket.subject}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`nb-badge ${cfg.bg}`}>
                                                    <Icon className="w-3 h-3" /> {statusKey.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-sm border-2 border-black ${prioColor[(ticket.priority || 'medium').toLowerCase()] || 'bg-gray-300'}`} />
                                                    <span className="text-xs font-heading font-bold capitalize">
                                                        {(ticket.priority || '').toLowerCase()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-body">{ticket.category || '—'}</td>
                                            <td className="px-4 py-3 text-sm font-heading font-bold">
                                                {ticket.customerName || ticket.customer?.name || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-body text-muted-foreground">
                                                {ticket.assignedToName || ticket.assignedTo?.name || 'Unassigned'}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-body text-muted-foreground">
                                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => handleEditOpen(ticket, e)}
                                                        className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center hover:bg-nb-yellow transition-colors"
                                                        title="Edit ticket">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(ticket.id, e)}
                                                        disabled={deleteMutation.isPending}
                                                        className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center hover:bg-red-100 text-red-500 transition-colors disabled:opacity-40"
                                                        title="Delete ticket">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {tickets.length === 0 && (
                            <div className="p-12 text-center">
                                <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                <p className="font-heading font-bold">No tickets found</p>
                                <p className="text-xs font-body text-muted-foreground mt-1">
                                    Try adjusting your filters or create a new ticket
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}