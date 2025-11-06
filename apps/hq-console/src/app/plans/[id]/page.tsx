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
  Progress,
  Statistic,
  Descriptions,
  Alert,
  Spin,
  Modal,
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  DollarOutlined,
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
  milestones: any[];
  features?: any;
  governancePolicy?: any;
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

  // Move useMemo here - BEFORE any conditional returns
  // Parse features JSON once
  const parsedFeatures = React.useMemo(() => {
    if (!plan) return null;
    try {
      const features = (plan as any)?.features;
      return typeof features === 'string' ? JSON.parse(features) : features;
    } catch {
      return null;
    }
  }, [plan]);

  const milestonesList = React.useMemo(() => {
    if (!plan || !parsedFeatures) return [];
    
    // Check if milestones are in the features JSON
    if (parsedFeatures?.milestones && Array.isArray(parsedFeatures.milestones)) {
      return parsedFeatures.milestones.map((m: any, idx: number) => ({
        id: m.id || String(idx),
        sequence: m.sequence ?? idx + 1,
        name: m.name,
        description: m.description || m.deliverables || '',
        durationWeeks: m.durationWeeks ?? 0,
        budgetAllocation: m.budgetAllocation ?? m.budgetPercent ?? 0,
        deliverables: m.deliverables,
        dependencies: Array.isArray(m.dependencies) ? m.dependencies.join(', ') : m.dependencies,
        isCriticalPath: Boolean(m.isCriticalPath ?? m.criticalPath),
        owner: m.owner || 'Unassigned',
      }));
    }
    return [];
  }, [plan, parsedFeatures]);

  const kpisList = React.useMemo(() => {
    if (!plan || !parsedFeatures) return [];
    
    // Priority 1: Check parsedFeatures.kpis
    if (parsedFeatures?.kpis && Array.isArray(parsedFeatures.kpis)) {
      return parsedFeatures.kpis;
    }
    
    // Priority 2: Check plan.kpis relations
    if ((plan as any).kpis && Array.isArray((plan as any).kpis)) {
      return (plan as any).kpis;
    }
    
    return [];
  }, [plan, parsedFeatures]);

  const assignmentsList = React.useMemo(() => {
    if (!plan || !parsedFeatures) return [];
    
    // Priority 1: Check parsedFeatures.assignments
    if (parsedFeatures?.assignments && Array.isArray(parsedFeatures.assignments)) {
      return parsedFeatures.assignments;
    }
    
    // Priority 2: Check plan.assignments relations
    if ((plan as any).assignments && Array.isArray((plan as any).assignments)) {
      return (plan as any).assignments;
    }
    
    return [];
  }, [plan, parsedFeatures]);

  const governanceData = React.useMemo(() => {
    if (!plan) return null;
    try {
      return typeof (plan as any).governancePolicy === 'string'
        ? JSON.parse((plan as any).governancePolicy)
        : (plan as any).governancePolicy;
    } catch {
      return null;
    }
  }, [plan]);

  const erpData = React.useMemo(() => {
    if (!plan) return null;
    try {
      const erpConnection = (plan as any)?.erpConnection;
      const parsedErp = typeof erpConnection === 'string' ? JSON.parse(erpConnection) : erpConnection;
      return {
        ...parsedErp,
        dataDomains: (plan as any)?.dataDomains || [],
      };
    } catch {
      return null;
    }
  }, [plan]);

  const pricingData = React.useMemo(() => {
    if (!plan || !parsedFeatures) return null;
    
    // Check if pricing data is nested or at root level
    if (parsedFeatures?.pricing) {
      return parsedFeatures.pricing;
    }
    
    // If pricing fields are at root level (new structure)
    if (parsedFeatures?.paymentTerms || parsedFeatures?.refundPolicy || parsedFeatures?.package) {
      return {
        package: parsedFeatures.package,
        addOns: parsedFeatures.addOns || [],
        basePrice: plan.price || 0,
        totalPrice: plan.price || 0,
        currency: parsedFeatures.currency || plan.currency || 'AED',
        billingFrequency: parsedFeatures.billingFrequency || 'MONTHLY',
        upfrontPaymentPct: parsedFeatures.upfrontPaymentPct || 0,
        platformCommissionPct: parsedFeatures.platformCommissionPct || 0,
        partnerCommissionPct: parsedFeatures.partnerCommissionPct || 0,
        payoutDelayDays: parsedFeatures.payoutDelayDays || 0,
        paymentTerms: parsedFeatures.paymentTerms || '',
        refundPolicy: parsedFeatures.refundPolicy || '',
        notes: parsedFeatures.notes || '',
      };
    }
    
    return null;
  }, [plan, parsedFeatures]);

  const totalDuration = React.useMemo(() => {
    return milestonesList.reduce((sum: number, milestone: any) => sum + (milestone.durationWeeks || 0), 0);
  }, [milestonesList]);

  const totalBudgetPercent = React.useMemo(() => {
    return milestonesList.reduce((sum: number, milestone: any) => sum + (milestone.budgetAllocation || 0), 0);
  }, [milestonesList]);

  const totalKPIWeight = React.useMemo(() => {
    return kpisList.reduce((sum: number, kpi: any) => sum + (kpi.weight || 0), 0);
  }, [kpisList]);

  const progress = React.useMemo(() => {
    if (!plan) return 0;
    // ServicePlan doesn't have currentStage/totalStages, so calculate based on completion
    // For now, if plan exists and has data, show 100% (you can enhance this later)
    return 100;
  }, [plan]);

  useEffect(() => {
    CleanArchitectureConfig.initialize();
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plans/${id}`);
      const data = await response.json();
      
      // Support both response shapes:
      // 1) Plain plan object
      // 2) { success: true, data: { ...plan } }
      if (data && data.id) {
        console.log('Plan details from API:', data);
        setPlan(data);
      } else if (data && data.success && data.data) {
        console.log('Plan details from API:', data.data);
        setPlan(data.data);
      } else {
        setError(data?.error || 'Failed to fetch plan details');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    window.location.href = `/plans/edit/${id}`;
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
                📋 {plan.name}
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>{plan.customer.name}</Text>
            </Col>
            <Col>
              <Space>
                <Tag color={statusColors[plan.status as keyof typeof statusColors]} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {statusLabels[plan.status as keyof typeof statusLabels]}
                </Tag>
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit} size="large">
                  Edit Plan
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Overview Card */}
        <Card style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Progress</span>}
                value={progress}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '24px' }}
              />
              <Progress percent={progress} strokeColor="#52c41a" showInfo={false} />
            </Col>
            <Col xs={24} md={6}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Plan Status</span>}
                value={plan.status.toUpperCase()}
                valueStyle={{ color: 'white', fontSize: '24px' }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Total Budget</span>}
                value={pricingData?.totalPrice || plan.price || 0}
                precision={0}
                suffix={pricingData?.currency || plan.currency}
                valueStyle={{ color: 'white', fontSize: '24px' }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Duration</span>}
                value={totalDuration}
                suffix="weeks"
                valueStyle={{ color: 'white', fontSize: '24px' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Step 1: Client & Scope Summary */}
        <Card size="small" style={{ marginBottom: 16 }} title="✅ Step 1: Client & Scope">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Statistic title="Plan Name" value={plan.name} valueStyle={{ fontSize: 16 }} />
            </Col>
            <Col xs={24} md={12}>
              <Statistic title="Client" value={plan.customer.name} valueStyle={{ fontSize: 16 }} />
            </Col>
            <Col xs={24} md={12}>
              <Statistic title="Industry" value={parsedFeatures?.industry || 'Not set'} valueStyle={{ fontSize: 16 }} />
            </Col>
            <Col xs={24} md={12}>
              <Statistic title="Company Size" value={parsedFeatures?.companySize || 'Not set'} valueStyle={{ fontSize: 16 }} />
            </Col>
            <Col xs={24} md={12}>
              <Statistic 
                title="Duration Type" 
                value={parsedFeatures?.planPeriod?.durationType || plan.duration ? 'FIXED' : 'Not set'} 
                valueStyle={{ fontSize: 16 }} 
              />
            </Col>
            {plan.duration && (
              <Col xs={24} md={12}>
                <Statistic title="Duration (Months)" value={plan.duration} valueStyle={{ fontSize: 16 }} />
              </Col>
            )}
          </Row>
          {plan.description && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Description:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{plan.description}</Paragraph>
            </div>
          )}
          {parsedFeatures?.objectives && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Objectives:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{parsedFeatures.objectives}</Paragraph>
            </div>
          )}
        </Card>

        {/* Step 2: ERP & Data Sources Summary */}
        <Card size="small" style={{ marginBottom: 16 }} title="✅ Step 2: Baseline & Data Sources">
          {erpData ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="ERP System">
                    <Tag color="blue">{erpData.type || 'Not configured'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Connection Status">
                    <Tag color={erpData.status === 'CONNECTED' ? 'green' : erpData.status === 'NOT_CONNECTED' ? 'red' : 'orange'}>
                      {erpData.status || 'Unknown'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mapping Health">
                    <Progress percent={erpData.mappingHealth || 0} size="small" status={erpData.mappingHealth >= 80 ? 'success' : erpData.mappingHealth >= 50 ? 'normal' : 'exception'} />
                  </Descriptions.Item>
                  {erpData.lastSync && (
                    <Descriptions.Item label="Last Sync">
                      {new Date(erpData.lastSync).toLocaleString()}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Data Domains to Sync:</Text>
                </div>
                {erpData.dataDomains && erpData.dataDomains.length > 0 ? (
                  <div>
                    {erpData.dataDomains.map((domain: string) => (
                      <Tag key={domain} color="green" style={{ marginBottom: 8 }}>
                        {domain}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">No data domains configured</Text>
                )}
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Text type="secondary">ERP and data source information not configured</Text>
              </Col>
            </Row>
          )}
        </Card>

        {/* Step 3: KPIs Summary */}
        <Card size="small" style={{ marginBottom: 16 }} title={`✅ Step 3: KPIs & Targets (${kpisList.length} KPIs)`}>
          {kpisList.length > 0 ? (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                  <Statistic 
                    title="Total KPIs" 
                    value={kpisList.length} 
                    valueStyle={{ fontSize: 16, color: '#1890ff' }} 
                  />
                </Col>
                <Col xs={24} md={12}>
                  <div>
                    <Text>Total Weight:</Text>
                    <Progress 
                      percent={totalKPIWeight} 
                      status={totalKPIWeight === 100 ? 'success' : totalKPIWeight > 100 ? 'exception' : 'normal'}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                </Col>
              </Row>
              <Table
                dataSource={kpisList}
                rowKey={(record, idx) => record.id || `kpi-${idx}`}
                size="small"
                pagination={false}
                scroll={{ x: 'max-content' }}
                columns={[
                  { title: 'KPI Code', dataIndex: 'kpiCode', key: 'kpiCode', width: 150 },
                  { title: 'KPI Name', dataIndex: 'kpiName', key: 'kpiName' },
                  { title: 'Target', dataIndex: 'targetValue', key: 'targetValue', width: 100 },
                  { title: 'Weight %', dataIndex: 'weight', key: 'weight', width: 100, render: (w: number) => `${w}%` },
                  { 
                    title: 'Thresholds', 
                    key: 'thresholds', 
                    width: 200,
                    render: (_: any, record: any) => (
                      <Space size={4}>
                        <Tag color="green">≥{record.thresholdGreen}</Tag>
                        <Tag color="orange">≥{record.thresholdAmber}</Tag>
                        <Tag color="red">&lt;{record.thresholdRed}</Tag>
                      </Space>
                    )
                  },
                ]}
              />
            </>
          ) : (
            <Paragraph type="secondary" style={{ textAlign: 'center', margin: '20px 0' }}>
              No KPIs added yet
            </Paragraph>
          )}
        </Card>

        {/* Step 4: Milestones Summary */}
        <Card size="small" style={{ marginBottom: 16 }} title={`✅ Step 4: Milestones & Timeline (${milestonesList.length} Milestones)`}>
          {milestonesList.length > 0 ? (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                  <Statistic 
                    title="Total Milestones" 
                    value={milestonesList.length} 
                    valueStyle={{ fontSize: 16, color: '#1890ff' }} 
                  />
                </Col>
                <Col xs={24} md={12}>
                  <div>
                    <Text>Budget Allocation:</Text>
                    <Progress 
                      percent={totalBudgetPercent} 
                      status={totalBudgetPercent === 100 ? 'success' : totalBudgetPercent > 100 ? 'exception' : 'normal'}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                </Col>
              </Row>
              <Table
                dataSource={milestonesList.sort((a, b) => a.sequence - b.sequence)}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ x: 'max-content' }}
                columns={[
                  { title: '#', dataIndex: 'sequence', key: 'sequence', width: 60 },
                  { title: 'Milestone Name', dataIndex: 'name', key: 'name' },
                  { title: 'Duration (weeks)', dataIndex: 'durationWeeks', key: 'durationWeeks', width: 130 },
                  { title: 'Budget %', dataIndex: 'budgetAllocation', key: 'budgetAllocation', width: 100, render: (b: number) => `${b}%` },
                  { 
                    title: 'Owner', 
                    dataIndex: 'owner', 
                    key: 'owner', 
                    width: 120,
                    render: (owner: string) => owner || 'Unassigned'
                  },
                  {
                    title: 'Critical',
                    dataIndex: 'isCriticalPath',
                    key: 'isCriticalPath',
                    width: 100,
                    render: (isCritical: boolean) => (
                      isCritical ? <Tag color="red">Critical</Tag> : <Tag color="green">Normal</Tag>
                    )
                  }
                ]}
              />
            </>
          ) : (
            <Paragraph type="secondary" style={{ textAlign: 'center', margin: '20px 0' }}>
              No milestones added yet
            </Paragraph>
          )}
        </Card>

        {/* Step 5: Workflow & Governance */}
        <Card size="small" style={{ marginBottom: 16 }} title="✅ Step 5: Workflow & Governance">
          {governanceData ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Statistic 
                  title="Approval Mode" 
                  value={governanceData.approvalMode || 'Not set'} 
                  valueStyle={{ fontSize: 16 }} 
                />
              </Col>
              <Col xs={24} md={12}>
                <Statistic 
                  title="Report Cadence" 
                  value={governanceData.reportCadence || 'Not set'} 
                  valueStyle={{ fontSize: 16 }} 
                />
              </Col>
              <Col xs={24} md={12}>
                <Statistic 
                  title="SLA Response Time" 
                  value={`${governanceData.slaResponseHours || 0} hours`} 
                  valueStyle={{ fontSize: 16 }} 
                />
              </Col>
              <Col xs={24} md={12}>
                <div>
                  <Text>Escalation Workflow:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color={governanceData.escalationEnabled ? 'green' : 'default'}>
                      {governanceData.escalationEnabled ? 'Enabled' : 'Disabled'}
                    </Tag>
                  </div>
                </div>
              </Col>
              {governanceData.notificationChannels && governanceData.notificationChannels.length > 0 && (
                <Col xs={24}>
                  <div>
                    <Text strong>Notification Channels:</Text>
                    <div style={{ marginTop: 8 }}>
                      {(Array.isArray(governanceData.notificationChannels) 
                        ? governanceData.notificationChannels 
                        : [governanceData.notificationChannels]
                      ).map((channel: string, idx: number) => (
                        <Tag key={idx} color="blue" style={{ marginBottom: 8 }}>{channel}</Tag>
                      ))}
                    </div>
                  </div>
                </Col>
              )}
              {governanceData.governanceNotes && (
                <Col xs={24}>
                  <div>
                    <Text strong>Notes:</Text>
                    <Paragraph style={{ marginTop: 8 }}>{governanceData.governanceNotes}</Paragraph>
                  </div>
                </Col>
              )}
            </Row>
          ) : (
            <Paragraph type="secondary" style={{ textAlign: 'center', margin: '20px 0' }}>
              No governance policy defined
            </Paragraph>
          )}
        </Card>

        {/* Step 6: Pricing Summary */}
        <Card size="small" style={{ marginBottom: 16 }} title="✅ Step 6: Pricing & Commercials">
          {pricingData ? (
            <>
              <Row gutter={[16, 24]}>
                <Col xs={24} md={8}>
                  <Statistic 
                    title="Base Package" 
                    value={pricingData.basePrice || 0} 
                    prefix={pricingData.currency || plan.currency} 
                    valueStyle={{ fontSize: 20, color: '#1890ff' }} 
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {pricingData.package || 'No package selected'}
                  </Text>
                </Col>
                <Col xs={24} md={8}>
                  <Statistic 
                    title="Add-ons Total" 
                    value={(pricingData.totalPrice || 0) - (pricingData.basePrice || 0)} 
                    prefix={pricingData.currency || plan.currency} 
                    valueStyle={{ fontSize: 20, color: '#52c41a' }} 
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {pricingData.addOns?.length || 0} add-on(s) selected
                  </Text>
                </Col>
                <Col xs={24} md={8}>
                  <Statistic 
                    title="Total Price" 
                    value={pricingData.totalPrice || plan.totalBudget} 
                    prefix={pricingData.currency || plan.currency} 
                    valueStyle={{ fontSize: 20, color: '#ff4d4f', fontWeight: 'bold' }} 
                  />
                </Col>
              </Row>
              {pricingData.addOns && pricingData.addOns.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Selected Add-ons:</Text>
                  <div style={{ marginTop: 8 }}>
                    {pricingData.addOns.map((addOn: string, idx: number) => (
                      <Tag key={idx} color="green" style={{ marginBottom: 8 }}>
                        {addOn}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              <Divider style={{ margin: '16px 0' }} />
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Text strong>Currency:</Text> <Text>{pricingData.currency || plan.currency}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Billing Frequency:</Text> <Text>{pricingData.billingFrequency || 'Not set'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Upfront Payment:</Text> <Text>{pricingData.upfrontPaymentPct || 0}%</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Platform Commission:</Text> <Text>{pricingData.platformCommissionPct || 0}%</Text>
                </Col>
              </Row>
              {pricingData.paymentTerms && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Payment Terms:</Text>
                  <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{pricingData.paymentTerms}</Paragraph>
                </div>
              )}
            </>
          ) : (
            <Paragraph type="secondary" style={{ textAlign: 'center', margin: '20px 0' }}>
              No pricing data defined
            </Paragraph>
          )}
        </Card>

        {/* Step 7: Assignments Summary */}
        <Card size="small" style={{ marginBottom: 16 }} title={`✅ Step 7: Assignments & Partners (${assignmentsList.length} Assignments)`}>
          {assignmentsList.length > 0 ? (
            <Table
              dataSource={assignmentsList}
              rowKey={(record, idx) => record.id || `assignment-${idx}`}
              size="small"
              pagination={false}
              scroll={{ x: 'max-content' }}
              columns={[
                { title: 'Type', dataIndex: 'type', key: 'type', width: 150 },
                { title: 'Owner', dataIndex: 'assignmentOwner', key: 'assignmentOwner', width: 100 },
                { 
                  title: 'Partner', 
                  dataIndex: 'partnerName', 
                  key: 'partnerName', 
                  width: 150,
                  render: (name: string) => name || <Text type="secondary">Unassigned</Text>
                },
                { title: 'SLA (hours)', dataIndex: 'slaHours', key: 'slaHours', width: 100 },
                { 
                  title: 'Due Date', 
                  dataIndex: 'dueDate', 
                  key: 'dueDate', 
                  width: 120, 
                  render: (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                },
                { 
                  title: 'Priority', 
                  dataIndex: 'priority', 
                  key: 'priority', 
                  width: 100, 
                  render: (priority: string) => {
                    const colors: Record<string, string> = { LOW: 'blue', MEDIUM: 'orange', HIGH: 'red', URGENT: 'red' };
                    return <Tag color={colors[priority] || 'default'}>{priority}</Tag>;
                  }
                },
              ]}
            />
          ) : (
            <Paragraph type="secondary" style={{ textAlign: 'center', margin: '20px 0' }}>
              No assignments created yet
            </Paragraph>
          )}
        </Card>

        {/* Validation & Warnings */}
        <Card size="small" style={{ backgroundColor: '#f0f5ff', borderColor: '#1890ff' }}>
          <Title level={5} style={{ marginTop: 0 }}>📌 Plan Summary</Title>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div>
              <Text type="success">✅ Plan name: {plan.name}</Text>
            </div>
            <div>
              {kpisList.length > 0 ? 
                <Text type="success">✅ {kpisList.length} KPI(s) configured (Weight: {totalKPIWeight}%)</Text> : 
                <Text type="warning">⚠️ No KPIs configured</Text>
              }
            </div>
            <div>
              {milestonesList.length > 0 ? (
                totalBudgetPercent === 100 ?
                  <Text type="success">✅ {milestonesList.length} Milestone(s) configured (Budget: {totalBudgetPercent}%)</Text> :
                  <Text type="warning">⚠️ Budget allocation: {totalBudgetPercent.toFixed(1)}% (target: 100%)</Text>
              ) : (
                <Text type="warning">⚠️ No milestones configured</Text>
              )}
            </div>
            <div>
              {pricingData ? 
                <Text type="success">✅ Pricing configured: {pricingData.currency || plan.currency} {pricingData.totalPrice || plan.totalBudget}</Text> : 
                <Text type="warning">⚠️ No pricing configured</Text>
              }
            </div>
            <div>
              {assignmentsList.length > 0 ? 
                <Text type="success">✅ {assignmentsList.length} Assignment(s) created</Text> : 
                <Text type="warning">⚠️ No assignments created</Text>
              }
            </div>
            <div>
              {governanceData ? 
                <Text type="success">✅ Governance policy configured</Text> : 
                <Text type="warning">⚠️ No governance policy configured</Text>
              }
            </div>
          </Space>
        </Card>

        {/* Customer Information Card */}
        <Card title="Customer Information" style={{ marginTop: 16 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Name">{plan.customer.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{plan.customer.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{plan.customer.phone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColors[plan.status as keyof typeof statusColors]}>
                {statusLabels[plan.status as keyof typeof statusLabels]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created">{new Date(plan.createdAt).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Last Modified">{new Date(plan.updatedAt).toLocaleDateString()}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </DashboardLayout>
  );
}
