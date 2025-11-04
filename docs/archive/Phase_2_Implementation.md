# Phase 2: Core Dashboard Enhancement - Detailed Implementation

## Overview
This document provides detailed implementation steps for Phase 2 of the Green Lines CFO Platform development.

## Current Status
- **Phase 1**: ✅ COMPLETED
- **Phase 2**: 🚀 READY TO START
- **Target**: Complete by end of Week 4

---

## Week 3: Enhanced Dashboard Widgets & User Management

### Day 1-2: Advanced KPI Cards

#### 1.1 Create KPI Cards Component
**File**: `src/components/dashboard/KPICards.tsx`

```typescript
'use client';

import React from 'react';
import { Card, Statistic, Row, Col, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface KPICardProps {
  title: string;
  value: number;
  trend: number;
  prefix?: React.ReactNode;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, prefix, loading }) => {
  const trendColor = trend >= 0 ? '#3f8600' : '#cf1322';
  const TrendIcon = trend >= 0 ? ArrowUpOutlined : ArrowDownOutlined;

  return (
    <Card>
      <Spin spinning={loading}>
        <Statistic
          title={title}
          value={value}
          prefix={prefix}
          valueStyle={{ color: trendColor }}
          suffix={<TrendIcon style={{ color: trendColor }} />}
        />
        <div style={{ marginTop: 8, fontSize: '12px', color: trendColor }}>
          {trend >= 0 ? '+' : ''}{trend}% from last month
        </div>
      </Spin>
    </Card>
  );
};

const KPICards: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({
    totalCustomers: 0,
    activeTasks: 0,
    completedTasks: 0,
    revenue: 0,
  });

  React.useEffect(() => {
    // Fetch KPI data
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      const response = await fetch('/api/dashboard/metrics');
      const kpiData = await response.json();
      setData(kpiData);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <KPICard
          title="Total Customers"
          value={data.totalCustomers}
          trend={5.2}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <KPICard
          title="Active Tasks"
          value={data.activeTasks}
          trend={-2.1}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <KPICard
          title="Completed Tasks"
          value={data.completedTasks}
          trend={8.5}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <KPICard
          title="Monthly Revenue"
          value={data.revenue}
          trend={12.3}
          loading={loading}
        />
      </Col>
    </Row>
  );
};

export default KPICards;
```

#### 1.2 Create KPI API Endpoint
**File**: `src/app/api/dashboard/metrics/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalCustomers,
      activeTasks,
      completedTasks,
      totalRevenue
    ] = await Promise.all([
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.servicePlan.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { price: true }
      })
    ]);

    return NextResponse.json({
      totalCustomers,
      activeTasks,
      completedTasks,
      revenue: totalRevenue._sum.price || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
```

### Day 3-4: Interactive Charts

#### 2.1 Install Chart Dependencies
```bash
npm install recharts
```

#### 2.2 Create Revenue Chart
**File**: `src/components/charts/RevenueChart.tsx`

```typescript
'use client';

import React from 'react';
import { Card, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
  loading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading }) => {
  return (
    <Card title="Revenue Trends" style={{ height: 400 }}>
      <Spin spinning={loading}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#1890ff" 
              strokeWidth={2}
              dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Spin>
    </Card>
  );
};

export default RevenueChart;
```

#### 2.3 Create Customer Distribution Chart
**File**: `src/components/charts/CustomerDistribution.tsx`

```typescript
'use client';

import React from 'react';
import { Card, Spin } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CustomerDistributionProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CustomerDistribution: React.FC<CustomerDistributionProps> = ({ data, loading }) => {
  return (
    <Card title="Customer Distribution by Industry" style={{ height: 400 }}>
      <Spin spinning={loading}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Spin>
    </Card>
  );
};

export default CustomerDistribution;
```

#### 2.4 Create Chart API Endpoints
**File**: `src/app/api/dashboard/charts/revenue/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(price) as revenue
      FROM service_plans 
      WHERE status = 'ACTIVE'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
```

### Day 5-7: User Profile Management

#### 3.1 Create Profile Page
**File**: `src/app/profile/page.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, message, Spin } from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';

const ProfilePage: React.FC = () => {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Profile updated successfully');
        await update();
      } else {
        message.error('Failed to update profile');
      }
    } catch (error) {
      message.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        message.success('Avatar updated successfully');
        await update();
      } else {
        message.error('Failed to update avatar');
      }
    } catch (error) {
      message.error('Error updating avatar');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card title="User Profile">
        <Spin spinning={loading}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar
              size={100}
              src={session?.user?.image}
              icon={<UserOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              <Upload
                beforeUpload={handleAvatarUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<CameraOutlined />}>
                  Change Avatar
                </Button>
              </Upload>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: session?.user?.name,
              email: session?.user?.email,
            }}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default ProfilePage;
```

#### 3.2 Create Profile API Endpoints
**File**: `src/app/api/users/profile/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
```

---

## Week 4: Advanced Tables & UX Improvements

### Day 8-9: Enhanced Data Tables

#### 4.1 Create Enhanced Task Table
**File**: `src/components/tables/TaskTable.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Dropdown,
  Menu,
  message,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  MoreOutlined,
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  customer: {
    name: string;
  };
  createdBy: {
    name: string;
  };
}

const TaskTable: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      message.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase()) ||
        task.customer.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/tasks/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tasks.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Tasks exported successfully');
    } catch (error) {
      message.error('Failed to export tasks');
    }
  };

  const columns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: Task, b: Task) => a.title.localeCompare(b.title),
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      sorter: (a: Task, b: Task) => a.customer.name.localeCompare(b.customer.name),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'COMPLETED' ? 'green' : 
                     status === 'IN_PROGRESS' ? 'blue' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const color = priority === 'HIGH' ? 'red' : 
                     priority === 'MEDIUM' ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a: Task, b: Task) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Task) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view">View Details</Menu.Item>
              <Menu.Item key="edit">Edit Task</Menu.Item>
              <Menu.Item key="delete">Delete Task</Menu.Item>
            </Menu>
          }
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Card
      title="Tasks"
      extra={
        <Space>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            Export
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Search tasks..."
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Status"
            style={{ width: 120 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">All Status</Option>
            <Option value="PENDING">Pending</Option>
            <Option value="IN_PROGRESS">In Progress</Option>
            <Option value="COMPLETED">Completed</Option>
          </Select>
          <Select
            placeholder="Priority"
            style={{ width: 120 }}
            value={priorityFilter}
            onChange={setPriorityFilter}
          >
            <Option value="all">All Priority</Option>
            <Option value="LOW">Low</Option>
            <Option value="MEDIUM">Medium</Option>
            <Option value="HIGH">High</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTasks}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} tasks`,
        }}
      />
    </Card>
  );
};

export default TaskTable;
```

### Day 10-11: Error Handling & Loading States

#### 5.1 Create Error Boundary
**File**: `src/components/ui/ErrorBoundary.tsx`

```typescript
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="An error occurred while rendering this component."
          extra={
            <Button
              type="primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### 5.2 Create Loading States
**File**: `src/components/ui/LoadingStates.tsx`

```typescript
'use client';

import React from 'react';
import { Card, Skeleton, Spin } from 'antd';

export const SkeletonLoader: React.FC = () => (
  <Card>
    <Skeleton active paragraph={{ rows: 4 }} />
  </Card>
);

export const TableSkeleton: React.FC = () => (
  <Card>
    <Skeleton active paragraph={{ rows: 8 }} />
  </Card>
);

export const ChartSkeleton: React.FC = () => (
  <Card>
    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" />
    </div>
  </Card>
);

export const PageSkeleton: React.FC = () => (
  <div>
    <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />
    <Skeleton active paragraph={{ rows: 4 }} />
  </div>
);
```

### Day 12-14: Responsive Design & Testing

#### 6.1 Update Dashboard Layout for Mobile
**File**: `src/components/layout/ResponsiveLayout.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { Layout, Drawer, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import DashboardLayout from './DashboardLayout';

const { Header, Content } = Layout;

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DashboardLayout>{children}</DashboardLayout>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        <Layout style={{ minHeight: '100vh' }}>
          <Header
            style={{
              padding: '0 16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px 0 rgba(29,35,41,.05)',
            }}
          >
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileMenuVisible(true)}
            />
            <h3 style={{ margin: 0, color: '#1890ff' }}>Green Lines CFO</h3>
            <div />
          </Header>

          <Content style={{ padding: '16px' }}>
            {children}
          </Content>

          <Drawer
            title="Menu"
            placement="left"
            onClose={() => setMobileMenuVisible(false)}
            open={mobileMenuVisible}
            width={280}
          >
            {/* Mobile menu content */}
            <div>Mobile menu items here</div>
          </Drawer>
        </Layout>
      </div>
    </>
  );
};

export default ResponsiveLayout;
```

---

## Testing Implementation

### Unit Tests
**File**: `src/components/__tests__/KPICards.test.tsx`

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import KPICards from '../dashboard/KPICards';

// Mock fetch
global.fetch = jest.fn();

describe('KPICards', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders KPI cards with loading state', () => {
    render(<KPICards />);
    expect(screen.getByText('Total Customers')).toBeInTheDocument();
  });

  it('displays KPI data after loading', async () => {
    const mockData = {
      totalCustomers: 100,
      activeTasks: 25,
      completedTasks: 75,
      revenue: 50000,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<KPICards />);
    
    // Wait for data to load
    await screen.findByText('100');
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
```

---

## Success Criteria Checklist

### Week 3 Completion
- [ ] Advanced KPI Cards implemented with real-time data
- [ ] Interactive Charts (Revenue, Customer, Task, Performance) working
- [ ] User Profile Management with editing functionality
- [ ] Avatar upload working
- [ ] Settings page implemented

### Week 4 Completion
- [ ] Enhanced Data Tables with filtering/sorting
- [ ] Error Handling & Loading States implemented
- [ ] Mobile Responsive Design working
- [ ] Cross-browser Testing completed
- [ ] Performance Optimization achieved

### Final Phase 2 Criteria
- [ ] Dashboard loads in under 2 seconds
- [ ] All charts render with real data
- [ ] User profile management fully functional
- [ ] Data tables support all filtering/sorting features
- [ ] Mobile responsive design works on all devices
- [ ] Error handling covers all edge cases
- [ ] 90%+ test coverage for new components

---

*This implementation guide provides step-by-step instructions for completing Phase 2 of the Green Lines CFO Platform development.*
