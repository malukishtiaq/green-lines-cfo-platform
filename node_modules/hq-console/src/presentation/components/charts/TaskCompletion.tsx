'use client';

import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface TaskCompletionData {
  status: string;
  count: number;
  percentage: number;
}

interface TaskCompletionProps {
  title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  'PENDING': '#faad14',
  'IN_PROGRESS': '#1890ff',
  'COMPLETED': '#52c41a',
  'CANCELLED': '#ff4d4f',
};

const TaskCompletion: React.FC<TaskCompletionProps> = ({ 
  title = 'Task Status Overview' 
}) => {
  const [data, setData] = useState<TaskCompletionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskCompletion();
  }, []);

  const fetchTaskCompletion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard/charts/tasks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch task completion data');
      }
      
      const taskData = await response.json();
      setData(taskData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task completion data');
      console.error('Error fetching task completion:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format status labels
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <Card title={title} style={{ height: 400 }}>
      {loading ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large">
            <div style={{ paddingTop: 50 }}>Loading task data...</div>
          </Spin>
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <a onClick={fetchTaskCompletion} style={{ cursor: 'pointer' }}>
              Retry
            </a>
          }
        />
      ) : data.length === 0 ? (
        <Empty
          description="No task data available"
          style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="status" 
              tickFormatter={formatStatus}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              style={{ fontSize: '12px' }}
              label={{ value: 'Number of Tasks', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'count') return [`${value} tasks`, 'Tasks'];
                if (name === 'percentage') return [`${value}%`, 'Percentage'];
                return value;
              }}
              labelFormatter={formatStatus}
            />
            <Legend 
              formatter={(value) => value === 'count' ? 'Tasks' : 'Percentage'}
            />
            <Bar 
              dataKey="count" 
              name="count"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default TaskCompletion;

