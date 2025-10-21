'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Divider,
  Timeline,
  Progress,
  Statistic,
  Descriptions,
  Alert,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import DashboardLayout from '@/components/DashboardLayout';
import { CleanArchitectureConfig } from '@/application';

const { Title, Text, Paragraph } = Typography;

interface PlanDetails {
  id: string;
  name: string;
  description?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  industry: string;
  companySize: string;
  durationType: string;
  durationWeeks?: number;
  startDate?: string;
  workingDays: number;
  address?: string;
  siteType?: string;
  accessRequirements?: string;
  status: string;
  currentStage: number;
  totalStages: number;
  totalBudget: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  milestones: Array<{
    id: string;
    sequence: number;
    name: string;
    description?: string;
    durationWeeks: number;
    budgetAllocation: number;
    deliverables?: string;
    dependencies?: string;
    isCriticalPath: boolean;
  }>;
}

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

export default function PlanDetailsPage({ params }: { params: { id: string } }) {
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    CleanArchitectureConfig.initialize();
    fetchPlanDetails();
  }, [params.id]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plans/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setPlan(data.data);
      } else {
        setError(data.error || 'Failed to fetch plan details');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Navigate to Plan Builder with existing data
    window.location.href = `/plans/edit/${params.id}`;
  };

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Loading plan details...</Text>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !plan) {
    return (
      <DashboardLayout>
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description={error || 'Plan not found'}
            type="error"
            showIcon
            action={
              <Button onClick={handleBack}>
                <ArrowLeftOutlined /> Go Back
              </Button>
            }
          />
        </div>
      </DashboardLayout>
    );
  }

  const progress = Math.round((plan.currentStage / plan.totalStages) * 100);
  const totalDuration = plan.milestones.reduce((sum, milestone) => sum + milestone.durationWeeks, 0);

  return (
    <DashboardLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            style={{ marginBottom: '16px' }}
          >
            Back to Plans
          </Button>
          
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                <FileTextOutlined style={{ marginRight: '8px' }} />
                {plan.name}
              </Title>
              <Text type="secondary">{plan.customer.name}</Text>
            </Col>
            <Col>
              <Space>
                <Tag color={statusColors[plan.status as keyof typeof statusColors]}>
                  {statusLabels[plan.status as keyof typeof statusLabels]}
                </Tag>
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  Edit Plan
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Progress Overview */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Progress"
                value={progress}
                suffix="%"
                valueStyle={{ color: progress === 100 ? '#52c41a' : '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Current Stage"
                value={`${plan.currentStage}/${plan.totalStages}`}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Total Budget"
                value={plan.totalBudget}
                precision={0}
                suffix={plan.currency}
                prefix={<DollarOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Duration"
                value={totalDuration}
                suffix="weeks"
                prefix={<CalendarOutlined />}
              />
            </Col>
          </Row>
          <div style={{ marginTop: '16px' }}>
            <Progress percent={progress} strokeColor="#1890ff" />
          </div>
        </Card>

        <Row gutter={24}>
          {/* Left Column - Plan Details */}
          <Col span={16}>
            {/* Basic Information */}
            <Card title="Basic Information" style={{ marginBottom: '16px' }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Industry">{plan.industry}</Descriptions.Item>
                <Descriptions.Item label="Company Size">{plan.companySize}</Descriptions.Item>
                <Descriptions.Item label="Duration Type">{plan.durationType}</Descriptions.Item>
                <Descriptions.Item label="Duration (Weeks)">{plan.durationWeeks || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Working Days">{plan.workingDays}</Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Not set'}
                </Descriptions.Item>
                <Descriptions.Item label="Site Type" span={2}>{plan.siteType || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>{plan.address || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Access Requirements" span={2}>
                  {plan.accessRequirements || 'N/A'}
                </Descriptions.Item>
                {plan.description && (
                  <Descriptions.Item label="Description" span={2}>
                    <Paragraph>{plan.description}</Paragraph>
                  </Descriptions.Item>
                )}
                {plan.notes && (
                  <Descriptions.Item label="Notes" span={2}>
                    <Paragraph>{plan.notes}</Paragraph>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Milestones Timeline */}
            <Card title="Project Timeline">
              <Timeline>
                {plan.milestones
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((milestone, index) => (
                    <Timeline.Item
                      key={milestone.id}
                      color={milestone.isCriticalPath ? 'red' : 'blue'}
                      dot={milestone.isCriticalPath ? <ClockCircleOutlined /> : undefined}
                    >
                      <div>
                        <Text strong>{milestone.name}</Text>
                        {milestone.isCriticalPath && (
                          <Tag color="red" style={{ marginLeft: '8px' }}>Critical Path</Tag>
                        )}
                        <br />
                        <Text type="secondary">
                          Duration: {milestone.durationWeeks} weeks | 
                          Budget: {milestone.budgetAllocation}%
                        </Text>
                        {milestone.description && (
                          <div style={{ marginTop: '4px' }}>
                            <Text>{milestone.description}</Text>
                          </div>
                        )}
                        {milestone.deliverables && (
                          <div style={{ marginTop: '4px' }}>
                            <Text type="secondary">
                              <strong>Deliverables:</strong> {milestone.deliverables}
                            </Text>
                          </div>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
              </Timeline>
            </Card>
          </Col>

          {/* Right Column - Customer Info */}
          <Col span={8}>
            <Card title="Customer Information">
              <Descriptions column={1}>
                <Descriptions.Item label="Name">{plan.customer.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{plan.customer.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{plan.customer.phone || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Address">{plan.customer.address || 'N/A'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Project Summary" style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Status: </Text>
                <Tag color={statusColors[plan.status as keyof typeof statusColors]}>
                  {statusLabels[plan.status as keyof typeof statusLabels]}
                </Tag>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Created: </Text>
                <Text>{new Date(plan.createdAt).toLocaleDateString()}</Text>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Last Modified: </Text>
                <Text>{new Date(plan.updatedAt).toLocaleDateString()}</Text>
              </div>
              <Divider />
              <div>
                <Text strong>Total Milestones: </Text>
                <Text>{plan.milestones.length}</Text>
              </div>
              <div>
                <Text strong>Critical Path Items: </Text>
                <Text>{plan.milestones.filter(m => m.isCriticalPath).length}</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}
