import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Ticket, Clock, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown,
    Users, Zap, ArrowUpRight, BarChart3, Loader2
} from 'lucide-react';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { analyticsApi, ticketApi } from '../lib/api';

const CATEGORY_COLORS = ['#171e19', '#b7c6c2', '#ffe17c', '#272727', '#000000'];

const statusBadge: Record<string, string> = {
    open: 'bg-white', in_progress: 'bg-nb-yellow', pending: 'bg-nb-sage',
    resolved: 'bg-nb-charcoal text-white', closed: 'bg-gray-200',
};
const priorityDot: Record<string, string> = {
    low: 'bg-nb-sage', medium: 'bg-nb-yellow', high: 'bg-orange-500', urgent: 'bg-red-500',
};

function Skeleton({ className }: { className: string }) {
    return <div className={`animate-pulse bg-black/10 rounded-lg ${className}`} />;
}

function AnimatedCounter({ value }: { value: number }) {
    return <>{value.toLocaleString()}</>;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [trendPeriod, setTrendPeriod] = useState('30d');

    const { data: metrics, isLoading: metricsLoading } = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: () => analyticsApi.getDashboard().then(r => r.data),
        retry: 1,
    });

    const { data: trendsData, isLoading: trendsLoading } = useQuery({
        queryKey: ['ticket-trends', trendPeriod],
        queryFn: () => analyticsApi.getTicketTrends(trendPeriod).then(r => r.data),
        retry: 1,
    });

    const { data: agentData, isLoading: agentsLoading } = useQuery({
        queryKey: ['agent-performance'],
        queryFn: () => analyticsApi.getAgentPerformance().then(r => r.data),
        retry: 1,
    });

    const { data: categoryData, isLoading: categoryLoading } = useQuery({
        queryKey: ['category-distribution'],
        queryFn: () => analyticsApi.getCategoryDistribution().then(r => r.data),
        retry: 1,
    });

    const { data: recentTicketsData, isLoading: ticketsLoading } = useQuery({
        queryKey: ['recent-tickets'],
        queryFn: () => ticketApi.getAll({ size: '5', sort: 'createdAt,desc' }).then(r => r.data),
        retry: 1,
    });

    const m = metrics || {};
    const agents = agentData?.content || agentData || [];
    const categories = categoryData || [];
    const trendPoints = trendsData?.content || trendsData || [];
    const recentTickets = recentTicketsData?.content || recentTicketsData || [];

    const cards = [
        { label: 'Total Tickets', value: m.totalTickets ?? 0, icon: Ticket, bg: 'bg-white', change: m.totalTicketsChange ?? '—', up: true, nav: '/tickets' },
        { label: 'Open Tickets', value: m.openTickets ?? 0, icon: Clock, bg: 'bg-nb-sage', change: m.openTicketsChange ?? '—', up: false, nav: '/tickets' },
        { label: 'Resolved', value: m.resolvedTickets ?? 0, icon: CheckCircle2, bg: 'bg-nb-yellow', change: m.resolvedChange ?? '—', up: true, nav: '/tickets' },
        { label: 'Urgent', value: m.urgentTickets ?? 0, icon: AlertTriangle, bg: 'bg-nb-charcoal text-white', change: m.urgentChange ?? '—', up: false, nav: '/tickets' },
    ];

    return (
        <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className={`nb-card p-5 cursor-pointer ${card.bg}`} onClick={() => navigate(card.nav)}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-heading font-bold opacity-60 mb-1">{card.label}</p>
                                    <p className="text-4xl font-heading font-extrabold tracking-tighter">
                                        {metricsLoading ? <Skeleton className="h-9 w-20" /> : <AnimatedCounter value={card.value} />}
                                    </p>
                                    <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${card.up ? 'text-green-700' : 'text-red-600'}`}>
                                        {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {String(card.change)} this month
                                    </div>
                                </div>
                                <div className="nb-icon-box">
                                    <card.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-2 nb-card-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading text-lg font-extrabold tracking-tight">Ticket Trends</h3>
                        <div className="flex gap-1">
                            {['7d', '14d', '30d'].map((p) => (
                                <button key={p} onClick={() => setTrendPeriod(p)}
                                    className={`px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-black transition-all ${trendPeriod === p ? 'bg-nb-charcoal text-white shadow-nb-sm' : 'bg-white hover:bg-nb-yellow'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    {trendsLoading ? <Skeleton className="h-[280px] w-full" /> : (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trendPoints}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} tickFormatter={v => String(v).slice(5)} />
                                <YAxis tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} />
                                <Tooltip contentStyle={{ background: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0px #000', fontFamily: 'Space Grotesk', fontSize: '12px' }} />
                                <Area type="stepAfter" dataKey="total" stroke="#171e19" fill="#ffe17c" strokeWidth={2} />
                                <Area type="stepAfter" dataKey="resolved" stroke="#b7c6c2" fill="#b7c6c2" strokeWidth={2} fillOpacity={0.4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="nb-card-lg p-6">
                    <h3 className="font-heading text-lg font-extrabold tracking-tight mb-4">Categories</h3>
                    {categoryLoading ? <Skeleton className="h-[220px] w-full" /> : (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={categories} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="count" stroke="#000" strokeWidth={2}>
                                        {categories.map((_: any, i: number) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0px #000', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {categories.map((cat: any, i: number) => (
                                    <div key={cat.category} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-black rounded-sm" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                                            <span className="font-body font-medium">{cat.category}</span>
                                        </div>
                                        <span className="font-heading font-bold">{cat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agent Leaderboard */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="nb-card-lg p-6">
                    <h3 className="font-heading text-lg font-extrabold tracking-tight flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5" /> Agent Leaderboard
                    </h3>
                    {agentsLoading ? (
                        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                    ) : agents.length === 0 ? (
                        <p className="text-sm font-body text-muted-foreground text-center py-8">No agent data yet</p>
                    ) : (
                        <div className="space-y-2">
                            {agents.slice(0, 5).map((agent: any, i: number) => (
                                <div key={agent.id || i} className="flex items-center gap-3 p-3 rounded-xl border-2 border-black bg-white hover:bg-nb-yellow transition-colors shadow-nb-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer"
                                    onClick={() => navigate('/analytics')}>
                                    <div className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-heading font-extrabold ${i === 0 ? 'bg-nb-yellow' : i === 1 ? 'bg-nb-sage' : i === 2 ? 'bg-orange-200' : 'bg-white'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="w-9 h-9 rounded-lg bg-nb-charcoal border-2 border-black flex items-center justify-center text-nb-yellow text-xs font-bold">
                                        {(agent.name || agent.agentName || '?').split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-heading font-bold">{agent.name || agent.agentName}</p>
                                        <p className="text-xs font-body text-muted-foreground">{agent.ticketsResolved ?? agent.resolvedCount ?? 0} resolved</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-heading font-extrabold">★ {(agent.avgCsat ?? agent.avgSatisfaction ?? 0).toFixed(1)}</p>
                                        <p className="text-xs font-body text-muted-foreground">{(agent.avgResolutionHours ?? 0).toFixed(1)}h avg</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    className="nb-card-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading text-lg font-extrabold tracking-tight flex items-center gap-2">
                            <Zap className="w-5 h-5" /> Recent Activity
                        </h3>
                        <button onClick={() => navigate('/tickets')} className="nb-btn-sm nb-btn nb-btn-yellow">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                    {ticketsLoading ? (
                        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                    ) : recentTickets.length === 0 ? (
                        <p className="text-sm font-body text-muted-foreground text-center py-8">No tickets yet — create your first one!</p>
                    ) : (
                        <div className="space-y-2">
                            {recentTickets.map((ticket: any) => (
                                <div key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-black bg-white hover:bg-nb-sage/30 transition-all cursor-pointer group shadow-nb-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                                    <div className={`w-3 h-3 rounded-full border-2 border-black ${priorityDot[ticket.priority?.toLowerCase()] || 'bg-gray-300'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-heading font-bold truncate group-hover:text-nb-charcoal">{ticket.subject}</p>
                                        <p className="text-xs font-body text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`nb-badge text-[10px] ${statusBadge[ticket.status?.toLowerCase()] || 'bg-white'}`}>
                                        {(ticket.status || '').replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Avg Resolution', value: metricsLoading ? '…' : `${m.avgResolutionTimeHours ?? 0}h`, icon: Clock, nav: '/analytics' },
                    { label: 'CSAT Score', value: metricsLoading ? '…' : `${m.avgCustomerSatisfaction ?? 0}/5`, icon: BarChart3, nav: '/analytics' },
                    { label: 'SLA Breaches', value: metricsLoading ? '…' : String(m.slaBreachCount ?? 0), icon: AlertTriangle, nav: '/analytics' },
                    { label: 'In Progress', value: metricsLoading ? '…' : String(m.inProgressTickets ?? 0), icon: TrendingUp, nav: '/tickets' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.05 }}>
                        <div className="nb-card p-4 flex items-center gap-3 cursor-pointer" onClick={() => navigate(stat.nav)}>
                            <div className="nb-icon-box w-10 h-10">
                                {metricsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <stat.icon className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-xs font-body text-muted-foreground">{stat.label}</p>
                                <p className="text-xl font-heading font-extrabold tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
