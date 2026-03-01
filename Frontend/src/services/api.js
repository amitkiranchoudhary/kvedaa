import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 — clear stale tokens automatically
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// ─── AUTH ───
export const authAPI = {
    login: (data) => api.post('/v1/login', data),
    signup: (data) => api.post('/v1/users', data),
    resetPassword: (data) => api.post('/v1/reset_password', data),
    forgotPassword: (data) => api.post('/v1/forget-password', data),
    resetPasswordOTP: (data) => api.post('/v1/reset-password-otp', data),
};

// ─── BUILDINGS ───
export const buildingAPI = {
    create: (data) => api.post('/api/buildings/', data),
    getAll: () => api.get('/api/buildings/'),
    getById: (id) => api.get(`/api/buildings/${id}`),
    update: (id, data) => api.put(`/api/buildings/${id}`, data),
    delete: (id) => api.delete(`/api/buildings/${id}`),
};

// ─── DEVICES ───
export const deviceAPI = {
    register: (data) => api.post('/api/devices/', data),
    getAll: () => api.get('/api/devices/'),
    getById: (id) => api.get(`/api/devices/${id}`),
    getByBuilding: (buildingId) => api.get(`/api/devices/building/${buildingId}`),
    getStatus: (id) => api.get(`/api/devices/${id}/status`),
    update: (id, data) => api.put(`/api/devices/${id}`, data),
    delete: (id) => api.delete(`/api/devices/${id}`),
    regenerateKey: (id) => api.post(`/api/devices/${id}/regenerate-key`),
};

// ─── TELEMETRY ───
export const telemetryAPI = {
    push: (data, apiKey) =>
        axios.post(`${API_BASE}/api/telemetry/`, data, {
            headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        }),
    getByDevice: (deviceId, limit = 100) =>
        api.get(`/api/telemetry/${deviceId}?limit=${limit}`),
    getLatest: (deviceId) => api.get(`/api/telemetry/${deviceId}/latest`),
};

// ─── ANALYTICS ───
export const analyticsAPI = {
    getDashboard: () => api.get('/api/analytics/dashboard'),
    getEnergy: (start, end) =>
        api.get(`/api/analytics/energy?start=${start}&end=${end}`),
    getComfort: (start, end) =>
        api.get(`/api/analytics/comfort?start=${start}&end=${end}`),
};

// ─── ALERTS ───
export const alertAPI = {
    createRule: (data) => api.post('/api/alerts/rules', data),
    getRules: () => api.get('/api/alerts/rules'),
    getRule: (id) => api.get(`/api/alerts/rules/${id}`),
    updateRule: (id, data) => api.put(`/api/alerts/rules/${id}`, data),
    deleteRule: (id) => api.delete(`/api/alerts/rules/${id}`),
    getAlerts: (limit = 50, acknowledged) => {
        let url = `/api/alerts/?limit=${limit}`;
        if (acknowledged !== undefined) url += `&acknowledged=${acknowledged}`;
        return api.get(url);
    },
    getAlertsByDevice: (deviceId) => api.get(`/api/alerts/device/${deviceId}`),
    acknowledge: (id) => api.post(`/api/alerts/${id}/acknowledge`),
};

// ─── FARM / BATCHES ───
export const farmAPI = {
    createBatch: (data) => api.post('/api/farm/batches/', data),
    getAllBatches: () => api.get('/api/farm/batches/'),
    getActiveBatches: () => api.get('/api/farm/batches/active'),
    getBatch: (id) => api.get(`/api/farm/batches/${id}`),
    updateBatch: (id, data) => api.put(`/api/farm/batches/${id}`, data),
    advanceStage: (id, stage) => api.post(`/api/farm/batches/${id}/advance`, { new_stage: stage }),
    deleteBatch: (id) => api.delete(`/api/farm/batches/${id}`),
    getDashboard: () => api.get('/api/farm/batches/dashboard'),
};

// ─── INVENTORY ───
export const inventoryAPI = {
    create: (data) => api.post('/api/farm/inventory/', data),
    getAll: (category) => api.get(`/api/farm/inventory/${category ? `?category=${category}` : ''}`),
    getById: (id) => api.get(`/api/farm/inventory/${id}`),
    update: (id, data) => api.put(`/api/farm/inventory/${id}`, data),
    adjustStock: (id, data) => api.post(`/api/farm/inventory/${id}/adjust`, data),
    getLowStock: () => api.get('/api/farm/inventory/low-stock'),
    delete: (id) => api.delete(`/api/farm/inventory/${id}`),
};

// ─── TASKS / SCHEDULE ───
export const scheduleAPI = {
    getAll: (status, limit = 100) => api.get(`/api/farm/tasks/?limit=${limit}${status ? `&status=${status}` : ''}`),
    getToday: () => api.get('/api/farm/tasks/today'),
    getOverdue: () => api.get('/api/farm/tasks/overdue'),
    getByBatch: (batchId) => api.get(`/api/farm/tasks/batch/${batchId}`),
    complete: (id) => api.post(`/api/farm/tasks/${id}/complete`),
    delete: (id) => api.delete(`/api/farm/tasks/${id}`),
};

// ─── PRODUCTS (Admin) ───
export const productAPI = {
    create: (data) => api.post('/api/farm/products', data),
    getAll: () => api.get('/api/farm/products'),
    getById: (id) => api.get(`/api/farm/products/${id}`),
    update: (id, data) => api.put(`/api/farm/products/${id}`, data),
    delete: (id) => api.delete(`/api/farm/products/${id}`),
    // Public (no auth)
    getPublic: () => axios.get(`${API_BASE}/store/products`),
};

// ─── ORDERS ───
export const orderAPI = {
    create: (data) => api.post('/orders/', data),
    getMyOrders: () => api.get('/orders/my'),
    getById: (id) => api.get(`/orders/${id}`),
    cancel: (id) => api.put(`/orders/${id}`, { status: 'CANCELLED' }),
};

export default api;
