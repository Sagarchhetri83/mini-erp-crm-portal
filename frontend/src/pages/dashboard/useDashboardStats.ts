import { useState, useEffect } from 'react';
import api from '../../lib/api';

export interface DashboardStats {
  metrics: {
    totalCustomers: number;
    totalProducts: number;
    totalChallans: number;
    lowStockCount: number;
  };
  lowStockProducts: any[];
  recentChallans: any[];
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { data, loading, error };
}
