'use client';

import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Empty } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  title?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ title = 'Revenue Trends' }) => {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard/charts/revenue');
      
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      
      const revenueData = await response.json();
      setData(revenueData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue data');
      console.error('Error fetching revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format month
  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <Card title={title} style={{ height: 400 }}>
      {loading ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large">
            <div style={{ paddingTop: 50 }}>Loading revenue data...</div>
          </Spin>
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <a onClick={fetchRevenueData} style={{ cursor: 'pointer' }}>
              Retry
            </a>
          }
        />
      ) : data.length === 0 ? (
        <Empty
          description="No revenue data available"
          style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={formatMonth}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#1890ff"
              strokeWidth={2}
              dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue (AED)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default RevenueChart;

