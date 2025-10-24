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
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  // Mock data for demonstration
  const recentTasks = [
    {
      key: '1',
      task: 'Review Q4 Financial Reports',
      customer: 'ABC Company',
      agent: 'John Smith',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2025-10-20',
    },
    {
      key: '2',
      task: 'Tax Filing Preparation',
      customer: 'XYZ Corp',
      agent: 'Sarah Johnson',
      status: 'Completed',
      priority: 'Medium',
      dueDate: '2025-10-18',
    },
    {
      key: '3',
      task: 'Budget Planning Session',
      customer: 'DEF Ltd',
      agent: 'Mike Wilson',
      status: 'Pending',
      priority: 'Low',
      dueDate: '2025-10-25',
    },
  ];

  const columns = [
    {
      title: 'Task',
      dataIndex: 'task',
      key: 'task',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Agent',
      dataIndex: 'agent',
      key: 'agent',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'Completed' ? 'green' : 
                     status === 'In Progress' ? 'blue' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const color = priority === 'High' ? 'red' : 
                     priority === 'Medium' ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard Overview</Title>
      
      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Service Plans"
              value={89}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={456}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Tasks"
              value={23}
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
          <Card title="Task Completion Rate" bordered={false}>
            <Progress
              percent={75}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ marginTop: '16px' }}>
              <Space>
                <span>This Month: 75%</span>
                <span style={{ color: '#3f8600' }}>↑ 5% from last month</span>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Customer Satisfaction" bordered={false}>
            <Progress
              percent={92}
              strokeColor={{
                '0%': '#87d068',
                '100%': '#108ee9',
              }}
            />
            <div style={{ marginTop: '16px' }}>
              <Space>
                <span>Current Rating: 4.6/5</span>
                <span style={{ color: '#3f8600' }}>↑ 0.2 from last month</span>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Tasks Table */}
      <Card
        title="Recent Tasks"
        extra={
          <Button type="primary">
            View All Tasks
          </Button>
        }
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={recentTasks}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
