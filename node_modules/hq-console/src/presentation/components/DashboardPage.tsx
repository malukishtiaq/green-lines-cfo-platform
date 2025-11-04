// Presentation Layer - Enhanced Dashboard Page
'use client';

import React, { useState, useEffect } from 'react';
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
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  UserAddOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Column, Line } from '@ant-design/plots';

const { Title } = Typography;

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
  
  const [filters, setFilters] = useState({
    dateRange: 'ALL',
    region: null as string | null,
  });

  // Fetch data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) params.set('dateRange', filters.dateRange);
      if (filters.region) params.set('region', filters.region);

      const [statsRes, regionRes, trendRes] = await Promise.all([
        fetch(`/api/dashboard/stats?${params.toString()}`, { cache: 'no-store' }),
        fetch(`/api/dashboard/charts/clients-by-region?${params.toString()}`, { cache: 'no-store' }),
        fetch(`/api/dashboard/charts/plans-trend?period=monthly`, { cache: 'no-store' }),
      ]);

      const statsData = await statsRes.json();
      const regionDataRes = await regionRes.json();
      const trendDataRes = await trendRes.json();

      setStats(statsData);
      setRegionData(regionDataRes);
      setTrendData(trendDataRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Charts configuration
  const regionChartConfig = {
    data: regionData,
    xField: 'region',
    yField: 'count',
    height: 300,
    label: false, // Disable labels on bars to avoid clutter
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

  // Transform trend data for chart
  const trendChartData = trendData.flatMap(item => [
    { period: new Date(item.period).toLocaleDateString(), value: item.initiated, type: 'Initiated' },
    { period: new Date(item.period).toLocaleDateString(), value: item.closed, type: 'Closed' },
  ]);

  const trendChartConfig = {
    data: trendChartData,
    xField: 'period',
    yField: 'value',
    seriesField: 'type',
    height: 300,
    smooth: true,
    color: ['#1890ff', '#52c41a'],
    legend: {
      position: 'top' as const,
    },
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
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Dashboard Overview - Enhanced ✨</Title>
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
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
            />
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Date Range"
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(value) => setFilters({ ...filters, dateRange: value })}
              options={[
                { label: 'This Month', value: 'THIS_MONTH' },
                { label: 'QTD', value: 'QTD' },
                { label: 'YTD', value: 'YTD' },
                { label: 'All Time', value: 'ALL' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Region"
              style={{ width: '100%' }}
              allowClear
              value={filters.region}
              onChange={(value) => setFilters({ ...filters, region: value })}
              options={[
                { label: 'GCC', value: 'GCC' },
                { label: 'MENA', value: 'MENA' },
                { label: 'APAC', value: 'APAC' },
                { label: 'EU', value: 'EU' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              onClick={() => setFilters({ dateRange: 'ALL', region: null })}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* NEW KPI Cards - Spec Compliant */}
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

      {/* NEW Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Clients by Region" style={{ minHeight: 400 }}>
            <Spin spinning={loading}>
              {regionData.length > 0 ? (
                <Column {...regionChartConfig} />
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
              <span style={{ fontSize: '14px', color: '#666' }}>
                Conversion Rate: {stats.conversionRate}%
              </span>
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
