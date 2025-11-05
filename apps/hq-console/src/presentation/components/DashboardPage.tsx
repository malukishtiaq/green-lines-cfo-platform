// Presentation Layer - Comprehensive Enhanced Dashboard Page
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Select,
  Button,
  Space,
  Typography,
  Spin,
  Switch,
  Dropdown,
  DatePicker,
  message,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  UserAddOutlined,
  DownloadOutlined,
  ReloadOutlined,
  BarChartOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Column, Line } from '@ant-design/plots';
import type { MenuProps } from 'antd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import RegionalMap from './RegionalMap';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface DashboardFilters {
  dateRange: string;
  industry: string | null;
  partnerTier: string | null;
  planType: string | null;
  status: string | null;
  customDateRange?: [Date, Date] | null;
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlansInitiated: 0,
    totalOpenPlans: 0,
    totalClosedPlans: 0,
    totalPartners: 0,
    conversionRate: 0,
  });
  const [regionData, setRegionData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [regionViewMode, setRegionViewMode] = useState<'bar' | 'map'>('bar');
  const [trendPeriod, setTrendPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [globalRegion, setGlobalRegion] = useState<string | null>(null); // Global region from user preferences
  
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: 'ALL',
    industry: null,
    partnerTier: null,
    planType: null,
    status: null,
    customDateRange: null,
  });

  const dashboardRef = useRef<HTMLDivElement>(null);

  // Fetch global user preferences (including region)
  useEffect(() => {
    const fetchGlobalPreferences = async () => {
      try {
        const res = await fetch('/api/user/preferences');
        if (res.ok) {
          const data = await res.json();
          setGlobalRegion(data.defaultRegion || null);
        }
      } catch (error) {
        console.error('Error fetching global preferences:', error);
      }
    };
    fetchGlobalPreferences();
  }, []);

  // Fetch data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) params.set('dateRange', filters.dateRange);
      if (globalRegion) params.set('region', globalRegion); // Use global region
      if (filters.industry) params.set('industry', filters.industry);
      if (filters.partnerTier) params.set('partnerTier', filters.partnerTier);
      if (filters.planType) params.set('planType', filters.planType);
      if (filters.status) params.set('status', filters.status);
      if (filters.customDateRange && filters.customDateRange[0]) {
        params.set('startDate', filters.customDateRange[0].toISOString());
      }

      const [statsRes, regionRes, trendRes] = await Promise.all([
        fetch(`/api/dashboard/stats?${params.toString()}`, { cache: 'no-store' }),
        fetch(`/api/dashboard/charts/clients-by-region?${params.toString()}`, { cache: 'no-store' }),
        fetch(`/api/dashboard/charts/plans-trend?period=${trendPeriod}&${params.toString()}`, { cache: 'no-store' }),
      ]);

      const statsData = await statsRes.json();
      const regionDataRes = await regionRes.json();
      const trendDataRes = await trendRes.json();

      setStats(statsData);
      setRegionData(regionDataRes);
      setTrendData(trendDataRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, trendPeriod, globalRegion]); // Added globalRegion

  // Export handlers
  const exportToPDF = async () => {
    if (!dashboardRef.current) return;
    
    message.loading({ content: 'Generating PDF...', key: 'export' });
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
      
      message.success({ content: 'PDF downloaded successfully!', key: 'export' });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.error({ content: 'Failed to export PDF', key: 'export' });
    }
  };

  const exportToPNG = async () => {
    if (!dashboardRef.current) return;
    
    message.loading({ content: 'Generating PNG...', key: 'export' });
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `dashboard-${new Date().toISOString().split('T')[0]}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          message.success({ content: 'PNG downloaded successfully!', key: 'export' });
        }
      });
    } catch (error) {
      console.error('Error exporting PNG:', error);
      message.error({ content: 'Failed to export PNG', key: 'export' });
    }
  };

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'pdf',
      label: 'Export as PDF',
      onClick: exportToPDF,
    },
    {
      key: 'png',
      label: 'Export as PNG',
      onClick: exportToPNG,
    },
  ];

  // Charts configuration
  const regionChartConfig = {
    data: regionData,
    xField: 'region',
    yField: 'count',
    height: 300,
    label: false,
    tooltip: {
      customContent: (title: string, items: any[]) => {
        if (!items || items.length === 0) return '';
        const regionInfo = regionData.find(r => r.region === title);
        if (!regionInfo) return '';
        
        let html = `<div style="padding: 12px; min-width: 180px;">`;
        html += `<div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${title}</div>`;
        html += `<div style="color: #666; margin-bottom: 8px;">Total Clients: <strong>${regionInfo.count}</strong></div>`;
        if (regionInfo.countries && regionInfo.countries.length > 0) {
          html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">`;
          html += `<div style="font-size: 12px; color: #888; margin-bottom: 4px;">Country Breakdown:</div>`;
          regionInfo.countries.forEach((c: any) => {
            html += `<div style="margin: 4px 0; font-size: 12px; display: flex; justify-content: space-between;">
              <span>• ${c.country}</span>
              <span style="font-weight: 500; margin-left: 12px;">${c.count}</span>
            </div>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
        return html;
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
        autoHide: false,
        style: {
          fontSize: 12,
        }
      }
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v}`,
      },
    },
    meta: {
      region: { alias: 'Region' },
      count: { alias: 'Clients' },
    },
  };

  // Transform trend data for line chart with conversion rate
  const trendChartData = trendData.flatMap(item => [
    {
      period: new Date(item.period).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: item.initiated,
      type: 'Initiated',
    },
    {
      period: new Date(item.period).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: item.closed,
      type: 'Closed',
    },
  ]);

  const trendChartConfig = {
    data: trendChartData,
    xField: 'period',
    yField: 'value',
    seriesField: 'type',
    height: 300,
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    lineStyle: {
      lineWidth: 2,
    },
    point: {
      size: 4,
      shape: 'circle',
    },
    legend: {
      position: 'top' as const,
    },
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false,
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v}`,
      },
    },
    tooltip: {
      shared: true,
      showMarkers: true,
    },
  };

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: 'ALL',
      industry: null,
      partnerTier: null,
      planType: null,
      status: null,
      customDateRange: null,
    });
  };

  if (loading && regionData.length === 0 && trendData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div ref={dashboardRef}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Dashboard Overview</Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => window.location.href = '/plans/new'}
            >
              Create Plan
            </Button>
            <Button
              icon={<UserAddOutlined />}
              onClick={() => window.location.href = '/partners?action=create'}
            >
              Invite Partner
            </Button>
            <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
              <Button icon={<DownloadOutlined />}>
                Export Dashboard
              </Button>
            </Dropdown>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
            />
          </Space>
        </Col>
      </Row>

      {/* Comprehensive Filters Panel */}
      <Card title="Filters" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Date Range"
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              options={[
                { label: 'This Month', value: 'THIS_MONTH' },
                { label: 'QTD', value: 'QTD' },
                { label: 'YTD', value: 'YTD' },
                { label: 'All Time', value: 'ALL' },
                { label: 'Custom', value: 'CUSTOM' },
              ]}
            />
          </Col>
          {filters.dateRange === 'CUSTOM' && (
            <Col xs={24} sm={12} md={6} lg={4}>
              <RangePicker
                style={{ width: '100%' }}
                onChange={(dates) => handleFilterChange('customDateRange', dates as any)}
              />
            </Col>
          )}
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Industry"
              style={{ width: '100%' }}
              allowClear
              value={filters.industry}
              onChange={(value) => handleFilterChange('industry', value)}
              options={[
                { label: 'Technology', value: 'Technology' },
                { label: 'Manufacturing', value: 'Manufacturing' },
                { label: 'Retail', value: 'Retail' },
                { label: 'Healthcare', value: 'Healthcare' },
                { label: 'Finance', value: 'Finance' },
                { label: 'Real Estate', value: 'Real Estate' },
                { label: 'Education', value: 'Education' },
                { label: 'Logistics', value: 'Logistics' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Partner Tier"
              style={{ width: '100%' }}
              allowClear
              value={filters.partnerTier}
              onChange={(value) => handleFilterChange('partnerTier', value)}
              options={[
                { label: 'Platinum', value: 'PLATINUM' },
                { label: 'Gold', value: 'GOLD' },
                { label: 'Silver', value: 'SILVER' },
                { label: 'Bronze', value: 'BRONZE' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Plan Type"
              style={{ width: '100%' }}
              allowClear
              value={filters.planType}
              onChange={(value) => handleFilterChange('planType', value)}
              options={[
                { label: 'Basic CFO', value: 'BASIC_CFO' },
                { label: 'Premium CFO', value: 'PREMIUM_CFO' },
                { label: 'Enterprise CFO', value: 'ENTERPRISE_CFO' },
                { label: 'Consulting', value: 'CONSULTING' },
                { label: 'Audit', value: 'AUDIT' },
                { label: 'Tax Filing', value: 'TAX_FILING' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Status"
              style={{ width: '100%' }}
              allowClear
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { label: 'Open', value: 'ACTIVE' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Closed', value: 'COMPLETED' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button
              block
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Plans Initiated"
              value={stats.totalPlansInitiated}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Open Plans"
              value={stats.totalOpenPlans}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Closed Plans"
              value={stats.totalClosedPlans}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Partners"
              value={stats.totalPartners}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Clients by Region" 
            extra={
              <Space>
                <Switch
                  checked={regionViewMode === 'map'}
                  checkedChildren={<GlobalOutlined />}
                  unCheckedChildren={<BarChartOutlined />}
                  onChange={(checked) => setRegionViewMode(checked ? 'map' : 'bar')}
                />
              </Space>
            }
            style={{ minHeight: 400 }}
          >
            <Spin spinning={loading}>
              {regionData.length > 0 ? (
                regionViewMode === 'bar' ? (
                  <Column {...regionChartConfig} />
                ) : (
                  <RegionalMap data={regionData} />
                )
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  No regional data available
                </div>
              )}
            </Spin>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Plans Trend: Total vs Closed" 
            extra={
              <Space>
                <Select
                  value={trendPeriod}
                  onChange={setTrendPeriod}
                  style={{ width: 120 }}
                  options={[
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Quarterly', value: 'quarterly' },
                  ]}
                />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  Conv. Rate: {stats.conversionRate}%
                </span>
              </Space>
            }
            style={{ minHeight: 400 }}
          >
            <Spin spinning={loading}>
              {trendData.length > 0 ? (
                <Line {...trendChartConfig} />
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  No trend data available
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
