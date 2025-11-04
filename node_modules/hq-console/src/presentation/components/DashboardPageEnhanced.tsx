// Presentation Layer - Enhanced Dashboard Page
'use client';

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
  Dropdown,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilterOutlined,
  PlusOutlined,
  UserAddOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useTranslations, useLocale } from 'next-intl';
import { Line, Bar, Column } from '@ant-design/plots';

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Types
interface DashboardStats {
  totalPlansInitiated: number;
  totalOpenPlans: number;
  totalClosedPlans: number;
  totalPartners: number;
  conversionRate: number;
  plansByRegion: { region: string; count: number }[];
  plansByStatus: { status: string; count: number }[];
}

interface RegionData {
  region: string;
  count: number;
  countries: { country: string; count: number }[];
}

interface PlansTrendData {
  period: string;
  initiated: number;
  closed: number;
  conversionRate: number;
}

const DashboardPageEnhanced: React.FC = () => {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [trendData, setTrendData] = useState<PlansTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    dateRange: 'ALL',
    region: null as string | null,
    industry: null as string | null,
    partnerTier: null as string | null,
    planType: null as string | null,
    status: null as string | null,
  });

  // Fetch data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.dateRange) params.set('dateRange', filters.dateRange);
      if (filters.region) params.set('region', filters.region);
      if (filters.industry) params.set('industry', filters.industry);
      if (filters.partnerTier) params.set('partnerTier', filters.partnerTier);
      if (filters.planType) params.set('planType', filters.planType);
      if (filters.status) params.set('status', filters.status);

      // Fetch all data in parallel
      const [statsRes, regionRes, trendRes] = await Promise.all([
        fetch(`/api/dashboard/stats?${params.toString()}`),
        fetch(`/api/dashboard/charts/clients-by-region?${params.toString()}`),
        fetch(`/api/dashboard/charts/plans-trend?period=monthly`),
      ]);

      if (!statsRes.ok || !regionRes.ok || !trendRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statsData = await statsRes.json();
      const regionDataRes = await regionRes.json();
      const trendDataRes = await trendRes.json();

      setStats(statsData);
      setRegionData(regionDataRes);
      setTrendData(trendDataRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export dashboard');
  };

  // Handle create plan
  const handleCreatePlan = () => {
    window.location.href = '/plans/builder';
  };

  // Handle invite partner
  const handleInvitePartner = () => {
    window.location.href = '/partners?action=create';
  };

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>{tCommon('loading')}</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <Alert
        message={tCommon('error')}
        description={error}
        type="error"
        showIcon
      />
    );
  }

  // Charts configuration
  const regionChartConfig = {
    data: regionData,
    xField: 'region',
    yField: 'count',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    meta: {
      region: {
        alias: t('filters.region'),
      },
      count: {
        alias: t('totalCustomers'),
      },
    },
  };

  const trendChartConfig = {
    data: trendData,
    xField: 'period',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: ['#1890ff', '#52c41a'],
  };

  // Transform trend data for chart
  const trendChartData = trendData.flatMap(item => [
    { period: new Date(item.period).toLocaleDateString(), value: item.initiated, type: 'Initiated' },
    { period: new Date(item.period).toLocaleDateString(), value: item.closed, type: 'Closed' },
  ]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>{t('title')}</Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreatePlan}
            >
              {t('actions.createPlan')}
            </Button>
            <Button
              icon={<UserAddOutlined />}
              onClick={handleInvitePartner}
            >
              {t('actions.invitePartner')}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              {t('actions.exportDashboard')}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
              loading={loading}
            />
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder={t('filters.dateRange')}
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(value) => setFilters({ ...filters, dateRange: value })}
              options={[
                { label: t('filters.thisMonth'), value: 'THIS_MONTH' },
                { label: t('filters.qtd'), value: 'QTD' },
                { label: t('filters.ytd'), value: 'YTD' },
                { label: t('filters.custom'), value: 'CUSTOM' },
                { label: tCommon('common.all'), value: 'ALL' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder={t('filters.region')}
              style={{ width: '100%' }}
              allowClear
              value={filters.region}
              onChange={(value) => setFilters({ ...filters, region: value })}
              options={[
                { label: t('regions.gcc'), value: 'GCC' },
                { label: t('regions.mena'), value: 'MENA' },
                { label: t('regions.apac'), value: 'APAC' },
                { label: t('regions.eu'), value: 'EU' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder={t('filters.industry')}
              style={{ width: '100%' }}
              allowClear
              value={filters.industry}
              onChange={(value) => setFilters({ ...filters, industry: value })}
              options={[
                { label: 'Technology', value: 'TECHNOLOGY' },
                { label: 'Healthcare', value: 'HEALTHCARE' },
                { label: 'Finance', value: 'FINANCE' },
                { label: 'Retail', value: 'RETAIL' },
                { label: 'Manufacturing', value: 'MANUFACTURING' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder={t('filters.planType')}
              style={{ width: '100%' }}
              allowClear
              value={filters.planType}
              onChange={(value) => setFilters({ ...filters, planType: value })}
              options={[
                { label: t('planTypes.rightTrack'), value: 'RIGHT_TRACK' },
                { label: t('planTypes.stayOnTrack'), value: 'STAY_ON_TRACK' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder={t('filters.status')}
              style={{ width: '100%' }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Suspended', value: 'SUSPENDED' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button
              block
              onClick={() => setFilters({
                dateRange: 'ALL',
                region: null,
                industry: null,
                partnerTier: null,
                planType: null,
                status: null,
              })}
            >
              {t('filters.clearFilters')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('totalPlansInitiated')}
              value={stats?.totalPlansInitiated || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('totalOpenPlans')}
              value={stats?.totalOpenPlans || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('totalClosedPlans')}
              value={stats?.totalClosedPlans || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('totalPartners')}
              value={stats?.totalPartners || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title={t('clientsByRegion')} style={{ height: 400 }}>
            <Column {...regionChartConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={t('plansTrend')} 
            extra={
              <Space>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {t('conversionRate')}: {stats?.conversionRate || 0}%
                </span>
              </Space>
            }
            style={{ height: 400 }}
          >
            <Line {...{ ...trendChartConfig, data: trendChartData }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPageEnhanced;

