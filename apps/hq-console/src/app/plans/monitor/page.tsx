'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Typography,
  Statistic,
  Progress,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  SyncOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface Plan {
  id: string;
  name: string;
  customer: { name: string };
  status: string;
  progress: number;
  milestonesCompleted: number;
  totalMilestones: number;
  kpisOnTarget: number;
  totalKpis: number;
  tasksOverdue: number;
  budgetUtilization: number;
  lastSync: string;
  erpStatus: string;
}

export default function MonitorPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plans');
      const data = await response.json();

      // Transform data for monitoring view
      const transformedPlans = data.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        customer: plan.customer,
        status: plan.status,
        progress: Math.floor(Math.random() * 100), // TODO: Calculate from actual data
        milestonesCompleted: Math.floor(Math.random() * 15),
        totalMilestones: 18,
        kpisOnTarget: Math.floor(Math.random() * 10),
        totalKpis: 12,
        tasksOverdue: Math.floor(Math.random() * 8),
        budgetUtilization: Math.floor(Math.random() * 100),
        lastSync: dayjs().subtract(Math.floor(Math.random() * 10), 'hours').format('YYYY-MM-DD HH:mm'),
        erpStatus: 'CONNECTED',
      }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonitor = (planId: string) => {
    router.push(`/en/plans/${planId}/monitor`);
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         plan.customer.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Plan Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Plan) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.customer.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <div style={{ width: 120 }}>
          <Progress percent={progress} size="small" />
        </div>
      ),
    },
    {
      title: 'Milestones',
      key: 'milestones',
      render: (record: Plan) => (
        <Text>
          {record.milestonesCompleted} / {record.totalMilestones}
        </Text>
      ),
    },
    {
      title: 'KPIs On Target',
      key: 'kpis',
      render: (record: Plan) => (
        <Text>
          {record.kpisOnTarget} / {record.totalKpis}
        </Text>
      ),
    },
    {
      title: 'Tasks Overdue',
      dataIndex: 'tasksOverdue',
      key: 'tasksOverdue',
      render: (count: number) => (
        <Tag color={count > 5 ? 'red' : count > 2 ? 'orange' : 'green'}>
          {count}
        </Tag>
      ),
    },
    {
      title: 'Budget Utilization',
      dataIndex: 'budgetUtilization',
      key: 'budgetUtilization',
      render: (value: number) => (
        <Text>{value}%</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ACTIVE: 'processing',
          COMPLETED: 'success',
          INACTIVE: 'default',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Last Sync',
      dataIndex: 'lastSync',
      key: 'lastSync',
      render: (date: string) => (
        <Text style={{ fontSize: 12 }}>{date}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Plan) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleMonitor(record.id)}
        >
          Monitor
        </Button>
      ),
    },
  ];

  // Calculate summary stats
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.status === 'ACTIVE').length;
  const avgProgress = plans.length > 0
    ? Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / plans.length)
    : 0;
  const totalOverdueTasks = plans.reduce((sum, p) => sum + p.tasksOverdue, 0);

  return (
    <DashboardLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>Monitor Plans</Title>
          <Text type="secondary">
            Monitor and track all active plans with real-time KPI updates
          </Text>
        </div>

        {/* Summary Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Plans"
                value={totalPlans}
                prefix="📋"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Plans"
                value={activePlans}
                prefix="🟢"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Average Progress"
                value={avgProgress}
                suffix="%"
                prefix="📊"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Overdue Tasks"
                value={totalOverdueTasks}
                prefix="⚠️"
                valueStyle={{ color: totalOverdueTasks > 10 ? '#cf1322' : '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col>
              <FilterOutlined style={{ fontSize: 18 }} />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search by plan or customer name"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">All Status</Option>
                <Option value="ACTIVE">Active</Option>
                <Option value="COMPLETED">Completed</Option>
                <Option value="INACTIVE">Inactive</Option>
              </Select>
            </Col>
            <Col>
              <Button
                icon={<SyncOutlined />}
                onClick={fetchPlans}
                loading={loading}
              >
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Plans Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredPlans}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} plans`,
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

