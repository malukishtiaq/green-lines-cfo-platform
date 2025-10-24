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
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
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

export default function PlanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingMilestone, setViewingMilestone] = useState<any | null>(null);

  useEffect(() => {
    CleanArchitectureConfig.initialize();
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plans/${id}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Plan details from API:', data.data);
        console.log('Milestones from API:', data.data.milestones);
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
    window.location.href = `/plans/edit/${id}`;
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleViewMilestone = (milestoneId: string) => {
    // Find and show milestone details in a modal
    const milestone = plan?.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      setViewingMilestone(milestone);
    }
  };

  const handleEditMilestone = (milestoneId: string) => {
    // Navigate to edit mode with specific milestone
    window.location.href = `/plans/edit/${id}?milestone=${milestoneId}`;
  };

  const handleDeleteMilestone = async (milestoneId: string, milestoneName: string) => {
    // Show confirmation and delete milestone
    if (confirm(`Are you sure you want to delete milestone "${milestoneName}"?`)) {
      try {
        const response = await fetch(`/api/milestones/${milestoneId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // Refresh the page to show updated data
          window.location.reload();
        } else {
          alert('Failed to delete milestone');
        }
      } catch (error) {
        console.error('Error deleting milestone:', error);
        alert('Failed to delete milestone');
      }
    }
  };

  // Enhanced color coding for milestones
  const getMilestoneColor = (milestone: any, index: number) => {
    if (milestone.isCriticalPath) return 'red';
    
    // Color based on budget allocation
    const budgetPercent = milestone.budgetAllocation;
    if (budgetPercent >= 30) return 'volcano'; // High budget - orange/red
    if (budgetPercent >= 20) return 'orange';  // Medium-high budget - orange
    if (budgetPercent >= 10) return 'blue';    // Medium budget - blue
    if (budgetPercent >= 5) return 'green';    // Low-medium budget - green
    return 'cyan'; // Very low budget - cyan
  };

  const getMilestoneIcon = (milestone: any, index: number) => {
    if (milestone.isCriticalPath) return <ExclamationCircleOutlined />;
    
    // Icon based on budget allocation
    const budgetPercent = milestone.budgetAllocation;
    if (budgetPercent >= 30) return <DollarOutlined />; // High budget
    if (budgetPercent >= 20) return <TeamOutlined />;   // Medium-high budget
    if (budgetPercent >= 10) return <ClockCircleOutlined />; // Medium budget
    if (budgetPercent >= 5) return <CheckCircleOutlined />;  // Low-medium budget
    return <SyncOutlined />; // Very low budget
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
            <Card 
              title="Project Timeline" 
              extra={
                <Button type="primary" size="small" onClick={handleEdit}>
                  Edit Milestones
                </Button>
              }
            >
              {plan.milestones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>No milestones defined yet</div>
                  <Button type="primary" size="small" onClick={handleEdit} style={{ marginTop: '16px' }}>
                    Add Milestones
                  </Button>
                </div>
              ) : (
                <Timeline>
                  {plan.milestones
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((milestone, index) => {
                      const milestoneColor = getMilestoneColor(milestone, index);
                      const milestoneIcon = getMilestoneIcon(milestone, index);
                      
                      return (
                        <Timeline.Item
                          key={milestone.id}
                          color={milestoneColor}
                          dot={milestoneIcon}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Text strong>{milestone.name}</Text>
                                {milestone.isCriticalPath && (
                                  <Tag color="red">Critical Path</Tag>
                                )}
                                <Tag color={milestoneColor}>
                                  {milestone.budgetAllocation}% Budget
                                </Tag>
                              </div>
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
                            <Space>
                              <Button 
                                size="small" 
                                icon={<EyeOutlined />} 
                                title="View Details"
                                onClick={() => handleViewMilestone(milestone.id)}
                              />
                              <Button 
                                size="small" 
                                icon={<EditOutlined />} 
                                title="Edit Milestone"
                                onClick={() => handleEditMilestone(milestone.id)}
                              />
                              <Button 
                                size="small" 
                                danger 
                                icon={<DeleteOutlined />} 
                                title="Delete Milestone"
                                onClick={() => handleDeleteMilestone(milestone.id, milestone.name)}
                              />
                            </Space>
                          </div>
                        </Timeline.Item>
                      );
                    })}
                </Timeline>
              )}
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

        {/* Milestone View Modal */}
        <Modal
          title="Milestone Details"
          open={!!viewingMilestone}
          onCancel={() => setViewingMilestone(null)}
          footer={[
            <Button key="edit" type="primary" onClick={() => {
              if (viewingMilestone) {
                handleEditMilestone(viewingMilestone.id);
              }
            }}>
              Edit Milestone
            </Button>,
            <Button key="close" onClick={() => setViewingMilestone(null)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {viewingMilestone && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>
                  {viewingMilestone.name}
                  {viewingMilestone.isCriticalPath && (
                    <Tag color="red" style={{ marginLeft: '8px' }}>Critical Path</Tag>
                  )}
                </Title>
              </div>
              
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Sequence" span={1}>
                  {viewingMilestone.sequence}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {viewingMilestone.durationWeeks} weeks
                </Descriptions.Item>
                <Descriptions.Item label="Budget Allocation" span={1}>
                  <Tag color={getMilestoneColor(viewingMilestone, 0)}>
                    {viewingMilestone.budgetAllocation}%
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Critical Path">
                  {viewingMilestone.isCriticalPath ? (
                    <Tag color="red">Yes</Tag>
                  ) : (
                    <Tag color="green">No</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>

              {viewingMilestone.description && (
                <div style={{ marginTop: '16px' }}>
                  <Title level={5}>Description</Title>
                  <Paragraph>{viewingMilestone.description}</Paragraph>
                </div>
              )}

              {viewingMilestone.deliverables && (
                <div style={{ marginTop: '16px' }}>
                  <Title level={5}>Deliverables</Title>
                  <Paragraph>{viewingMilestone.deliverables}</Paragraph>
                </div>
              )}

              {viewingMilestone.dependencies && (
                <div style={{ marginTop: '16px' }}>
                  <Title level={5}>Dependencies</Title>
                  <Paragraph>{viewingMilestone.dependencies}</Paragraph>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
