'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
  Tooltip,
  Badge,
  Skeleton,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import DashboardLayout from '@/components/DashboardLayout';
import { CleanArchitectureConfig } from '@/application';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock data for demonstration - in real app, this would come from API
const mockPlans = [
  {
    id: '1',
    name: 'ERP Implementation - ABC Corp',
    customer: 'ABC Corporation',
    status: 'active',
    stage: 3,
    totalStages: 7,
    budget: 50000,
    currency: 'SAR',
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    createdAt: '2024-01-10',
    lastModified: '2024-01-20',
    progress: 45,
    industry: 'Manufacturing',
    companySize: 'Large',
    durationWeeks: 20,
  },
  {
    id: '2',
    name: 'Stock Count System - XYZ Ltd',
    customer: 'XYZ Limited',
    status: 'draft',
    stage: 2,
    totalStages: 7,
    budget: 25000,
    currency: 'SAR',
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    createdAt: '2024-01-25',
    lastModified: '2024-01-30',
    progress: 25,
    industry: 'Retail',
    companySize: 'Medium',
    durationWeeks: 8,
  },
  {
    id: '3',
    name: 'Financial System Upgrade - DEF Inc',
    customer: 'DEF Incorporated',
    status: 'completed',
    stage: 7,
    totalStages: 7,
    budget: 75000,
    currency: 'SAR',
    startDate: '2023-10-01',
    endDate: '2024-01-15',
    createdAt: '2023-09-20',
    lastModified: '2024-01-15',
    progress: 100,
    industry: 'Finance',
    companySize: 'Large',
    durationWeeks: 15,
  },
  {
    id: '4',
    name: 'Inventory Management - GHI Co',
    customer: 'GHI Company',
    status: 'on-hold',
    stage: 4,
    totalStages: 7,
    budget: 35000,
    currency: 'SAR',
    startDate: '2024-01-20',
    endDate: '2024-05-20',
    createdAt: '2024-01-15',
    lastModified: '2024-01-25',
    progress: 60,
    industry: 'Logistics',
    companySize: 'Medium',
    durationWeeks: 16,
  },
];

const statusColors = {
  draft: 'default',
  active: 'processing',
  'on-hold': 'warning',
  completed: 'success',
  cancelled: 'error',
};

const statusLabels = {
  draft: 'Draft',
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [dateRange, setDateRange] = useState<any>(null);

  useEffect(() => {
    CleanArchitectureConfig.initialize();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/plans');
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match the expected format
        const transformedPlans = data.data.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          customer: plan.customer?.name || 'Unknown Customer',
          status: plan.status.toLowerCase(),
          stage: plan.currentStage,
          totalStages: plan.totalStages,
          budget: Number(plan.totalBudget),
          currency: plan.currency,
          startDate: plan.startDate,
          endDate: plan.endDate,
          createdAt: plan.createdAt,
          lastModified: plan.updatedAt,
          progress: Math.round((plan.currentStage / plan.totalStages) * 100),
          industry: plan.industry,
          companySize: plan.companySize,
          durationWeeks: plan.durationWeeks,
        }));
        
        setPlans(transformedPlans);
      } else {
        setError(data.error || 'Failed to fetch plans');
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Network error occurred');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter plans based on search and filters
  useEffect(() => {
    let filtered = plans;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(plan =>
        plan.name.toLowerCase().includes(searchText.toLowerCase()) ||
        plan.customer.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(plan => plan.industry === industryFilter);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(plan => {
        const planDate = new Date(plan.createdAt);
        return planDate >= start.toDate() && planDate <= end.toDate();
      });
    }

    setFilteredPlans(filtered);
  }, [plans, searchText, statusFilter, industryFilter, dateRange]);

  const handleDelete = async (planId: string) => {
    Modal.confirm({
      title: 'Delete Plan',
      content: 'Are you sure you want to delete this plan? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/plans/${planId}`, {
            method: 'DELETE',
          });
          
          const result = await response.json();
          
          if (result.success) {
            message.success('Plan deleted successfully');
            // Refresh the plans list
            fetchPlans();
          } else {
            message.error(result.error || 'Failed to delete plan');
          }
        } catch (error) {
          message.error('Network error occurred');
        }
      },
    });
  };

  const handleEdit = (planId: string) => {
    // Navigate to edit page
    window.location.href = `/plans/edit/${planId}`;
  };

  const handleView = (planId: string) => {
    // Navigate to plan details page
    window.location.href = `/plans/${planId}`;
  };

  const columns = [
    {
      title: 'Plan Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.customer}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors]}>
          {statusLabels[status as keyof typeof statusLabels]}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: any) => (
        <div>
          <Text>{progress}%</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Stage {record.stage}/{record.totalStages}
          </Text>
        </div>
      ),
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number, record: any) => (
        <Text>
          {budget.toLocaleString()} {record.currency}
        </Text>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'durationWeeks',
      key: 'durationWeeks',
      render: (weeks: number) => (
        <Text>{weeks} weeks</Text>
      ),
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text>{new Date(date).toLocaleDateString()}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit Plan">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete Plan">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.status === 'active').length;
  const draftPlans = plans.filter(p => p.status === 'draft').length;
  const completedPlans = plans.filter(p => p.status === 'completed').length;
  const totalBudget = plans.reduce((sum, plan) => sum + plan.budget, 0);

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error Loading Plans"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={fetchPlans}>
                Retry
              </Button>
            }
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>
            <FileTextOutlined style={{ marginRight: '8px' }} />
            Service Plans Management
          </Title>
          <Text type="secondary">
            Manage and track all your service plans and implementations
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card loading={loading}>
              <Statistic
                title="Total Plans"
                value={loading ? 0 : totalPlans}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card loading={loading}>
              <Statistic
                title="Active Plans"
                value={loading ? 0 : activePlans}
                valueStyle={{ color: '#1890ff' }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card loading={loading}>
              <Statistic
                title="Draft Plans"
                value={loading ? 0 : draftPlans}
                valueStyle={{ color: '#faad14' }}
                prefix={<EditOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card loading={loading}>
              <Statistic
                title="Total Budget"
                value={loading ? 0 : totalBudget}
                precision={0}
                suffix="SAR"
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Search
                placeholder="Search plans by name or customer..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col>
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
              >
                <Option value="all">All Status</Option>
                <Option value="draft">Draft</Option>
                <Option value="active">Active</Option>
                <Option value="on-hold">On Hold</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Industry"
                value={industryFilter}
                onChange={setIndustryFilter}
                style={{ width: 120 }}
              >
                <Option value="all">All Industries</Option>
                <Option value="Manufacturing">Manufacturing</Option>
                <Option value="Retail">Retail</Option>
                <Option value="Finance">Finance</Option>
                <Option value="Logistics">Logistics</Option>
              </Select>
            </Col>
            <Col>
              <RangePicker
                placeholder={['Start Date', 'End Date']}
                value={dateRange}
                onChange={setDateRange}
              />
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => window.location.href = '/plans/new'}
              >
                New Plan
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
              total: filteredPlans.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} plans`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
