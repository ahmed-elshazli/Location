import { api } from '../../../utils/axios';

// ── Dashboard API ─────────────────────────────────────────────────────────────
export const getDashboardApi          = () => api.get('/api/v1/dashboard').then(r => r.data);
export const getDashboardStatsApi     = () => api.get('/api/v1/dashboard/stats').then(r => r.data);
export const getDashboardSalesApi     = () => api.get('/api/v1/dashboard/sales-overview').then(r => r.data);
export const getDashboardTopAreasApi  = () => api.get('/api/v1/dashboard/top-areas').then(r => r.data);
export const getDashboardTopAgentsApi = () => api.get('/api/v1/dashboard/top-agents').then(r => r.data);
export const getDashboardActivityApi  = () => api.get('/api/v1/dashboard/recent-activity').then(r => r.data);