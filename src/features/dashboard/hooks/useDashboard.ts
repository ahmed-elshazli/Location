import { useQuery } from '@tanstack/react-query';
import {
  getDashboardApi,
  getDashboardStatsApi,
  getDashboardSalesApi,
  getDashboardTopAreasApi,
  getDashboardTopAgentsApi,
  getDashboardActivityApi,
} from '../api/dashboardApi';

// كل البيانات في request واحد
export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: getDashboardApi, staleTime: 5 * 60 * 1000 });

// hooks منفصلة لو احتجت تستخدم endpoint بمفرده
export const useDashboardStats    = () =>
  useQuery({ queryKey: ['dashboard-stats'],    queryFn: getDashboardStatsApi,     staleTime: 5 * 60 * 1000 });

export const useDashboardSales    = () =>
  useQuery({ queryKey: ['dashboard-sales'],    queryFn: getDashboardSalesApi,     staleTime: 5 * 60 * 1000 });

export const useDashboardTopAreas = () =>
  useQuery({ queryKey: ['dashboard-areas'],    queryFn: getDashboardTopAreasApi,  staleTime: 5 * 60 * 1000 });

export const useDashboardTopAgents = () =>
  useQuery({ queryKey: ['dashboard-agents'],   queryFn: getDashboardTopAgentsApi, staleTime: 5 * 60 * 1000 });

export const useDashboardActivity = () =>
  useQuery({ queryKey: ['dashboard-activity'], queryFn: getDashboardActivityApi,  staleTime: 5 * 60 * 1000 });