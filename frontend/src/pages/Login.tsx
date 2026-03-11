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
        <div className="min-h-screen relative overflow-hidden flex" style={{ background: 'var(--cream)' }}>
            <div className="dot-pattern" />

            {/* Left - Hero */}
            <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative z-10 border-r"
                style={{ borderColor: 'rgba(163,177,138,0.3)', background: 'linear-gradient(135deg, var(--cream) 0%, var(--olive) 100%)' }}>
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-nb-md"
                            style={{ background: 'var(--forest)' }}>
                            <Zap className="w-6 h-6" style={{ color: 'var(--sage)' }} />
                        </div>
                        <span className="font-heading text-2xl font-bold tracking-tight" style={{ color: 'var(--forest)' }}>SupportIQ</span>
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-body font-bold shadow-sm mb-6 border"
                        style={{ borderColor: 'rgba(163,177,138,0.5)', color: 'var(--forest)' }}>
                        <Star className="w-3.5 h-3.5 fill-nb-sage text-nb-sage" />
                        NEW: AI-Powered Support 2.0
                    </div>

                    <h1 className="font-heading text-6xl xl:text-7xl font-bold tracking-tight leading-[0.95] mb-6" style={{ color: 'var(--forest)' }}>
                        Customer Support,<br />
                        <span style={{ color: 'var(--sage)' }}>Reimagined</span><br />
                        with AI.
                    </h1>

                    <p className="font-body text-lg max-w-md mb-8 font-medium leading-relaxed" style={{ color: 'rgba(1,71,46,0.7)' }}>
                        Intelligent routing, real-time analytics, and AI-powered insights that transform how your team handles support.
                    </p>

                    {/* Social proof */}
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {['MJ', 'ED', 'AR', 'JS'].map((initials, i) => (
                                <div key={i} className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-xs font-bold shadow-sm border-2"
                                    style={{ borderColor: 'var(--cream)', color: 'var(--forest)' }}>
                                    {initials}
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="font-body font-bold text-sm" style={{ color: 'var(--forest)' }}>2,400+ teams</p>
                            <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-nb-charcoal text-nb-charcoal" />)}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Decorative card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-12 right-16 w-72"
                >
                    <div className="nb-card-lg p-5">
                        <div className="rounded-xl p-3 mb-4 flex items-center gap-2" style={{ background: 'var(--forest)' }}>
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            <span className="text-white/50 text-[10px] ml-2 font-mono uppercase tracking-wider">dashboard</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-1 rounded-xl p-3" style={{ background: 'var(--olive)' }}>
                                    <p className="text-[10px] font-bold tracking-wider" style={{ color: 'rgba(1,71,46,0.6)' }}>RESOLVED</p>
                                    <p className="text-xl font-heading font-bold" style={{ color: 'var(--forest)' }}>1,098</p>
                                </div>
                                <div className="flex-1 rounded-xl p-3" style={{ background: 'var(--sage)' }}>
                                    <p className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--forest)' }}>CSAT</p>
                                    <p className="text-xl font-heading font-bold" style={{ color: 'var(--forest)' }}>4.8★</p>
                                </div>
                            </div>
                            <div className="h-10 rounded-xl flex items-end gap-1 p-1.5" style={{ background: 'rgba(163,177,138,0.2)' }}>
                                {[40, 65, 45, 80, 60, 75, 90, 55, 70, 85].map((h, i) => (
                                    <div key={i} className="flex-1 rounded shadow-sm" style={{ height: `${h}%`, background: 'var(--forest)' }} />
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
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md"
                >
                    <div className="nb-card-lg p-8 sm:p-10">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-nb-sm"
                                style={{ background: 'var(--forest)' }}>
                                <Zap className="w-5 h-5 text-nb-sage" />
                            </div>
                            <span className="font-heading text-xl font-bold tracking-tight" style={{ color: 'var(--forest)' }}>SupportIQ</span>
                        </div>

                        <h2 className="font-heading text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--forest)' }}>
                            {isLogin ? 'Welcome back.' : 'Get started.'}
                        </h2>
                        <p className="text-sm font-body mb-8" style={{ color: 'rgba(1,71,46,0.6)' }}>
                            {isLogin ? 'Sign in to your account' : 'Create a new account'}
                        </p>

                        {error && (
                            <div className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium mb-6 border border-red-100 flex items-center justify-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-body font-semibold mb-1.5" style={{ color: 'var(--forest)' }}>Full Name</label>
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
                                <label className="block text-sm font-body font-semibold mb-1.5" style={{ color: 'var(--forest)' }}>Email</label>
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
                                <label className="block text-sm font-body font-semibold mb-1.5" style={{ color: 'var(--forest)' }}>Password</label>
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-nb-charcoal"
                                        style={{ color: 'rgba(1,71,46,0.4)' }}>
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="nb-btn w-full text-center justify-center mt-6">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-sm font-body font-medium transition-colors hover:text-nb-charcoal"
                                style={{ color: 'rgba(1,71,46,0.6)' }}
                            >
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                <span className="font-bold underline decoration-2 underline-offset-4" style={{ color: 'var(--forest)', textDecorationColor: 'var(--sage)' }}>
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </span>
                            </button>
                        </div>

                        <div className="mt-8 p-3 rounded-xl border border-dashed text-center"
                            style={{ background: 'rgba(233,237,201,0.5)', borderColor: 'var(--sage)' }}>
                            <p className="text-xs font-body" style={{ color: 'var(--forest)' }}>
                                <span className="font-bold">Demo mode:</span> Click Sign In to use demo credentials
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
