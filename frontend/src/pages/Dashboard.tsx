import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Ticket, Clock, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown,
    Users, Zap, ArrowUpRight, BarChart3, Loader2, Settings
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { analyticsApi, ticketApi } from '../lib/api';

const statusBadge: Record<string, string> = {
    open: 'bg-accent-sage/20 text-accent-sage', 
    in_progress: 'bg-accent-indigo/20 text-accent-indigo', 
    pending: 'bg-accent-lavender/20 text-accent-lavender',
    resolved: 'bg-accent-emerald/20 text-accent-emerald', 
    closed: 'bg-muted text-muted-foreground',
};
const priorityDot: Record<string, string> = {
    low: 'bg-accent-sage', medium: 'bg-accent-lavender', high: 'bg-orange-500', urgent: 'bg-accent-rose',
};

function Skeleton({ className }: { className: string }) {
    return <div className={`animate-pulse bg-muted rounded-xl ${className}`} />;
}

function AnimatedCounter({ value }: { value: number }) {
    const [count, setCount] = useState(0);
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) {
            setCount(end);
            return;
        }
        
        let startTime: number | null = null;
        const duration = 1800; // 1.8s
        
        const easeOutExpo = (x: number): number => {
            return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        };

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percent = Math.min(progress / duration, 1);
            
            setCount(Math.floor(end * easeOutExpo(percent)));
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            } else {
                setCount(end);
                setIsPulsing(true);
                setTimeout(() => setIsPulsing(false), 400);
            }
        };
        
        window.requestAnimationFrame(step);
    }, [value]);

    return (
        <span className={`inline-block ${isPulsing ? 'animate-countPulse text-primary' : ''} transition-colors duration-300`}>
            {count.toLocaleString()}
        </span>
    );
}

function SystemMonitoring() {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const terminalLogs = [
            "SYSTEM_BOOT: Initializing core protocols...",
            "NETWORK: Establishing secure WSS connection... [OK]",
            "KAFKA: Connected to topic 'ticket-events'...",
            "REDIS: Cache warm-up complete. Hit rate 98.4%",
            "AI_SERVICE: Gemini 2.0 readiness confirmed.",
            "ROUTER: Traffic normalized. Latency: 42ms."
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < terminalLogs.length) {
                setLogs(prev => [...prev, terminalLogs[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full mt-4">
            {/* Hardware Pulse */}
            <div className="flex flex-col justify-center gap-6">
                <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                        <span>CPU Load</span>
                        <span className="text-accent-sage">24%</span>
                    </div>
                    <div className="h-3 progress-track rounded-full">
                        <div className="progress-fill" style={{ width: '24%' }} />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                        <span>Memory Usage</span>
                        <span className="text-accent-lavender">6.1 / 16 GB</span>
                    </div>
                    <div className="h-3 progress-track rounded-full">
                        <div className="progress-fill" style={{ width: '38%', background: 'linear-gradient(90deg, var(--accent-lavender), var(--accent-rose))' }} />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                        <span>Database I/O</span>
                        <span className="text-accent-emerald">Optimal</span>
                    </div>
                    <div className="h-3 progress-track rounded-full">
                        <div className="progress-fill" style={{ width: '85%', background: 'linear-gradient(90deg, var(--accent-emerald), var(--accent-sage))' }} />
                    </div>
                </div>
            </div>

            {/* Terminal Mockup */}
            <div className="nm-inset p-4 font-mono text-xs overflow-hidden flex flex-col justify-end relative h-48 rounded-[20px]">
                <div className="absolute top-3 right-3 flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-rose" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-sage" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald" />
                </div>
                <div className="flex flex-col gap-1.5 opacity-90 text-foreground pt-6">
                    {logs.map((log, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 0.8, x: 0 }}>
                            <span className="text-accent-emerald mr-2">➜</span>
                            {log}
                        </motion.div>
                    ))}
                    {logs.length >= 6 && (
                        <div className="mt-1">
                            <span className="text-accent-emerald mr-2">➜</span>
                            <span className="animate-blink">▋</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
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

    const { data: recentTicketsData, isLoading: ticketsLoading } = useQuery({
        queryKey: ['recent-tickets'],
        queryFn: () => ticketApi.getAll({ size: '5', sort: 'createdAt,desc' }).then(r => r.data),
        retry: 1,
    });

    const m = metrics || {};
    const agents = agentData?.content || agentData || [];
    const trendPoints = trendsData?.content || trendsData || [];
    const recentTickets = recentTicketsData?.content || recentTicketsData || [];

    const cards = [
        { label: 'Total Tickets', value: m.totalTickets ?? 0, icon: Ticket, color: 'text-primary', change: m.totalTicketsChange ?? '—', up: true, nav: '/tickets' },
        { label: 'Open Tickets', value: m.openTickets ?? 0, icon: Clock, color: 'text-accent-sage', change: m.openTicketsChange ?? '—', up: false, nav: '/tickets' },
        { label: 'Resolved', value: m.resolvedTickets ?? 0, icon: CheckCircle2, color: 'text-accent-emerald', change: m.resolvedChange ?? '—', up: true, nav: '/tickets' },
        { label: 'Urgent', value: m.urgentTickets ?? 0, icon: AlertTriangle, color: 'text-accent-rose', change: m.urgentChange ?? '—', up: false, nav: '/tickets' },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Stat Cards Grid (4-column) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="nm-flat p-6 cursor-pointer group flex flex-col bg-background/50 relative overflow-hidden" onClick={() => navigate(card.nav)}>
                            <div className="flex items-start justify-between z-10">
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground mb-2">{card.label}</p>
                                    <p className="text-4xl font-extrabold tracking-tight">
                                        {metricsLoading ? <Skeleton className="h-10 w-24" /> : <AnimatedCounter value={card.value} />}
                                    </p>
                                    <div className={`flex items-center gap-1 mt-4 text-xs font-bold ${card.up ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                                        {card.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                        {String(card.change)} this month
                                    </div>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl nm-inset flex items-center justify-center animate-float ${card.color}`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center gap-4">
                <button onClick={() => navigate('/tickets')} className="nm-button flex items-center gap-2 px-6 py-3 font-bold text-sm text-primary group">
                    <Ticket className="w-4 h-4" /> New Ticket
                </button>
                <button className="nm-button flex items-center gap-2 px-6 py-3 font-bold text-sm text-accent-emerald group">
                    <Users className="w-4 h-4" /> Users List
                </button>
                <button onClick={() => navigate('/analytics')} className="nm-button flex items-center gap-2 px-6 py-3 font-bold text-sm text-accent-indigo group">
                    <BarChart3 className="w-4 h-4" /> Generate Report
                </button>
                <button onClick={() => navigate('/settings')} className="nm-button flex items-center gap-2 px-6 py-3 font-bold text-sm text-accent-rose group">
                    <Settings className="w-4 h-4" /> System Settings
                </button>
            </div>

            {/* System Monitoring & Recent Tickets */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* System Monitoring */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-3 nm-flat p-6 rounded-[24px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-primary">
                            <Zap className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold">System Pulse</h3>
                    </div>
                    <SystemMonitoring />
                </motion.div>
                
                {/* Recent Activity */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="lg:col-span-2 nm-flat p-6 rounded-[24px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Recent Activity</h3>
                        <button onClick={() => navigate('/tickets')} className="nm-button w-8 h-8 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                    {ticketsLoading ? (
                        <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
                    ) : recentTickets.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No tickets yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentTickets.slice(0, 4).map((ticket: any) => (
                                <div key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    className="flex items-center gap-4 p-4 rounded-2xl nm-inset cursor-pointer transition-all hover:bg-background/80">
                                    <div className={`w-3 h-3 rounded-full ${priorityDot[ticket.priority?.toLowerCase()] || 'bg-muted'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate text-foreground">{ticket.subject}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge[ticket.status?.toLowerCase()] || 'bg-muted'}`}>
                                        {(ticket.status || '').replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Charts & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Ticket Trends */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="lg:col-span-3 nm-flat p-6 rounded-[24px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Ticket Trends</h3>
                        <div className="flex gap-2 nm-inset p-1 rounded-full">
                            {['7d', '14d', '30d'].map((p) => (
                                <button key={p} onClick={() => setTrendPeriod(p)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${trendPeriod === p ? 'nm-flat text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    {trendsLoading ? <Skeleton className="h-[280px] w-full" /> : (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trendPoints}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={v => String(v).slice(5)} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip contentStyle={{ background: 'var(--nm-bg)', border: 'none', borderRadius: '16px', boxShadow: '6px 6px 12px var(--nm-shadow), -6px -6px 12px var(--nm-highlight)', fontSize: '13px', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="total" stroke="var(--primary)" fill="url(#colorTotal)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Agent Leaderboard */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    className="lg:col-span-2 nm-flat p-6 rounded-[24px]">
                    <h3 className="text-lg font-bold flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-accent-emerald">
                            <Users className="w-4 h-4" />
                        </div>
                        Agent Leaderboard
                    </h3>
                    {agentsLoading ? (
                        <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
                    ) : agents.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No agent data yet</p>
                    ) : (
                        <div className="space-y-4">
                            {agents.slice(0, 4).map((agent: any, i: number) => (
                                <div key={agent.id || i} className="flex items-center gap-4 p-4 rounded-2xl nm-inset group cursor-pointer"
                                    onClick={() => navigate('/analytics')}>
                                    
                                    <div className="w-10 h-10 rounded-full nm-flat flex items-center justify-center text-xs font-extrabold text-primary">
                                        #{i + 1}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <p className="font-bold text-sm tracking-tight">{agent.name || agent.agentName}</p>
                                        <p className="text-xs font-semibold text-accent-sage mt-0.5">{agent.ticketsResolved ?? agent.resolvedCount ?? 0} resolved</p>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="px-3 py-1.5 rounded-full nm-flat text-xs font-extrabold flex items-center gap-1">
                                            <span className="text-accent-emerald">★</span>
                                            {(agent.avgCsat ?? agent.avgSatisfaction ?? 0).toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
