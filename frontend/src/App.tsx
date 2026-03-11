import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import Analytics from './pages/Analytics';
import AiAssistant from './pages/AiAssistant';
import Settings from './pages/Settings';
import Login from './pages/Login';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    organizationId: string;
}

interface AuthCtx {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isDark: boolean;
    toggleDark: () => void;
}

export const AuthContext = createContext<AuthCtx>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isDark: false,
    toggleDark: () => { },
});

export const useAuth = () => useContext(AuthContext);

function App() {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem('token')
    );
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const toggleDark = () => setIsDark(!isDark);

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isDark, toggleDark }}>
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
                    <Route index element={<Dashboard />} />
                    <Route path="tickets" element={<TicketList />} />
                    <Route path="tickets/:id" element={<TicketDetail />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="ai-assistant" element={<AiAssistant />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </AuthContext.Provider>
    );
}

export default App;
