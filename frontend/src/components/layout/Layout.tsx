import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../App';
import {
    LayoutDashboard, Ticket, BarChart3, Bot, Settings, LogOut,
    Menu, X, Zap, Sun, Moon, Bell
} from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
    const { user, logout, isDark, toggleDark } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--cream)' }}>

            {/* Top Navigation Bar */}
            <header className="fixed top-0 inset-x-0 h-16 z-50 flex items-center px-5"
                style={{
                    background: 'rgba(254,250,224,0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(163,177,138,0.3)',
                    boxShadow: '0 2px 16px rgba(1,71,46,0.07)',
                }}>

                {/* Left: Logo */}
                <div className="flex items-center gap-3">
                    <button onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 rounded-xl transition-colors lg:hidden hover:bg-nb-yellow">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-nb-sm"
                        style={{ background: 'var(--forest)' }}>
                        <Zap className="w-4 h-4" style={{ color: 'var(--sage)' }} />
                    </div>
                    <span className="font-heading text-xl font-bold tracking-tight hidden sm:block"
                        style={{ color: 'var(--forest)' }}>
                        SupportIQ
                    </span>
                </div>

                {/* Center: Nav pill (desktop) */}
                <nav className="hidden lg:flex items-center gap-0.5 ml-10 px-2 py-1.5 rounded-full"
                    style={{
                        background: 'rgba(204,213,174,0.3)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(163,177,138,0.4)',
                    }}>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-1.5 text-xs font-body font-semibold rounded-full transition-all duration-300 uppercase tracking-wider ${isActive
                                    ? 'shadow-nb-sm text-cream'
                                    : 'hover:bg-white/60'
                                }`
                            }
                            style={({ isActive }) => isActive
                                ? { background: 'var(--forest)', color: 'var(--cream)' }
                                : { color: 'var(--forest)' }
                            }
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right */}
                <div className="ml-auto flex items-center gap-2">
                    <button onClick={toggleDark}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-nb-yellow"
                        style={{ border: '1px solid rgba(163,177,138,0.5)', color: 'var(--forest)' }}>
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-nb-yellow relative"
                        style={{ border: '1px solid rgba(163,177,138,0.5)', color: 'var(--forest)' }}>
                        <Bell className="w-4 h-4" />
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-cream" />
                    </button>
                    <div className="hidden sm:flex items-center gap-2 ml-1 px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(204,213,174,0.35)', border: '1px solid rgba(163,177,138,0.4)' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: 'var(--forest)', color: 'var(--sage)' }}>
                            {user?.fullName?.charAt(0) || 'D'}
                        </div>
                        <span className="text-sm font-body font-semibold" style={{ color: 'var(--forest)' }}>
                            {user?.fullName?.split(' ')[0] || 'Demo'}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="nb-btn nb-btn-sm nb-btn-white">
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </header>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" />
                        <motion.nav
                            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className="fixed left-0 top-16 bottom-0 w-64 z-40 p-4 lg:hidden"
                            style={{ background: 'var(--cream)', borderRight: '1px solid rgba(163,177,138,0.4)' }}>
                            <div className="space-y-1">
                                {navItems.map(item => (
                                    <NavLink key={item.to} to={item.to} end={item.to === '/'}
                                        onClick={() => setMobileOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 font-body font-semibold text-sm rounded-xl transition-all ${isActive ? 'text-cream' : ''}`
                                        }
                                        style={({ isActive }) => isActive
                                            ? { background: 'var(--forest)', color: 'var(--cream)' }
                                            : { color: 'var(--forest)' }
                                        }
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="pt-16 min-h-screen">
                <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
