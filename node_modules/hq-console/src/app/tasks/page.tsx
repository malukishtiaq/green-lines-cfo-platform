'use client';

import React, { useMemo } from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import DashboardLayout from '@/components/DashboardLayout';
import { useTasks } from '@/presentation/components/../hooks';
import { Priority, TaskStatus } from '@/domain/entities';

const { Title, Text } = Typography;

export default function TasksPage() {
  const { tasks, loading, error } = useTasks();

  const columns = useMemo(() => [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.customer?.name || 'N/A'}
          </Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => {
        let color = 'default';
        if (status === TaskStatus.COMPLETED) color = 'green';
        else if (status === TaskStatus.IN_PROGRESS) color = 'blue';
        else if (status === TaskStatus.CANCELLED) color = 'red';
        else if (status === TaskStatus.ON_HOLD) color = 'gold';
        else if (status === TaskStatus.PENDING) color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: Priority) => {
        let color = 'default';
        if (priority === Priority.URGENT) color = 'red';
        else if (priority === Priority.HIGH) color = 'orange';
        else if (priority === Priority.MEDIUM) color = 'gold';
        else color = 'green';
        return <Tag color={color}>{priority}</Tag>;
      }
    },
    {
      title: 'Budget (SAR)',
      dataIndex: 'budget',
      key: 'budget',
      render: (value: number | null | undefined) => value != null ? value.toLocaleString() : '—',
    },
    {
      title: 'Actual Cost (SAR)',
      dataIndex: 'actualCost',
      key: 'actualCost',
      render: (value: number | null | undefined) => value != null ? value.toLocaleString() : '—',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date?: string | Date) => date ? new Date(date).toLocaleDateString() : '—',
    },
  ], []);

  return (
    <DashboardLayout>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={2}>Tasks</Title>
          <Text type="secondary">Track task budgets and progress</Text>
        </div>
        <Card>
          <Table
            rowKey="id"
            columns={columns as any}
            dataSource={tasks}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}


