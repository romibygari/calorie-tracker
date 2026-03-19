import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import type { User, FoodItem, FoodLog, DailySummary, HistoryEntry, MealType } from '../types';

export function useUsers() {
  return useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users').then(r => r.data) });
}

export function useUser(id: number) {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: () => api.get(`/users/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      api.put(`/users/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useFoods(search: string) {
  return useQuery<FoodItem[]>({
    queryKey: ['foods', search],
    queryFn: () => api.get('/foods', { params: { search } }).then(r => r.data),
    enabled: search.length >= 1,
  });
}

export function useFood(id: number) {
  return useQuery<FoodItem>({
    queryKey: ['foods', id],
    queryFn: () => api.get(`/foods/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<FoodItem, 'id' | 'isCustom'> & { createdBy?: number }) =>
      api.post('/foods', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foods'] }),
  });
}

export function useDayLogs(userId: number, date: string) {
  return useQuery<FoodLog[]>({
    queryKey: ['logs', userId, date],
    queryFn: () => api.get('/logs', { params: { userId, date } }).then(r => r.data),
    enabled: !!userId && !!date,
  });
}

export function useCreateLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: number; foodItemId: number; logDate: string; meal: MealType; quantity: number }) =>
      api.post('/logs', data).then(r => r.data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['logs', vars.userId, vars.logDate] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/logs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logs'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDailyAnalytics(userId: number, date: string) {
  return useQuery<DailySummary>({
    queryKey: ['analytics', 'daily', userId, date],
    queryFn: () => api.get('/analytics/daily', { params: { userId, date } }).then(r => r.data),
    enabled: !!userId && !!date,
  });
}

export function useHistoryAnalytics(userId: number, days = 30) {
  return useQuery<HistoryEntry[]>({
    queryKey: ['analytics', 'history', userId, days],
    queryFn: () => api.get('/analytics/history', { params: { userId, days } }).then(r => r.data),
    enabled: !!userId,
  });
}
