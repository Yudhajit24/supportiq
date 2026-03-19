import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../App';
import {
    LayoutDashboard, Ticket, BarChart3, Bot, Settings, LogOut,
    Menu, X, Zap, Sun, Moon, Bell, Search
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
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Overview';
        if (path.startsWith('/tickets')) return 'Tickets';
        if (path.startsWith('/analytics')) return 'Analytics';
        if (path.startsWith('/ai-assistant')) return 'AI Assistant';
        if (path.startsWith('/settings')) return 'Settings';
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
            
            {/* Desktop Sidebar (72px wide) */}
            <aside className="hidden md:flex w-[72px] fixed inset-y-0 left-0 z-50 flex-col items-center py-8 gap-4">
                {/* Logo Card */}
                <div className="nm-flat w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-primary">
                    <Zap className="w-6 h-6" />
                </div>

                {/* Nav Links */}
                <div className="flex flex-col gap-3 w-full px-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `relative w-12 h-12 mx-auto flex items-center justify-center rounded-2xl transition-all duration-300 group ${
                                    isActive ? 'nm-inset text-primary' : 'text-muted-foreground hover:text-primary'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </NavLink>
                    ))}
                </div>

                {/* Bottom Actons */}
                <div className="mt-auto flex flex-col gap-4 items-center">
                    <button onClick={handleLogout} className="w-12 h-12 flex items-center justify-center rounded-2xl text-muted-foreground hover:text-destructive transition-all duration-300 hover:nm-flat">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Only visible on small screens) */}
            <header className="md:hidden fixed top-0 inset-x-0 h-16 z-50 px-4 flex items-center justify-between nm-flat rounded-b-2xl">
                <div className="flex items-center gap-2 text-primary font-bold">
                    <Zap className="w-5 h-5" />
                    <span>SupportIQ</span>
                </div>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 nm-button">
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-[72px] flex flex-col min-h-screen pt-16 md:pt-0">
                
                {/* Sticky Header */}
                <div className="sticky top-0 md:top-6 z-40 mx-4 md:mx-8 mb-6">
                    <header className="h-[72px] nm-flat rounded-[28px] flex items-center justify-between px-6">
                        
                        {/* Breadcrumbs / Page Title */}
                        <div className="hidden md:flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">{getPageTitle()}</h1>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                            <div className="w-full nm-inset rounded-full flex items-center px-4 py-2">
                                <Search className="w-4 h-4 text-muted-foreground mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="Search anything..." 
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        {/* Right Tools */}
                        <div className="flex items-center gap-4 ml-auto">
                            <button onClick={toggleDark} className="w-10 h-10 flex items-center justify-center shrink-0 nm-button">
                                {isDark ? <Sun className="w-4 h-4 text-accent-sage" /> : <Moon className="w-4 h-4 text-accent-indigo" />}
                            </button>
                            
                            <button className="w-10 h-10 flex items-center justify-center shrink-0 nm-button relative">
                                <Bell className="w-4 h-4 text-foreground" />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent-rose rounded-full animate-pulse" />
                            </button>
                            
                            {/* User Avatar */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center nm-flat shrink-0"
                                style={{ background: 'linear-gradient(135deg, var(--accent-sage), var(--accent-lavender))' }}>
                                <span className="text-sm font-bold text-white shadow-sm">
                                    {user?.fullName?.charAt(0) || 'U'}
                                </span>
                            </div>
                        </div>
                    </header>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.nav
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="md:hidden fixed top-20 inset-x-4 z-40 nm-flat rounded-2xl p-4 flex flex-col gap-2"
                        >
                            {navItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                            isActive ? 'nm-inset text-primary' : 'text-foreground'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-bold">{item.label}</span>
                                </NavLink>
                            ))}
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive mt-4">
                                <LogOut className="w-5 h-5" />
                                <span className="font-bold">Logout</span>
                            </button>
                        </motion.nav>
                    )}
                </AnimatePresence>

                {/* Page Content */}
                <main className="flex-1 px-4 md:px-8 pb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>

            </div>
        </div>
    );
}
