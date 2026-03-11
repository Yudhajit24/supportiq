import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../App';
import {
    LayoutDashboard, Ticket, BarChart3, Bot, Settings, LogOut,
    Menu, X, Zap, ChevronLeft, Sun, Moon, Bell
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
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-nb-yellow">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 inset-x-0 h-16 bg-nb-yellow border-b-2 border-black z-50 flex items-center px-4">
                {/* Left: Logo */}
                <div className="flex items-center gap-3">
                    <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-black/5 rounded-lg transition-colors lg:hidden">
                        {collapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <div className="w-10 h-10 bg-nb-charcoal rounded-xl border-2 border-black flex items-center justify-center shadow-nb-sm">
                        <Zap className="w-5 h-5 text-nb-yellow" />
                    </div>
                    <span className="font-heading text-xl font-extrabold tracking-tighter hidden sm:block">SupportIQ</span>
                </div>

                {/* Center: Nav links (desktop) */}
                <nav className="hidden lg:flex items-center gap-1 ml-12">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2 text-sm font-heading font-bold rounded-xl border-2 transition-all ${isActive
                                    ? 'bg-nb-charcoal text-white border-black shadow-nb-sm'
                                    : 'border-transparent hover:border-black hover:bg-white hover:shadow-nb-sm'
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right */}
                <div className="ml-auto flex items-center gap-2">
                    <button onClick={toggleDark}
                        className="w-10 h-10 rounded-xl border-2 border-black bg-white flex items-center justify-center hover:bg-nb-sage transition-colors shadow-nb-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button className="w-10 h-10 rounded-xl border-2 border-black bg-white flex items-center justify-center hover:bg-nb-sage transition-colors shadow-nb-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none relative">
                        <Bell className="w-4 h-4" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
                    </button>
                    <div className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-xl border-2 border-black bg-white shadow-nb-sm">
                        <div className="w-7 h-7 bg-nb-charcoal rounded-lg flex items-center justify-center text-nb-yellow text-xs font-bold border border-black">
                            {user?.fullName?.charAt(0) || 'D'}
                        </div>
                        <span className="text-sm font-heading font-bold">{user?.fullName?.split(' ')[0] || 'Demo'}</span>
                    </div>
                    <button onClick={handleLogout}
                        className="nb-btn-sm nb-btn nb-btn-white">
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </header>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {collapsed && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCollapsed(false)}
                            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                        />
                        <motion.nav
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            className="fixed left-0 top-16 bottom-0 w-64 bg-nb-yellow border-r-2 border-black z-40 p-4 lg:hidden"
                        >
                            <div className="space-y-1">
                                {navItems.map(item => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.to === '/'}
                                        onClick={() => setCollapsed(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 font-heading font-bold text-sm rounded-xl border-2 transition-all ${isActive
                                                ? 'bg-nb-charcoal text-white border-black shadow-nb-sm'
                                                : 'border-transparent hover:border-black hover:bg-white'
                                            }`
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
