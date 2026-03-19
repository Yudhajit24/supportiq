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
    open: { icon: AlertCircle, bg: 'bg-accent-sage/20 text-accent-sage' },
    in_progress: { icon: Loader2, bg: 'bg-accent-indigo/20 text-accent-indigo' },
    pending: { icon: Clock, bg: 'bg-accent-lavender/20 text-accent-lavender' },
    resolved: { icon: CheckCircle2, bg: 'bg-accent-emerald/20 text-accent-emerald' },
    closed: { icon: CheckCircle2, bg: 'bg-muted text-muted-foreground' },
};
const prioColor: Record<string, string> = {
    low: 'bg-accent-sage', medium: 'bg-accent-lavender', high: 'bg-orange-500', urgent: 'bg-accent-rose'
};

function Skeleton({ className }: { className: string }) {
    return <div className={`animate-pulse bg-muted rounded-xl ${className}`} />;
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
        <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Tickets</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isLoading ? 'Loading…' : `${tickets.length} tickets found`}
                    </p>
                </div>
                <button onClick={() => setShowCreate(true)} className="nm-button flex items-center gap-2 px-6 py-3 font-bold text-sm text-primary">
                    <Plus className="w-4 h-4" /> New Ticket
                </button>
            </div>

            {/* ===== Create Ticket Modal ===== */}
            <AnimatePresence>
                {showCreate && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCreate(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="nm-flat p-8 w-full max-w-lg rounded-[32px] overflow-hidden relative" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-8 z-10 relative">
                                    <h3 className="text-2xl font-extrabold">Create Ticket</h3>
                                    <button onClick={() => setShowCreate(false)}
                                        className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                            Subject <span className="text-accent-rose">*</span>
                                        </label>
                                        <input type="text" value={newTicket.subject}
                                            onChange={e => setNewTicket(f => ({ ...f, subject: e.target.value }))}
                                            className="w-full nm-inset px-5 py-4 rounded-2xl bg-transparent outline-none text-foreground font-semibold placeholder:text-muted-foreground/50" placeholder="Brief description of the issue" autoFocus />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                            Description <span className="text-accent-rose">*</span>
                                        </label>
                                        <textarea value={newTicket.description}
                                            onChange={e => setNewTicket(f => ({ ...f, description: e.target.value }))}
                                            className="w-full nm-inset px-5 py-4 rounded-2xl bg-transparent outline-none text-foreground font-medium placeholder:text-muted-foreground/50 min-h-[120px] resize-none"
                                            placeholder="Explain the issue in detail..." />
                                        {!newTicket.description.trim() && newTicket.subject.trim() && (
                                            <p className="text-xs text-accent-rose mt-2 font-bold">Description is required</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Priority</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {['low', 'medium', 'high', 'urgent'].map(p => (
                                                    <button key={p} onClick={() => setNewTicket(f => ({ ...f, priority: p }))}
                                                        className={`px-4 py-2 text-xs font-bold rounded-full capitalize transition-all ${newTicket.priority === p ? 'nm-flat text-primary' : 'nm-inset text-muted-foreground hover:text-foreground'}`}>
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Category</label>
                                            <select value={newTicket.category}
                                                onChange={e => setNewTicket(f => ({ ...f, category: e.target.value }))}
                                                className="w-full nm-inset px-5 py-3 rounded-2xl bg-transparent outline-none text-foreground font-semibold appearance-none">
                                                {['Technical', 'Billing', 'Feature Request', 'Bug Report', 'General'].map(c => (
                                                    <option key={c} value={c} className="bg-background">{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button onClick={handleCreate} disabled={!canCreate || createMutation.isPending}
                                            className="nm-button w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-primary disabled:opacity-40 disabled:cursor-not-allowed text-lg">
                                            {createMutation.isPending
                                                ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating…</>
                                                : <><Send className="w-5 h-5" /> Submit Ticket</>}
                                        </button>
                                        {createMutation.isError && (
                                            <p className="text-sm text-accent-rose font-bold text-center mt-4">
                                                Failed to create ticket. Please try again.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ===== Edit Ticket Modal ===== */}
            <AnimatePresence>
                {editingTicket && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setEditingTicket(null)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="nm-flat p-8 w-full max-w-xl rounded-[32px] overflow-hidden relative" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-8 z-10 relative">
                                    <h3 className="text-2xl font-extrabold">Edit Ticket</h3>
                                    <button onClick={() => setEditingTicket(null)}
                                        className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                            Subject <span className="text-accent-rose">*</span>
                                        </label>
                                        <input type="text" value={editForm.subject}
                                            onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                                            className="w-full nm-inset px-5 py-4 rounded-2xl bg-transparent outline-none text-foreground font-semibold placeholder:text-muted-foreground/50" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                            Description <span className="text-accent-rose">*</span>
                                        </label>
                                        <textarea value={editForm.description}
                                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                            className="w-full nm-inset px-5 py-4 rounded-2xl bg-transparent outline-none text-foreground font-medium placeholder:text-muted-foreground/50 min-h-[120px] resize-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Status</label>
                                            <select value={editForm.status}
                                                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                                                className="w-full nm-inset px-5 py-3 rounded-2xl bg-transparent outline-none text-foreground font-semibold appearance-none">
                                                {['open', 'in_progress', 'pending', 'resolved', 'closed'].map(s => (
                                                    <option key={s} value={s} className="bg-background">{s.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Priority</label>
                                            <select value={editForm.priority}
                                                onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}
                                                className="w-full nm-inset px-5 py-3 rounded-2xl bg-transparent outline-none text-foreground font-semibold appearance-none">
                                                {['low', 'medium', 'high', 'urgent'].map(p => (
                                                    <option key={p} value={p} className="bg-background">{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Category</label>
                                        <select value={editForm.category}
                                            onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                                            className="w-full nm-inset px-5 py-3 rounded-2xl bg-transparent outline-none text-foreground font-semibold appearance-none">
                                            {['Technical', 'Billing', 'Feature Request', 'Bug Report', 'General'].map(c => (
                                                <option key={c} value={c} className="bg-background">{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="pt-4">
                                        <button onClick={handleEditSave} disabled={!canSave || updateMutation.isPending}
                                            className="nm-button w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-primary disabled:opacity-40 disabled:cursor-not-allowed text-lg">
                                            {updateMutation.isPending
                                                ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
                                                : <><Save className="w-5 h-5" /> Save Changes</>}
                                        </button>
                                        {updateMutation.isError && (
                                            <p className="text-sm text-accent-rose font-bold text-center mt-4">
                                                Failed to save. Please try again.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ===== Search + Filters ===== */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[320px] relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="text" placeholder="Search tickets..." value={search}
                        onChange={e => setSearch(e.target.value)} className="w-full nm-inset pl-14 pr-6 py-4 rounded-2xl bg-transparent outline-none text-foreground font-semibold placeholder:text-muted-foreground/50 transition-all focus:ring-0" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                    className={`nm-button flex items-center gap-2 px-6 py-4 font-bold text-sm ${showFilters ? 'text-primary' : 'text-foreground'}`}>
                    <Filter className="w-4 h-4" /> Filters
                    <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="nm-flat p-6 rounded-[24px] flex gap-8 flex-wrap">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Status</label>
                        <div className="flex gap-2 flex-wrap">
                            {['', 'open', 'in_progress', 'pending', 'resolved', 'closed'].map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-2 text-xs font-bold rounded-full capitalize transition-all ${statusFilter === s ? 'nm-flat text-primary' : 'nm-inset text-muted-foreground hover:text-foreground'}`}>
                                    {s ? s.replace('_', ' ') : 'All'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Priority</label>
                        <div className="flex gap-2 flex-wrap">
                            {['', 'low', 'medium', 'high', 'urgent'].map(p => (
                                <button key={p} onClick={() => setPriorityFilter(p)}
                                    className={`px-4 py-2 text-xs font-bold rounded-full capitalize transition-all ${priorityFilter === p ? 'nm-flat text-primary' : 'nm-inset text-muted-foreground hover:text-foreground'}`}>
                                    {p || 'All'}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ===== Table ===== */}
            <div className="nm-flat rounded-[32px] overflow-hidden">
                {isLoading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                ) : isError ? (
                    <div className="p-20 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-6 text-accent-rose animate-float opacity-80" />
                        <p className="text-xl font-extrabold tracking-tight">System Unreachable</p>
                        <p className="text-sm font-medium text-muted-foreground mt-2">Make sure the API gateway is running on port 8080</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b-[1px] border-border/10 bg-background/20 relative">
                                    <th colSpan={8} className="absolute inset-0 nm-inset opacity-5 pointer-events-none" />
                                    {['Subject', 'Status', 'Priority', 'Category', 'Customer', 'Assigned', 'Created', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-widest text-muted-foreground relative z-10 w-auto">
                                            {h === 'Actions' ? h : (
                                                <button className="flex items-center gap-2 hover:text-foreground transition-colors group">
                                                    {h} <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
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
                                            className="border-b-[1px] border-border/5 hover:bg-background/40 cursor-pointer transition-all group scale-[0.99] hover:scale-100 shadow-none hover:shadow-nb-sm relative">
                                            <td className="px-6 py-5 relative z-10 w-1/4">
                                                <span className="text-[15px] font-bold tracking-tight text-foreground line-clamp-2 pr-4 group-hover:text-primary transition-colors">
                                                    {ticket.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 relative z-10 whitespace-nowrap">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 w-max ${cfg.bg}`}>
                                                    <Icon className="w-3 h-3" /> {statusKey.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 relative z-10 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${prioColor[(ticket.priority || 'medium').toLowerCase()] || 'bg-muted'}`} />
                                                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                                        {(ticket.priority || '').toLowerCase()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-[13px] font-semibold text-muted-foreground relative z-10 whitespace-nowrap">{ticket.category || '—'}</td>
                                            <td className="px-6 py-5 text-[14px] font-bold text-foreground relative z-10 whitespace-nowrap">
                                                {ticket.customerName || ticket.customer?.name || '—'}
                                            </td>
                                            <td className="px-6 py-5 text-[13px] font-medium text-muted-foreground relative z-10 whitespace-nowrap">
                                                {ticket.assignedToName || ticket.assignedTo?.name || 'Unassigned'}
                                            </td>
                                            <td className="px-6 py-5 text-[13px] font-medium text-muted-foreground relative z-10 whitespace-nowrap">
                                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-5 relative z-10 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleEditOpen(ticket, e)}
                                                        className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-primary transition-all hover:scale-110"
                                                        title="Edit ticket">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(ticket.id, e)}
                                                        disabled={deleteMutation.isPending}
                                                        className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-accent-rose transition-all hover:scale-110 disabled:opacity-40"
                                                        title="Delete ticket">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {tickets.length === 0 && (
                            <div className="p-20 text-center">
                                <div className="w-20 h-20 rounded-[32px] nm-inset mx-auto mb-6 flex items-center justify-center">
                                    <Search className="w-8 h-8 opacity-40 text-muted-foreground" />
                                </div>
                                <p className="text-xl font-extrabold tracking-tight">No Tickets Found</p>
                                <p className="text-sm font-medium text-muted-foreground mt-2">
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