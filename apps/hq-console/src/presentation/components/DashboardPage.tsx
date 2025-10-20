// Presentation Layer - Refactored Dashboard Page using Clean Architecture
'use client';

import React from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useDashboard, useTasks } from '../hooks';
import { TaskStatus, Priority } from '../../domain/entities';
// import { useTranslations } from 'next-intl';

const { Title } = Typography;

// Hardcoded translations
const t = (key: string) => {
  const translations: Record<string, string> = {
    'dashboard.title': 'Dashboard Overview',
    'dashboard.totalCustomers': 'Total Customers',
    'dashboard.activeContracts': 'Active Contracts',
    'dashboard.pendingTasks': 'Pending Tasks',
    'dashboard.completedTasks': 'Completed Tasks',
    'dashboard.taskCompletion': 'Task Completion Rate',
    'dashboard.recentTasks': 'Recent Tasks',
    'dashboard.task': 'Task',
    'dashboard.customer': 'Customer',
    'dashboard.agent': 'Agent',
    'dashboard.status': 'Status',
    'dashboard.priority': 'Priority',
    'dashboard.dueDate': 'Due Date',
    'dashboard.actions': 'Actions',
    'dashboard.viewAll': 'View All Tasks',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'task.status.PENDING': 'Pending',
    'task.status.IN_PROGRESS': 'In Progress',
    'task.status.COMPLETED': 'Completed',
    'task.status.CANCELLED': 'Cancelled',
    'task.priority.LOW': 'Low',
    'task.priority.MEDIUM': 'Medium',
    'task.priority.HIGH': 'High',
    'task.priority.URGENT': 'Urgent',
  };
  return translations[key] || key;
};

const DashboardPage: React.FC = () => {
  const { stats, loading: statsLoading, error: statsError } = useDashboard();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();

  // Get recent tasks (first 5)
  const recentTasks = tasks.slice(0, 5).map(task => ({
    key: task.id,
    task: task.title,
    customer: 'Customer Name', // This would come from task.customer relation
    agent: 'Agent Name', // This would come from task.assignments relation
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : 'N/A',
  }));

  const columns = [
    {
      title: t('dashboard.task'),
      dataIndex: 'task',
      key: 'task',
    },
    {
      title: t('dashboard.customer'),
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: t('dashboard.agent'),
      dataIndex: 'agent',
      key: 'agent',
    },
    {
      title: t('dashboard.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => {
        const color = status === TaskStatus.COMPLETED ? 'green' :
                     status === TaskStatus.IN_PROGRESS ? 'blue' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: t('dashboard.priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: Priority) => {
        const color = priority === Priority.HIGH || priority === Priority.URGENT ? 'red' :
                     priority === Priority.MEDIUM ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: t('dashboard.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
  ];

  if (statsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (statsError) {
    return (
      <Alert
        message={t('common.error')}
        description={statsError}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <Title level={2}>{t('title')}</Title>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('totalCustomers')}
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('activeServicePlans')}
              value={stats.activeContracts}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('completedTasks')}
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('pendingTasks')}
              value={stats.pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title={t('taskCompletionRate')} variant="borderless">
            <Progress
              percent={stats.taskCompletionRate}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ marginTop: '16px' }}>
              <Space>
                <span>{t('thisMonth')}: {stats.taskCompletionRate}%</span>
                <span style={{ color: '#3f8600' }}>↑ 5% {t('fromLastMonth')}</span>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('customerSatisfaction')} variant="borderless">
            <Progress
              percent={85}
              strokeColor={{
                '0%': '#87d068',
                '100%': '#108ee9',
              }}
            />
            <div style={{ marginTop: '16px' }}>
              <Space>
                <span>{t('currentRating')}: 4.6/5</span>
                <span style={{ color: '#3f8600' }}>↑ 0.2 {t('fromLastMonth')}</span>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Tasks Table */}
      <Card
        title={t('recentTasks')}
        extra={
          <Button type="primary">
            {t('viewAllTasks')}
          </Button>
        }
        variant="borderless"
      >
        {tasksLoading ? (
          <Spin />
        ) : tasksError ? (
          <Alert message={tasksError} type="error" showIcon />
        ) : (
          <Table
            columns={columns}
            dataSource={recentTasks}
            pagination={false}
            size="small"
          />
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
