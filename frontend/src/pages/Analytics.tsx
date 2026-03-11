import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Target, Users, Clock, TrendingUp, Check, Loader2 } from 'lucide-react';
import { analyticsApi } from '../lib/api';

const COLORS = ['#171e19', '#b7c6c2', '#ffe17c', '#272727', '#6b7280'];
const tooltipStyle = { background: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0px #000', fontFamily: 'Space Grotesk', fontSize: '12px' };

function Skeleton({ className }: { className: string }) {
    return <div className={`animate-pulse bg-black/10 rounded-lg ${className}`} />;
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

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => {
            const csvContent = ['Date,Created,Resolved', ...trendData.map((d: any) => `${d.date},${d.total ?? d.created ?? 0},${d.resolved ?? 0}`)].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
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
        { label: 'Resolution Rate', value: dashLoading ? '…' : `${dash.resolutionRate ?? 0}%`, icon: Target, bg: 'bg-white' },
        { label: 'Avg Resolution', value: dashLoading ? '…' : `${dash.avgResolutionTimeHours ?? 0}h`, icon: Clock, bg: 'bg-nb-sage' },
        { label: 'Avg CSAT', value: dashLoading ? '…' : `${dash.avgCustomerSatisfaction ?? 0}/5`, icon: TrendingUp, bg: 'bg-nb-yellow' },
        { label: 'Total Agents', value: dashLoading ? '…' : String(agentData.length || 0), icon: Users, bg: 'bg-nb-charcoal text-white' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-heading text-3xl font-extrabold tracking-tighter">Analytics</h2>
                    <p className="text-sm font-body text-muted-foreground">Support performance overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        {['7d', '14d', '30d', '90d'].map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-4 py-1.5 text-xs font-heading font-bold rounded-lg border-2 border-black transition-all ${period === p ? 'bg-nb-charcoal text-white shadow-nb-sm' : 'bg-white hover:bg-nb-yellow'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExport} disabled={exporting || trendData.length === 0}
                        className="nb-btn nb-btn-white nb-btn-sm disabled:opacity-50">
                        {exported ? <><Check className="w-4 h-4" /> Exported!</> : exporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</> : <><Download className="w-4 h-4" /> Export</>}
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className={`nb-card p-5 ${kpi.bg}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {dashLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <kpi.icon className="w-4 h-4" />}
                                <span className="text-xs font-heading font-bold opacity-60">{kpi.label}</span>
                            </div>
                            <p className="text-3xl font-heading font-extrabold tracking-tighter">{kpi.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nb-card-lg p-6">
                    <h3 className="font-heading font-extrabold mb-4">Ticket Volume</h3>
                    {trendsLoading ? <Skeleton className="h-[280px]" /> : trendData.length === 0 ? (
                        <div className="h-[280px] flex items-center justify-center text-sm font-body text-muted-foreground">No trend data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} tickFormatter={v => String(v).slice(5)} />
                                <YAxis tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Area type="stepAfter" dataKey="total" name="Created" stroke="#171e19" fill="#ffe17c" strokeWidth={2} />
                                <Area type="stepAfter" dataKey="resolved" name="Resolved" stroke="#b7c6c2" fill="#b7c6c2" strokeWidth={2} fillOpacity={0.4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nb-card-lg p-6">
                    <h3 className="font-heading font-extrabold mb-4">SLA Compliance</h3>
                    {slaLoading ? <Skeleton className="h-[280px]" /> : slaData.length === 0 ? (
                        <div className="h-[280px] flex items-center justify-center text-sm font-body text-muted-foreground">No SLA data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={slaData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="priority" tick={{ fontSize: 11, fontFamily: 'Space Grotesk' }} />
                                <YAxis tick={{ fontSize: 11, fontFamily: 'Space Grotesk' }} domain={[0, 100]} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="compliance" name="Compliance %" fill="#ffe17c" stroke="#000" strokeWidth={2} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="nb-card-lg p-6">
                    <h3 className="font-heading font-extrabold mb-4">Category Split</h3>
                    {categoryLoading ? <Skeleton className="h-[260px]" /> : categoryData.length === 0 ? (
                        <div className="h-[260px] flex items-center justify-center text-sm font-body text-muted-foreground">No category data yet</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="#000" strokeWidth={2}>
                                        {categoryData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {categoryData.map((c: any, i: number) => (
                                    <div key={c.name} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm border-2 border-black" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="font-body font-medium">{c.name}</span>
                                        </div>
                                        <span className="font-heading font-bold">{c.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2 nb-card-lg p-6">
                    <h3 className="font-heading font-extrabold mb-4">Agent Performance</h3>
                    {agentsLoading ? <Skeleton className="h-[280px]" /> : agentData.length === 0 ? (
                        <div className="h-[280px] flex items-center justify-center text-sm font-body text-muted-foreground">No agent data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={agentData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'Space Grotesk' }} width={70} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="resolved" name="Resolved" fill="#171e19" stroke="#000" strokeWidth={2} radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
