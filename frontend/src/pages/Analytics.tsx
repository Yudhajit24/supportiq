import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Target, Users, Clock, TrendingUp, Check } from 'lucide-react';

function generateTrends(days: number) {
    return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0].slice(5),
        created: Math.floor(Math.random() * 20 + 8),
        resolved: Math.floor(Math.random() * 18 + 5),
    }));
}

const categoryData = [
    { name: 'Technical', value: 420, fill: '#171e19' },
    { name: 'Billing', value: 280, fill: '#b7c6c2' },
    { name: 'Bug Report', value: 210, fill: '#ffe17c' },
    { name: 'Feature Req', value: 180, fill: '#272727' },
    { name: 'General', value: 157, fill: '#000000' },
];

const slaData = [
    { priority: 'Urgent', compliance: 82 },
    { priority: 'High', compliance: 91 },
    { priority: 'Medium', compliance: 95 },
    { priority: 'Low', compliance: 98 },
];

const agentPerf = [
    { name: 'Mike J.', resolved: 156 },
    { name: 'Emily D.', resolved: 143 },
    { name: 'Alex R.', resolved: 128 },
    { name: 'Jane S.', resolved: 98 },
    { name: 'David B.', resolved: 87 },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    tickets: Math.floor(Math.random() * 15 + (i >= 9 && i <= 17 ? 10 : 2)),
}));

const tooltipStyle = { background: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0px #000', fontFamily: 'Space Grotesk', fontSize: '12px' };
const periodDays: Record<string, number> = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 };

export default function Analytics() {
    const [period, setPeriod] = useState('30d');
    const [trendData, setTrendData] = useState(() => generateTrends(30));
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);

    const handlePeriodChange = (p: string) => {
        setPeriod(p);
        setTrendData(generateTrends(periodDays[p]));
    };

    const handleExport = () => {
        setExporting(true);
        // Simulate CSV generation
        setTimeout(() => {
            const csvContent = [
                'Date,Created,Resolved',
                ...trendData.map(d => `${d.date},${d.created},${d.resolved}`)
            ].join('\n');
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
        }, 500);
    };

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
                            <button key={p} onClick={() => handlePeriodChange(p)}
                                className={`px-4 py-1.5 text-xs font-heading font-bold rounded-lg border-2 border-black transition-all ${period === p ? 'bg-nb-charcoal text-white shadow-nb-sm' : 'bg-white hover:bg-nb-yellow'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExport} disabled={exporting}
                        className="nb-btn nb-btn-white nb-btn-sm disabled:opacity-50">
                        {exported ? <><Check className="w-4 h-4" /> Exported!</> : exporting ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Exporting...</> : <><Download className="w-4 h-4" /> Export</>}
                    </button>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Resolution Rate', value: '87.5%', change: '+3.2%', icon: Target, bg: 'bg-white' },
                    { label: 'Avg Response', value: '14 min', change: '-2 min', icon: Clock, bg: 'bg-nb-sage' },
                    { label: 'Avg CSAT', value: '4.5/5', change: '+0.2', icon: TrendingUp, bg: 'bg-nb-yellow' },
                    { label: 'Active Agents', value: '8', change: '+1', icon: Users, bg: 'bg-nb-charcoal text-white' },
                ].map((kpi, i) => (
                    <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className={`nb-card p-5 ${kpi.bg}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <kpi.icon className="w-4 h-4" />
                                <span className="text-xs font-heading font-bold opacity-60">{kpi.label}</span>
                            </div>
                            <p className="text-3xl font-heading font-extrabold tracking-tighter">{kpi.value}</p>
                            <p className="text-xs font-heading font-bold text-green-700 mt-1">{kpi.change} vs last period</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nb-card-lg p-6">
                    <h3 className="font-heading font-extrabold mb-4">Ticket Volume</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} />
                            <YAxis tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="stepAfter" dataKey="created" name="Created" stroke="#171e19" fill="#ffe17c" strokeWidth={2} />
                            <Area type="stepAfter" dataKey="resolved" name="Resolved" stroke="#b7c6c2" fill="#b7c6c2" strokeWidth={2} fillOpacity={0.4} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nb-card-lg p-6">
                    <h3 className="font-heading font-extrabold mb-4">SLA Compliance</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={slaData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="priority" tick={{ fontSize: 11, fontFamily: 'Space Grotesk' }} />
                            <YAxis tick={{ fontSize: 11, fontFamily: 'Space Grotesk' }} domain={[0, 100]} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="compliance" name="Compliance %" fill="#ffe17c" stroke="#000" strokeWidth={2} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="nb-card-lg p-6">
                    <h3 className="font-heading font-extrabold mb-4">Category Split</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="#000" strokeWidth={2}>
                                {categoryData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                        {categoryData.map(c => (
                            <div key={c.name} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm border-2 border-black" style={{ background: c.fill }} />
                                    <span className="font-body font-medium">{c.name}</span>
                                </div>
                                <span className="font-heading font-bold">{c.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2 nb-card-lg p-6">
                    <h3 className="font-heading font-extrabold mb-4">Agent Performance</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={agentPerf} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'Space Grotesk' }} width={60} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="resolved" name="Resolved" fill="#171e19" stroke="#000" strokeWidth={2} radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Hourly */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="nb-card-lg p-6">
                <h3 className="font-heading font-extrabold mb-4">Hourly Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="hour" tick={{ fontSize: 9, fontFamily: 'Space Grotesk' }} />
                        <YAxis tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="tickets" fill="#b7c6c2" stroke="#000" strokeWidth={2} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
}
