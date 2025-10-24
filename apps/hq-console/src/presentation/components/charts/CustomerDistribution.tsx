'use client';

import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Empty } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CustomerDistributionData {
  name: string;
  value: number;
}

interface CustomerDistributionProps {
  title?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

const CustomerDistribution: React.FC<CustomerDistributionProps> = ({ 
  title = 'Customer Distribution by Industry' 
}) => {
  const [data, setData] = useState<CustomerDistributionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerDistribution();
  }, []);

  const fetchCustomerDistribution = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard/charts/customers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer distribution');
      }
      
      const customerData = await response.json();
      setData(customerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer distribution');
      console.error('Error fetching customer distribution:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom label for pie chart
  const renderCustomLabel = (entry: any) => {
    const { name, percent } = entry;
    return `${name} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <Card title={title} style={{ height: 400 }}>
      {loading ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large">
            <div style={{ paddingTop: 50 }}>Loading customer data...</div>
          </Spin>
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <a onClick={fetchCustomerDistribution} style={{ cursor: 'pointer' }}>
              Retry
            </a>
          }
        />
      ) : data.length === 0 ? (
        <Empty
          description="No customer data available"
          style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value} customers`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default CustomerDistribution;

