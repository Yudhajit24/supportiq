import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { authApi } from '../lib/api';
import { Zap, Eye, EyeOff, ArrowRight, Star } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ fullName: '', email: 'admin@techcorp.com', password: 'password123' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let response: any;
            if (isLogin) {
                response = (await authApi.login(form.email, form.password)).data;
            } else {
                response = (await authApi.register({ fullName: form.fullName, email: form.email, password: form.password })).data;
            }
            login(response.token, { id: response.userId, email: response.email, fullName: response.fullName, role: response.role, organizationId: '' });
            navigate('/');
        } catch (err: any) {
            if (err?.response?.status === 401) {
                setError('Invalid credentials');
            } else {
                // Demo fallback
                login('demo-token', { id: 'demo', email: form.email, fullName: 'Demo Admin', role: 'admin', organizationId: 'org-1' });
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-nb-yellow relative overflow-hidden flex">
            <div className="dot-pattern" />

            {/* Left - Hero */}
            <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative z-10">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-nb-charcoal rounded-xl border-2 border-black flex items-center justify-center shadow-nb-sm">
                            <Zap className="w-6 h-6 text-nb-yellow" />
                        </div>
                        <span className="font-heading text-2xl font-extrabold tracking-tighter">SupportIQ</span>
                    </div>

                    {/* Badge */}
                    <div className="nb-badge bg-white mb-6 w-fit">
                        <Star className="w-3 h-3" />
                        NEW: AI-Powered Support 2.0
                    </div>

                    <h1 className="font-heading text-6xl xl:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-6">
                        Customer Support,<br />
                        <span className="text-transparent [-webkit-text-stroke:2px_#000]">Reimagined</span><br />
                        with AI.
                    </h1>

                    <p className="font-body text-lg text-nb-charcoal/70 max-w-md mb-8 font-medium">
                        Intelligent routing, real-time analytics, and AI-powered insights that transform how your team handles support.
                    </p>

                    {/* Social proof */}
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {['MJ', 'ED', 'AR', 'JS'].map((initials, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center text-xs font-bold">
                                    {initials}
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="font-heading font-bold text-sm">2,400+ teams</p>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-nb-charcoal" />)}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Decorative card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-12 right-16 w-72"
                >
                    <div className="nb-card-lg p-4">
                        <div className="bg-nb-charcoal rounded-lg p-3 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-white/50 text-[10px] ml-2 font-mono">dashboard</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="flex-1 bg-nb-sage/40 rounded-lg p-2 border border-black/10">
                                    <p className="text-[9px] font-bold">RESOLVED</p>
                                    <p className="text-lg font-heading font-extrabold">1,098</p>
                                </div>
                                <div className="flex-1 bg-nb-yellow/50 rounded-lg p-2 border border-black/10">
                                    <p className="text-[9px] font-bold">CSAT</p>
                                    <p className="text-lg font-heading font-extrabold">4.8★</p>
                                </div>
                            </div>
                            <div className="h-8 bg-nb-sage/20 rounded-lg border border-black/10 flex items-end gap-0.5 p-1">
                                {[40, 65, 45, 80, 60, 75, 90, 55, 70, 85].map((h, i) => (
                                    <div key={i} className="flex-1 bg-nb-charcoal rounded-sm" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right - Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="nb-card-lg p-8">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-nb-charcoal rounded-xl border-2 border-black flex items-center justify-center shadow-nb-sm">
                                <Zap className="w-5 h-5 text-nb-yellow" />
                            </div>
                            <span className="font-heading text-xl font-extrabold tracking-tighter">SupportIQ</span>
                        </div>

                        <h2 className="font-heading text-3xl font-extrabold tracking-tighter mb-2">
                            {isLogin ? 'Welcome back.' : 'Get started.'}
                        </h2>
                        <p className="text-sm text-muted-foreground font-body mb-8">
                            {isLogin ? 'Sign in to your account' : 'Create a new account'}
                        </p>

                        {error && (
                            <div className="nb-badge bg-red-100 text-red-700 border-red-400 mb-4 w-full justify-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-heading font-bold mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={form.fullName}
                                        onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                                        className="nb-input"
                                        placeholder="John Doe"
                                        required={!isLogin}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-heading font-bold mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="nb-input"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-heading font-bold mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                        className="nb-input pr-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="nb-btn w-full text-center justify-center shadow-nb-lg mt-2">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                <span className="font-bold underline decoration-2 decoration-nb-yellow underline-offset-2">
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </span>
                            </button>
                        </div>

                        <div className="mt-4 p-3 bg-nb-sage/20 border-2 border-dashed border-nb-sage rounded-xl">
                            <p className="text-xs text-center font-body text-muted-foreground">
                                <span className="font-bold">Demo mode:</span> Click Sign In to use demo credentials
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
