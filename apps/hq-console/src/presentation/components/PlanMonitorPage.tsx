'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Tabs,
  Statistic,
  Space,
  Typography,
  Table,
  Tag,
  Progress,
  Timeline,
  Alert,
  Descriptions,
} from 'antd';
import {
  SyncOutlined,
  FileTextOutlined,
  SendOutlined,
  DownloadOutlined,
  LineChartOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Column, Line } from '@ant-design/plots';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface PlanMonitorPageProps {
  planId: string;
}

export const PlanMonitorPage: React.FC<PlanMonitorPageProps> = ({ planId }) => {
  const router = useRouter();

  // Filters State
  const [fiscalYear, setFiscalYear] = useState('2024');
  const [fiscalQuarter, setFiscalQuarter] = useState('All');
  const [fiscalPeriod, setFiscalPeriod] = useState('All');
  const [businessUnit, setBusinessUnit] = useState('All');
  const [activeTab, setActiveTab] = useState('overview');

  // Hardcoded Plan Data
  const planData = {
    id: planId,
    name: 'Financial Transformation Plan',
    client: 'Acme Corporation',
    period: 'Q4 2024',
    status: 'IN_PROGRESS',
    erpStatus: 'CONNECTED',
    lastSync: dayjs().subtract(2, 'hours').format('YYYY-MM-DD HH:mm'),
    mappingHealth: 92,
  };

  // Hardcoded KPI Data
  const kpiCardData = [
    {
      title: 'Milestones Completed',
      value: 12,
      total: 18,
      percentage: 66.67,
      trend: [
        { period: 'Week 1', value: 2 },
        { period: 'Week 2', value: 4 },
        { period: 'Week 3', value: 7 },
        { period: 'Week 4', value: 10 },
        { period: 'Week 5', value: 12 },
      ],
      type: 'bar',
    },
    {
      title: 'KPIs On Target',
      value: 8,
      total: 12,
      percentage: 66.67,
      breakdown: [
        { unit: 'Finance KPIs', value: 320 },
        { unit: 'Operations KPIs', value: 280 },
        { unit: 'Sales KPIs', value: 240 },
        { unit: 'HR KPIs', value: 160 },
      ],
      type: 'horizontal-bar',
    },
    {
      title: 'Tasks Overdue',
      value: 5,
      total: 45,
      percentage: 11.11,
      breakdown: [
        { period: 'Week 1', category: 'High', value: 2 },
        { period: 'Week 1', category: 'Medium', value: 1 },
        { period: 'Week 2', category: 'High', value: 1 },
        { period: 'Week 2', category: 'Medium', value: 3 },
        { period: 'Week 3', category: 'High', value: 2 },
        { period: 'Week 3', category: 'Low', value: 1 },
        { period: 'Week 4', category: 'Medium', value: 2 },
        { period: 'Week 5', category: 'High', value: 1 },
        { period: 'Week 5', category: 'Low', value: 2 },
      ],
      type: 'stacked-bar',
    },
    {
      title: 'Budget Utilization %',
      value: 68.5,
      breakdown: [
        { unit: 'Consulting', value: 85 },
        { unit: 'Technology', value: 72 },
        { unit: 'Training', value: 58 },
        { unit: 'Integration', value: 45 },
        { unit: 'Support', value: 35 },
      ],
      type: 'horizontal-bar-percent',
    },
    {
      title: 'Active Assignments',
      value: 24,
      total: 30,
      percentage: 80,
      trend: [
        { period: 'Week 1', value: 15 },
        { period: 'Week 2', value: 18 },
        { period: 'Week 3', value: 22 },
        { period: 'Week 4', value: 25 },
        { period: 'Week 5', value: 24 },
      ],
      type: 'bar',
    },
    {
      title: 'Avg Days to Complete',
      value: 4.2,
      trend: [
        { period: 'Jan', value: 6.5 },
        { period: 'Feb', value: 5.8 },
        { period: 'Mar', value: 5.2 },
        { period: 'Apr', value: 4.8 },
        { period: 'May', value: 4.5 },
        { period: 'Jun', value: 4.2 },
      ],
      type: 'line',
    },
    {
      title: 'Exception Rate %',
      value: 8.3,
      trend: [
        { period: 'Jan', value: 12.5 },
        { period: 'Feb', value: 11.2 },
        { period: 'Mar', value: 10.5 },
        { period: 'Apr', value: 9.8 },
        { period: 'May', value: 9.0 },
        { period: 'Jun', value: 8.3 },
      ],
      type: 'line',
    },
  ];

  // Render KPI Card with Chart
  const renderKPICard = (kpi: typeof kpiCardData[0]) => {
    let chartConfig: any = null;

    switch (kpi.type) {
      case 'bar':
        chartConfig = {
          data: kpi.trend || [],
          xField: 'period',
          yField: 'value',
          columnStyle: {
            radius: [4, 4, 0, 0],
          },
          color: '#1890ff',
          height: 120,
        };
        break;

      case 'horizontal-bar':
        chartConfig = {
          data: kpi.breakdown || [],
          xField: 'value',
          yField: 'unit',
          seriesField: 'unit',
          color: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
          height: 120,
        };
        break;

      case 'stacked-bar':
        chartConfig = {
          data: kpi.breakdown || [],
          xField: 'period',
          yField: 'value',
          seriesField: 'category',
          isStack: true,
          color: ['#f5222d', '#faad14', '#52c41a'],
          height: 120,
        };
        break;

      case 'horizontal-bar-percent':
        chartConfig = {
          data: kpi.breakdown || [],
          xField: 'value',
          yField: 'unit',
          seriesField: 'unit',
          color: ['#722ed1', '#eb2f96', '#fa8c16', '#13c2c2', '#52c41a'],
          height: 120,
          xAxis: {
            max: 100,
          },
        };
        break;

      case 'line':
        chartConfig = {
          data: kpi.trend || [],
          xField: 'period',
          yField: 'value',
          smooth: true,
          color: '#fa8c16',
          height: 120,
          point: {
            size: 3,
            shape: 'circle',
          },
          lineStyle: {
            lineWidth: 2,
          },
        };
        break;
    }

    return (
      <Card
        style={{ height: '100%', borderRadius: 8 }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {kpi.title}
          </Text>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text
            strong
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#262626',
            }}
          >
            {kpi.total ? (
              <>
                {kpi.value}
                <Text type="secondary" style={{ fontSize: 16, marginLeft: 4 }}>
                  / {kpi.total}
                </Text>
              </>
            ) : (
              kpi.value
            )}
          </Text>
          {kpi.percentage && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {kpi.percentage.toFixed(2)}%
              </Text>
            </div>
          )}
        </div>
        {chartConfig && (
          <div style={{ marginTop: 16 }}>
            {kpi.type === 'line' ? (
              <Line {...chartConfig} />
            ) : (
              <Column {...chartConfig} />
            )}
          </div>
        )}
      </Card>
    );
  };

  // Tab Content Components
  const OverviewTab = () => (
    <div>
      {/* KPI Cards Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiCardData.map((kpi, index) => (
          <Col key={index} xs={24} sm={12} lg={8} xl={6}>
            {renderKPICard(kpi)}
          </Col>
        ))}
      </Row>

      {/* Additional Overview Content */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Recent Milestones" style={{ marginBottom: 16 }}>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Financial Baseline Completed</Text>
                      <br />
                      <Text type="secondary">Completed 2 days ago</Text>
                    </>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>ERP Integration Phase 1</Text>
                      <br />
                      <Text type="secondary">Completed 5 days ago</Text>
                    </>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <>
                      <Text strong>KPI Dashboard Setup</Text>
                      <br />
                      <Text type="secondary">In Progress</Text>
                    </>
                  ),
                },
                {
                  color: 'gray',
                  children: (
                    <>
                      <Text strong>Final Review & Handoff</Text>
                      <br />
                      <Text type="secondary">Upcoming</Text>
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Active Alerts" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Alert
                message="Budget Alert"
                description="Consulting services at 85% budget utilization"
                type="warning"
                showIcon
              />
              <Alert
                message="Overdue Tasks"
                description="5 tasks are overdue and require attention"
                type="error"
                showIcon
              />
              <Alert
                message="Milestone Due Soon"
                description="KPI Dashboard Setup due in 3 days"
                type="info"
                showIcon
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const KPIsTab = () => {
    const kpiTableData = [
      {
        key: '1',
        kpi: 'Cash Flow Ratio',
        target: '1.5',
        actual: '1.62',
        variance: '+8.0%',
        status: 'green',
        owner: 'John Smith',
        lastUpdate: '2024-11-06',
      },
      {
        key: '2',
        kpi: 'Operating Margin',
        target: '25%',
        actual: '23.5%',
        variance: '-6.0%',
        status: 'amber',
        owner: 'Sarah Johnson',
        lastUpdate: '2024-11-05',
      },
      {
        key: '3',
        kpi: 'Revenue Growth',
        target: '15%',
        actual: '18.2%',
        variance: '+21.3%',
        status: 'green',
        owner: 'Mike Chen',
        lastUpdate: '2024-11-06',
      },
      {
        key: '4',
        kpi: 'Customer Acquisition Cost',
        target: '500 AED',
        actual: '650 AED',
        variance: '+30.0%',
        status: 'red',
        owner: 'Emma Wilson',
        lastUpdate: '2024-11-04',
      },
      {
        key: '5',
        kpi: 'Employee Turnover Rate',
        target: '10%',
        actual: '8.5%',
        variance: '-15.0%',
        status: 'green',
        owner: 'David Lee',
        lastUpdate: '2024-11-06',
      },
    ];

    const columns = [
      {
        title: 'KPI',
        dataIndex: 'kpi',
        key: 'kpi',
      },
      {
        title: 'Target',
        dataIndex: 'target',
        key: 'target',
      },
      {
        title: 'Actual',
        dataIndex: 'actual',
        key: 'actual',
      },
      {
        title: 'Variance',
        dataIndex: 'variance',
        key: 'variance',
        render: (variance: string) => (
          <Text
            style={{
              color: variance.startsWith('+') ? '#52c41a' : '#f5222d',
              fontWeight: 500,
            }}
          >
            {variance}
          </Text>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const colorMap: Record<string, string> = {
            green: 'success',
            amber: 'warning',
            red: 'error',
          };
          return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
        },
      },
      {
        title: 'Owner',
        dataIndex: 'owner',
        key: 'owner',
      },
      {
        title: 'Last Update',
        dataIndex: 'lastUpdate',
        key: 'lastUpdate',
      },
    ];

    return (
      <Card>
        <Table columns={columns} dataSource={kpiTableData} pagination={false} />
      </Card>
    );
  };

  const TasksTab = () => {
    const tasksData = [
      {
        key: '1',
        title: 'Complete Financial Analysis',
        kpiLink: 'Cash Flow Ratio',
        owner: 'John Smith',
        sla: '24h',
        dueDate: '2024-11-08',
        priority: 'High',
        status: 'In Progress',
      },
      {
        key: '2',
        title: 'Review Q4 Budget Variance',
        kpiLink: 'Operating Margin',
        owner: 'Sarah Johnson',
        sla: '48h',
        dueDate: '2024-11-10',
        priority: 'Medium',
        status: 'Backlog',
      },
      {
        key: '3',
        title: 'Prepare Sales Forecast',
        kpiLink: 'Revenue Growth',
        owner: 'Mike Chen',
        sla: '72h',
        dueDate: '2024-11-12',
        priority: 'High',
        status: 'In Progress',
      },
      {
        key: '4',
        title: 'Update Marketing Metrics',
        kpiLink: 'Customer Acquisition Cost',
        owner: 'Emma Wilson',
        sla: '24h',
        dueDate: '2024-11-07',
        priority: 'High',
        status: 'Blocked',
      },
    ];

    const columns = [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: 'KPI Link',
        dataIndex: 'kpiLink',
        key: 'kpiLink',
        render: (text: string) => <Tag color="blue">{text}</Tag>,
      },
      {
        title: 'Owner',
        dataIndex: 'owner',
        key: 'owner',
      },
      {
        title: 'SLA',
        dataIndex: 'sla',
        key: 'sla',
      },
      {
        title: 'Due Date',
        dataIndex: 'dueDate',
        key: 'dueDate',
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        render: (priority: string) => {
          const colorMap: Record<string, string> = {
            High: 'red',
            Medium: 'orange',
            Low: 'default',
          };
          return <Tag color={colorMap[priority]}>{priority}</Tag>;
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const colorMap: Record<string, string> = {
            'In Progress': 'processing',
            Backlog: 'default',
            Blocked: 'error',
            Done: 'success',
          };
          return <Tag color={colorMap[status]}>{status}</Tag>;
        },
      },
    ];

    return (
      <Card>
        <Table columns={columns} dataSource={tasksData} pagination={false} />
      </Card>
    );
  };

  const ExceptionsTab = () => {
    const exceptionsData = [
      {
        key: '1',
        type: 'Data Quality',
        severity: 'High',
        date: '2024-11-06',
        description: 'Missing AR data for 3 business units',
        owner: 'Unassigned',
        status: 'Open',
      },
      {
        key: '2',
        type: 'KPI Threshold',
        severity: 'Medium',
        date: '2024-11-05',
        description: 'Customer Acquisition Cost exceeded threshold by 30%',
        owner: 'Emma Wilson',
        status: 'In Progress',
      },
      {
        key: '3',
        type: 'Integration',
        severity: 'Low',
        date: '2024-11-04',
        description: 'ERP sync delay - 2 hours behind schedule',
        owner: 'System Admin',
        status: 'Resolved',
      },
    ];

    const columns = [
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Severity',
        dataIndex: 'severity',
        key: 'severity',
        render: (severity: string) => {
          const colorMap: Record<string, string> = {
            High: 'error',
            Medium: 'warning',
            Low: 'default',
          };
          return <Tag color={colorMap[severity]}>{severity}</Tag>;
        },
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Owner',
        dataIndex: 'owner',
        key: 'owner',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const colorMap: Record<string, string> = {
            Open: 'error',
            'In Progress': 'processing',
            Resolved: 'success',
          };
          return <Tag color={colorMap[status]}>{status}</Tag>;
        },
      },
    ];

    return (
      <Card>
        <Table columns={columns} dataSource={exceptionsData} pagination={false} />
      </Card>
    );
  };

  const IntegrationTab = () => (
    <Card>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="ERP Type">Odoo</Descriptions.Item>
        <Descriptions.Item label="Connection Status">
          <Tag color="success">Connected</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Last Sync">
          {planData.lastSync}
        </Descriptions.Item>
        <Descriptions.Item label="Mapping Health">
          <Progress percent={planData.mappingHealth} status="active" />
        </Descriptions.Item>
        <Descriptions.Item label="Data Domains" span={2}>
          <Space wrap>
            <Tag color="blue">AR (Accounts Receivable)</Tag>
            <Tag color="blue">AP (Accounts Payable)</Tag>
            <Tag color="blue">GL (General Ledger)</Tag>
            <Tag color="blue">Sales Orders</Tag>
          </Space>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        <Title level={5}>Recent Sync Logs</Title>
        <Timeline
          items={[
            {
              color: 'green',
              children: (
                <>
                  <Text>Sync completed successfully - 247 records updated</Text>
                  <br />
                  <Text type="secondary">{planData.lastSync}</Text>
                </>
              ),
            },
            {
              color: 'green',
              children: (
                <>
                  <Text>Sync completed successfully - 189 records updated</Text>
                  <br />
                  <Text type="secondary">
                    {dayjs().subtract(6, 'hours').format('YYYY-MM-DD HH:mm')}
                  </Text>
                </>
              ),
            },
            {
              color: 'orange',
              children: (
                <>
                  <Text>Sync completed with warnings - 3 records skipped</Text>
                  <br />
                  <Text type="secondary">
                    {dayjs().subtract(12, 'hours').format('YYYY-MM-DD HH:mm')}
                  </Text>
                </>
              ),
            },
          ]}
        />
      </div>
    </Card>
  );

  const ActivityLogTab = () => {
    const activityData = [
      {
        key: '1',
        who: 'John Smith',
        what: 'Updated KPI Target',
        before: 'Cash Flow Ratio: 1.4',
        after: 'Cash Flow Ratio: 1.5',
        reason: 'Adjusted based on Q4 forecast',
        timestamp: '2024-11-06 14:30',
      },
      {
        key: '2',
        who: 'Sarah Johnson',
        what: 'Completed Milestone',
        before: 'Status: In Progress',
        after: 'Status: Completed',
        reason: 'All deliverables met',
        timestamp: '2024-11-06 10:15',
      },
      {
        key: '3',
        who: 'System',
        what: 'ERP Sync Completed',
        before: 'Last Sync: 6 hours ago',
        after: 'Last Sync: Now',
        reason: 'Scheduled sync',
        timestamp: '2024-11-06 09:00',
      },
    ];

    const columns = [
      {
        title: 'Who',
        dataIndex: 'who',
        key: 'who',
      },
      {
        title: 'What',
        dataIndex: 'what',
        key: 'what',
      },
      {
        title: 'Before',
        dataIndex: 'before',
        key: 'before',
      },
      {
        title: 'After',
        dataIndex: 'after',
        key: 'after',
      },
      {
        title: 'Reason',
        dataIndex: 'reason',
        key: 'reason',
      },
      {
        title: 'Timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp',
      },
    ];

    return (
      <Card>
        <Table columns={columns} dataSource={activityData} pagination={false} />
      </Card>
    );
  };

  const ReportsTab = () => (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="Report Templates"
          description="Select a template below to generate a comprehensive report for this plan."
          type="info"
          showIcon
        />

        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Executive Summary"
                value=""
                prefix={<FileTextOutlined />}
              />
              <Button type="primary" block style={{ marginTop: 16 }}>
                Generate
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="CFO Deep-Dive"
                value=""
                prefix={<LineChartOutlined />}
              />
              <Button type="primary" block style={{ marginTop: 16 }}>
                Generate
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Operations Report"
                value=""
                prefix={<SettingOutlined />}
              />
              <Button type="primary" block style={{ marginTop: 16 }}>
                Generate
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Exceptions Only"
                value=""
                prefix={<ExclamationCircleOutlined />}
              />
              <Button type="primary" block style={{ marginTop: 16 }}>
                Generate
              </Button>
            </Card>
          </Col>
        </Row>
      </Space>
    </Card>
  );

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: <OverviewTab />,
    },
    {
      key: 'kpis',
      label: 'KPIs',
      children: <KPIsTab />,
    },
    {
      key: 'tasks',
      label: 'Tasks & Risks',
      children: <TasksTab />,
    },
    {
      key: 'exceptions',
      label: 'Exceptions',
      children: <ExceptionsTab />,
    },
    {
      key: 'integration',
      label: 'Integration',
      children: <IntegrationTab />,
    },
    {
      key: 'activity',
      label: 'Activity Log',
      children: <ActivityLogTab />,
    },
    {
      key: 'reports',
      label: 'Reports',
      children: <ReportsTab />,
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                {planData.name}
              </Title>
            </Space>
          </Col>
          <Col>
            <Space wrap>
              <Button icon={<SyncOutlined />}>Sync Now</Button>
              <Button icon={<FileTextOutlined />}>Generate Report</Button>
              <Button icon={<SendOutlined />}>Publish to CFO App</Button>
              <Button icon={<DownloadOutlined />}>Export</Button>
              <Button icon={<LineChartOutlined />}>Reforecast</Button>
              <Button icon={<ExclamationCircleOutlined />} danger>
                Escalate
              </Button>
              <Button icon={<CalendarOutlined />}>Book Meeting</Button>
            </Space>
          </Col>
        </Row>

        {/* Plan Info Bar */}
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary">Client:</Text>
            <br />
            <Text strong>{planData.client}</Text>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary">Period:</Text>
            <br />
            <Text strong>{planData.period}</Text>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary">Status:</Text>
            <br />
            <Tag color="processing">{planData.status}</Tag>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary">ERP Status:</Text>
            <br />
            <Tag color="success">{planData.erpStatus}</Tag>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary">Last Sync:</Text>
            <br />
            <Text strong>{planData.lastSync}</Text>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary">Mapping Health:</Text>
            <br />
            <Progress
              percent={planData.mappingHealth}
              size="small"
              style={{ width: 100 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Filters Bar */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <FilterOutlined style={{ fontSize: 18 }} />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Fiscal Year
            </Text>
            <Select
              value={fiscalYear}
              onChange={setFiscalYear}
              style={{ width: '100%' }}
            >
              <Option value="2022">2022</Option>
              <Option value="2023">2023</Option>
              <Option value="2024">2024</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Fiscal Quarter
            </Text>
            <Select
              value={fiscalQuarter}
              onChange={setFiscalQuarter}
              style={{ width: '100%' }}
            >
              <Option value="All">All</Option>
              <Option value="Q1">Q1</Option>
              <Option value="Q2">Q2</Option>
              <Option value="Q3">Q3</Option>
              <Option value="Q4">Q4</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Fiscal Period
            </Text>
            <Select
              value={fiscalPeriod}
              onChange={setFiscalPeriod}
              style={{ width: '100%' }}
            >
              <Option value="All">All</Option>
              <Option value="Jan">January</Option>
              <Option value="Feb">February</Option>
              <Option value="Mar">March</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Business Unit
            </Text>
            <Select
              value={businessUnit}
              onChange={setBusinessUnit}
              style={{ width: '100%' }}
            >
              <Option value="All">All</Option>
              <Option value="Finance">Finance</Option>
              <Option value="Operations">Operations</Option>
              <Option value="Sales">Sales</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Tabs with Content */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

