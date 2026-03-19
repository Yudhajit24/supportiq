import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Target, Users, Clock, TrendingUp, Check, Loader2 } from 'lucide-react';
import { analyticsApi } from '../lib/api';

const COLORS = ['#2dd4bf', '#818cf8', '#fb7185', '#a78bfa', '#6b7280'];
const tooltipStyle = {
    background: 'var(--nm-bg)',
    border: 'none',
    borderRadius: '16px',
    boxShadow: '6px 6px 12px var(--nm-shadow), -6px -6px 12px var(--nm-highlight)',
    fontSize: '13px',
    fontWeight: 'bold',
    color: 'var(--foreground)'
};

function Skeleton({ className }: { className: string }) {
    return <div className={`animate-pulse bg-muted rounded-xl ${className}`} />;
}

export default function Analytics() {
    const [period, setPeriod] = useState('30d');
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);

    const { data: trendsRaw, isLoading: trendsLoading } = useQuery({
        queryKey: ['ticket-trends', period],
        queryFn: () => analyticsApi.getTicketTrends(period).then(r => r.data),
        retry: 1,
    });

    const { data: agentRaw, isLoading: agentsLoading } = useQuery({
        queryKey: ['agent-performance'],
        queryFn: () => analyticsApi.getAgentPerformance().then(r => r.data),
        retry: 1,
    });

    const { data: categoryRaw, isLoading: categoryLoading } = useQuery({
        queryKey: ['category-distribution'],
        queryFn: () => analyticsApi.getCategoryDistribution().then(r => r.data),
        retry: 1,
    });

    const { data: slaRaw, isLoading: slaLoading } = useQuery({
        queryKey: ['sla-compliance'],
        queryFn: () => analyticsApi.getSlaCompliance().then(r => r.data),
        retry: 1,
    });

    const { data: dashRaw, isLoading: dashLoading } = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: () => analyticsApi.getDashboard().then(r => r.data),
        retry: 1,
    });

    const trendData = trendsRaw?.content || trendsRaw || [];
    const agentData = (agentRaw?.content || agentRaw || []).map((a: any) => ({
        name: (a.name || a.agentName || 'Agent').split(' ').map((n: string, i: number) => i === 0 ? n : n[0] + '.').join(' '),
        resolved: a.ticketsResolved ?? a.resolvedCount ?? 0,
    }));
    const categoryData = (categoryRaw || []).map((c: any, i: number) => ({
        name: c.category || c.name,
        value: c.count ?? c.value ?? 0,
        fill: COLORS[i % COLORS.length],
    }));
    const slaData = (slaRaw || []).map((s: any) => ({
        priority: s.priority,
        compliance: s.complianceRate ?? s.compliance ?? 0,
    }));
    const dash = dashRaw || {};

    const resolutionRate = dash.totalTickets > 0
        ? Math.round((dash.resolvedTickets / dash.totalTickets) * 100)
        : 0;

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => {
            const rows = ['Date,Created,Resolved', ...trendData.map((d: any) =>
                `${d.date},${d.total ?? d.created ?? 0},${d.resolved ?? 0}`)];
            const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            setExporting(false);
            setExported(true);
            setTimeout(() => setExported(false), 2000);
        }, 400);
    };

    const kpis = [
        { label: 'Resolution Rate', value: dashLoading ? '…' : `${resolutionRate}%`, icon: Target, color: 'text-primary' },
        { label: 'Avg Resolution', value: dashLoading ? '…' : `${(dash.avgResolutionTimeHours ?? 0).toFixed(1)}h`, icon: Clock, color: 'text-accent-sage' },
        { label: 'Avg CSAT', value: dashLoading ? '…' : `${(dash.avgCustomerSatisfaction ?? 0).toFixed(1)}/5`, icon: TrendingUp, color: 'text-accent-emerald' },
        { label: 'Total Agents', value: dashLoading ? '…' : String(agentData.length || 0), icon: Users, color: 'text-accent-indigo' },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Analytics</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Support performance overview</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2 nm-inset p-1.5 rounded-full">
                        {['7d', '14d', '30d', '90d'].map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${period === p ? 'nm-flat text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExport} disabled={exporting || trendData.length === 0}
                        className="nm-button flex items-center gap-2 px-6 py-3 font-bold text-sm text-foreground disabled:opacity-50 h-[42px]">
                        {exported ? <><Check className="w-4 h-4 text-accent-emerald" /> Exported!</> : exporting ? <><Loader2 className="w-4 h-4 animate-spin text-primary" /> Exporting…</> : <><Download className="w-4 h-4" /> Export</>}
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="nm-flat p-6 rounded-[24px] group flex flex-col h-full bg-background/50">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-2xl nm-inset flex items-center justify-center animate-float ${kpi.color}`}>
                                    {dashLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <kpi.icon className="w-5 h-5" />}
                                </div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                            </div>
                            <p className="text-4xl font-extrabold tracking-tight mt-auto">{kpi.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nm-flat p-8 rounded-[32px]">
                    <h3 className="text-lg font-extrabold mb-8">Ticket Volume</h3>
                    {trendsLoading ? <Skeleton className="h-[280px]" /> : trendData.length === 0 ? (
                        <div className="h-[280px] flex items-center justify-center text-sm font-medium text-muted-foreground">No trend data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-sage)" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="var(--accent-sage)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={v => String(v).slice(5)} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Area type="monotone" dataKey="total" name="Created" stroke="var(--primary)" fill="url(#colorTotal)" strokeWidth={3} />
                                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="var(--accent-sage)" fill="url(#colorResolved)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nm-flat p-8 rounded-[32px]">
                    <h3 className="text-lg font-extrabold mb-8">SLA Compliance</h3>
                    {slaLoading ? <Skeleton className="h-[280px]" /> : slaData.length === 0 ? (
                        <div className="h-[280px] flex items-center justify-center text-sm font-medium text-muted-foreground">No SLA data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={slaData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="priority" tick={{ fontSize: 11, fill: 'var(--muted-foreground)', textTransform: 'uppercase' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} domain={[0, 100]} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="compliance" name="Compliance %" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="nm-flat p-8 rounded-[32px]">
                    <h3 className="text-lg font-extrabold mb-8">Category Split</h3>
                    {categoryLoading ? <Skeleton className="h-[260px]" /> : categoryData.length === 0 ? (
                        <div className="h-[260px] flex items-center justify-center text-sm font-medium text-muted-foreground">No category data yet</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="var(--nm-bg)" strokeWidth={4}>
                                        {categoryData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3 mt-6">
                                {categoryData.map((c: any, i: number) => (
                                    <div key={c.name} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="font-semibold text-muted-foreground">{c.name}</span>
                                        </div>
                                        <span className="font-extrabold">{c.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2 nm-flat p-8 rounded-[32px]">
                    <h3 className="text-lg font-extrabold mb-8">Agent Performance</h3>
                    {agentsLoading ? <Skeleton className="h-[280px]" /> : agentData.length === 0 ? (
                        <div className="h-[280px] flex items-center justify-center text-sm font-medium text-muted-foreground">No agent data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={agentData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={80} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="resolved" name="Resolved" fill="var(--accent-indigo)" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </div>
        </div>
    );
}