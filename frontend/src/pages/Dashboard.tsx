import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Ticket, Clock, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown,
    Users, Zap, ArrowUpRight, BarChart3
} from 'lucide-react';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const mockMetrics = {
    totalTickets: 1247, openTickets: 89, resolvedTickets: 1098, urgentTickets: 7,
    avgResolutionTimeHours: 12.5, avgCustomerSatisfaction: 4.3,
    inProgressTickets: 34, slaBreachCount: 23,
};

function generateTrends(days: number) {
    return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0],
        total: Math.floor(Math.random() * 20 + 10),
        resolved: Math.floor(Math.random() * 15 + 5),
    }));
}

const mockCategories = [
    { category: 'Technical', count: 420, color: '#171e19' },
    { category: 'Billing', count: 280, color: '#b7c6c2' },
    { category: 'Bug Report', count: 210, color: '#ffe17c' },
    { category: 'Feature Req', count: 180, color: '#272727' },
    { category: 'General', count: 157, color: '#000000' },
];

const mockAgents = [
    { id: '1', name: 'Mike Johnson', ticketsResolved: 156, avgCsat: 4.8, avgResolutionHours: 8.2 },
    { id: '2', name: 'Emily Davis', ticketsResolved: 143, avgCsat: 4.6, avgResolutionHours: 10.5 },
    { id: '3', name: 'Alex Rivera', ticketsResolved: 128, avgCsat: 4.5, avgResolutionHours: 11.3 },
    { id: '4', name: 'Jane Smith', ticketsResolved: 98, avgCsat: 4.7, avgResolutionHours: 9.1 },
    { id: '5', name: 'David Brown', ticketsResolved: 87, avgCsat: 4.4, avgResolutionHours: 13.6 },
];

const recentTickets = [
    { id: '1', subject: 'Cannot login to dashboard', status: 'open', priority: 'high', created: '2 min ago' },
    { id: '2', subject: 'Billing discrepancy', status: 'in_progress', priority: 'medium', created: '15 min ago' },
    { id: '3', subject: 'API rate limit exceeded', status: 'open', priority: 'urgent', created: '1 hr ago' },
    { id: '4', subject: 'Feature: Dark mode', status: 'pending', priority: 'low', created: '3 hrs ago' },
    { id: '5', subject: 'App crashes on upload', status: 'resolved', priority: 'high', created: '5 hrs ago' },
];

function AnimatedCounter({ value }: { value: number }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let c = 0; const inc = value / 30;
        const t = setInterval(() => { c += inc; if (c >= value) { setCount(value); clearInterval(t); } else setCount(Math.floor(c)); }, 50);
        return () => clearInterval(t);
    }, [value]);
    return <>{count.toLocaleString()}</>;
}

const statusBadge: Record<string, string> = {
    open: 'bg-white', in_progress: 'bg-nb-yellow', pending: 'bg-nb-sage', resolved: 'bg-nb-charcoal text-white', closed: 'bg-gray-200',
};

const priorityDot: Record<string, string> = {
    low: 'bg-nb-sage', medium: 'bg-nb-yellow', high: 'bg-orange-500', urgent: 'bg-red-500',
};

const periodDays: Record<string, number> = { '7d': 7, '14d': 14, '30d': 30 };

export default function Dashboard() {
    const navigate = useNavigate();
    const [trendPeriod, setTrendPeriod] = useState('30d');
    const [trendData, setTrendData] = useState(() => generateTrends(30));

    const handlePeriodChange = (p: string) => {
        setTrendPeriod(p);
        setTrendData(generateTrends(periodDays[p]));
    };

    const cards = [
        { label: 'Total Tickets', value: mockMetrics.totalTickets, icon: Ticket, bg: 'bg-white', change: '+12%', up: true, nav: '/tickets' },
        { label: 'Open Tickets', value: mockMetrics.openTickets, icon: Clock, bg: 'bg-nb-sage', change: '-5%', up: false, nav: '/tickets' },
        { label: 'Resolved', value: mockMetrics.resolvedTickets, icon: CheckCircle2, bg: 'bg-nb-yellow', change: '+18%', up: true, nav: '/tickets' },
        { label: 'Urgent', value: mockMetrics.urgentTickets, icon: AlertTriangle, bg: 'bg-nb-charcoal text-white', change: '-2', up: false, nav: '/tickets' },
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
                                        <AnimatedCounter value={card.value} />
                                    </p>
                                    <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${card.up ? 'text-green-700' : 'text-red-600'}`}>
                                        {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {card.change} this month
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
                {/* Trends */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-2 nb-card-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading text-lg font-extrabold tracking-tight">Ticket Trends</h3>
                        <div className="flex gap-1">
                            {['7d', '14d', '30d'].map((p) => (
                                <button key={p} onClick={() => handlePeriodChange(p)}
                                    className={`px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-black transition-all ${trendPeriod === p ? 'bg-nb-charcoal text-white shadow-nb-sm' : 'bg-white hover:bg-nb-yellow'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} tickFormatter={v => v.slice(5)} />
                            <YAxis tick={{ fontSize: 10, fontFamily: 'Space Grotesk' }} />
                            <Tooltip contentStyle={{ background: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0px #000', fontFamily: 'Space Grotesk', fontSize: '12px' }} />
                            <Area type="stepAfter" dataKey="total" stroke="#171e19" fill="#ffe17c" strokeWidth={2} />
                            <Area type="stepAfter" dataKey="resolved" stroke="#b7c6c2" fill="#b7c6c2" strokeWidth={2} fillOpacity={0.4} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Categories */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="nb-card-lg p-6">
                    <h3 className="font-heading text-lg font-extrabold tracking-tight mb-4">Categories</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={mockCategories} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="count" stroke="#000" strokeWidth={2}>
                                {mockCategories.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#fff', border: '2px solid #000', borderRadius: '12px', boxShadow: '4px 4px 0px #000', fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                        {mockCategories.map((cat) => (
                            <div key={cat.category} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-black rounded-sm" style={{ background: cat.color }} />
                                    <span className="font-body font-medium">{cat.category}</span>
                                </div>
                                <span className="font-heading font-bold">{cat.count}</span>
                            </div>
                        ))}
                    </div>
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
                    <div className="space-y-2">
                        {mockAgents.map((agent, i) => (
                            <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-black bg-white hover:bg-nb-yellow transition-colors shadow-nb-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer"
                                onClick={() => navigate('/analytics')}>
                                <div className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-heading font-extrabold ${i === 0 ? 'bg-nb-yellow' : i === 1 ? 'bg-nb-sage' : i === 2 ? 'bg-orange-200' : 'bg-white'}`}>
                                    {i + 1}
                                </div>
                                <div className="w-9 h-9 rounded-lg bg-nb-charcoal border-2 border-black flex items-center justify-center text-nb-yellow text-xs font-bold">
                                    {agent.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-heading font-bold">{agent.name}</p>
                                    <p className="text-xs font-body text-muted-foreground">{agent.ticketsResolved} resolved</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-heading font-extrabold">★ {agent.avgCsat}</p>
                                    <p className="text-xs font-body text-muted-foreground">{agent.avgResolutionHours}h avg</p>
                                </div>
                            </div>
                        ))}
                    </div>
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
                    <div className="space-y-2">
                        {recentTickets.map((ticket) => (
                            <div key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)}
                                className="flex items-center gap-3 p-3 rounded-xl border-2 border-black bg-white hover:bg-nb-sage/30 transition-all cursor-pointer group shadow-nb-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                                <div className={`w-3 h-3 rounded-full border-2 border-black ${priorityDot[ticket.priority]}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-heading font-bold truncate group-hover:text-nb-charcoal">{ticket.subject}</p>
                                    <p className="text-xs font-body text-muted-foreground">{ticket.created}</p>
                                </div>
                                <span className={`nb-badge text-[10px] ${statusBadge[ticket.status]}`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Avg Resolution', value: `${mockMetrics.avgResolutionTimeHours}h`, icon: Clock, nav: '/analytics' },
                    { label: 'CSAT Score', value: `${mockMetrics.avgCustomerSatisfaction}/5`, icon: BarChart3, nav: '/analytics' },
                    { label: 'SLA Breaches', value: String(mockMetrics.slaBreachCount), icon: AlertTriangle, nav: '/analytics' },
                    { label: 'In Progress', value: String(mockMetrics.inProgressTickets), icon: TrendingUp, nav: '/tickets' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.05 }}>
                        <div className="nb-card p-4 flex items-center gap-3 cursor-pointer" onClick={() => navigate(stat.nav)}>
                            <div className="nb-icon-box w-10 h-10">
                                <stat.icon className="w-4 h-4" />
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
