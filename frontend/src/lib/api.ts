import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/api/v1/auth/login', { email, password }),
    register: (data: { fullName: string; email: string; password: string }) =>
        api.post('/api/v1/auth/register', data),
    me: () => api.get('/api/v1/auth/me'),
};

// Tickets
export const ticketApi = {
    getAll: (params?: Record<string, string>) =>
        api.get('/api/v1/tickets', { params }),
    getById: (id: string) => api.get(`/api/v1/tickets/${id}`),
    create: (data: any) => api.post('/api/v1/tickets', data),
    update: (id: string, data: any) => api.patch(`/api/v1/tickets/${id}`, data),
    delete: (id: string) => api.delete(`/api/v1/tickets/${id}`),
    assign: (id: string, agentId: string) =>
        api.patch(`/api/v1/tickets/${id}/assign`, { agentId }),
    updateStatus: (id: string, status: string) =>
        api.patch(`/api/v1/tickets/${id}/status`, { status }),
    getComments: (id: string) => api.get(`/api/v1/tickets/${id}/comments`),
    addComment: (id: string, data: { content: string; isInternal?: boolean }) =>
        api.post(`/api/v1/tickets/${id}/comments`, data),
    search: (q: string) => api.get('/api/v1/tickets/search', { params: { q } }),
    getMyTickets: () => api.get('/api/v1/tickets/my-tickets'),
};

// Analytics
export const analyticsApi = {
    getDashboard: () => api.get('/api/v1/analytics/dashboard-metrics'),
    getAgentPerformance: (from?: string, to?: string) =>
        api.get('/api/v1/analytics/agent-performance', { params: { from, to } }),
    getTicketTrends: (period?: string) =>
        api.get('/api/v1/analytics/ticket-trends', { params: { period } }),
    getCategoryDistribution: () => api.get('/api/v1/analytics/category-distribution'),
    getSlaCompliance: () => api.get('/api/v1/analytics/sla-compliance'),
};

// AI — all routed through API Gateway, never direct to port 8001
export const aiService = {
    categorize: (subject: string, description: string) =>
        api.post('/api/v1/ai/categorize', { subject, description }),
    analyzeSentiment: (text: string) =>
        api.post('/api/v1/ai/analyze-sentiment', { text }),
    suggestResponse: (data: { ticket_subject: string; ticket_description: string }) =>
        api.post('/api/v1/ai/suggest-response', data),
    predictEscalation: (data: any) =>
        api.post('/api/v1/ai/predict-escalation', data),
    searchKnowledgeBase: (query: string) =>
        api.post('/api/v1/ai/search-knowledge-base', { query }),
    naturalLanguageQuery: (query: string) =>
        api.post('/api/v1/ai/query', { query }),
    chat: (message: string) =>
        api.post('/api/v1/ai/chat', { message }),
};

export default api;