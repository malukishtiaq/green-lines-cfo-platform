'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, Button, Select, DatePicker, Space, Statistic, Row, Col, Alert, Spin, Descriptions, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface ERPConnection {
  id: string;
  customerName: string;
  customerEmail: string;
  erpType: string;
  status: string;
}

interface KPIResult {
  kpiCode: string;
  kpiName: string;
  currentPeriod: { startDate: string; endDate: string; customerCount: number };
  previousPeriod: { startDate: string; endDate: string; customerCount: number };
  customerGrowth: number;
  formula: string;
  calculation: string;
  note?: string;
}

export default function NumCustomersKPIPage() {
  const [connections, setConnections] = useState<ERPConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(1, 'year').startOf('year'), dayjs().endOf('year')]);
  const [loading, setLoading] = useState(false);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [kpiResult, setKpiResult] = useState<KPIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadConnections(); }, []);

  const loadConnections = async () => {
    try {
      setLoadingConnections(true);
      const response = await fetch('/api/erp/connections');
      const data = await response.json();
      if (data.success && data.connections) {
        const connectedOnes = data.connections.filter((conn: ERPConnection) => conn.status === 'CONNECTED');
        setConnections(connectedOnes);
        if (connectedOnes.length > 0) setSelectedConnection(connectedOnes[0].id);
      }
    } catch (error: any) {
      setError('Failed to load ERP connections');
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleFetchKPI = async () => {
    if (!selectedConnection || !dateRange || !dateRange[0] || !dateRange[1]) {
      setError('Please select a connection and date range');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setKpiResult(null);
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      const url = `/api/erp/kpi/num-customers?connectionId=${selectedConnection}&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success && data.data) {
        setKpiResult(data.data);
      } else {
        setError(data.error || 'Failed to fetch KPI data');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch KPI data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <UserOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Number of Customers KPI</span>
            </Space>
          }
          extra={<Tag color="cyan" style={{ fontSize: '14px', padding: '4px 12px' }}>SALES.NUM_CUSTOMERS</Tag>}
        >
          <Card type="inner" title="Filters" style={{ marginBottom: '24px', backgroundColor: '#fafafa' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>ERP Connection</label>
                <Select style={{ width: '100%' }} placeholder="Select a connection" value={selectedConnection || undefined}
                  onChange={setSelectedConnection} loading={loadingConnections} disabled={loadingConnections || connections.length === 0}>
                  {connections.map((conn) => (
                    <Select.Option key={conn.id} value={conn.id}>
                      <Space><Tag color="green">{conn.erpType}</Tag>{conn.customerName} - {conn.customerEmail}</Space>
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Date Range</label>
                <RangePicker style={{ width: '100%' }} value={dateRange}
                  onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])} format="YYYY-MM-DD" disabled={loading} />
              </Col>
            </Row>
            <Row style={{ marginTop: '16px' }}>
              <Col span={24}>
                <Button type="primary" size="large" icon={<ReloadOutlined />} onClick={handleFetchKPI}
                  loading={loading} disabled={!selectedConnection || !dateRange} block>
                  Calculate Customer Count
                </Button>
              </Col>
            </Row>
          </Card>

          {error && <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError(null)} style={{ marginBottom: '24px' }} />}
          {loading && (
            <Card><div style={{ textAlign: 'center', padding: '40px' }}>
              <Space direction="vertical" align="center" size="large">
                <Spin size="large" /><span style={{ color: '#666', fontSize: '16px' }}>Fetching data from Odoo...</span>
              </Space></div></Card>
          )}

          {kpiResult && !loading && (
            <>
              <Card type="inner" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #13c2c2 0%, #08979c 100%)', color: 'white' }}>
                <Row gutter={[24, 24]} justify="center">
                  <Col xs={24} sm={12} md={8}>
                    <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Customer Growth</span>}
                      value={kpiResult.customerGrowth} precision={2} suffix="%"
                      valueStyle={{ color: 'white', fontSize: '48px', fontWeight: 'bold' }}
                      prefix={kpiResult.customerGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} />
                  </Col>
                </Row>
              </Card>
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12}>
                  <Card type="inner" styles={{ header: { backgroundColor: '#e6f7ff' } }} title="Current Period">
                    <Statistic title="Customer Count" value={kpiResult.currentPeriod.customerCount} valueStyle={{ color: '#1890ff' }} />
                    <p style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                      {dayjs(kpiResult.currentPeriod.startDate).format('MMM DD, YYYY')} - {dayjs(kpiResult.currentPeriod.endDate).format('MMM DD, YYYY')}
                    </p>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card type="inner" styles={{ header: { backgroundColor: '#fff7e6' } }} title="Previous Period">
                    <Statistic title="Customer Count" value={kpiResult.previousPeriod.customerCount} valueStyle={{ color: '#fa8c16' }} />
                    <p style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                      {dayjs(kpiResult.previousPeriod.startDate).format('MMM DD, YYYY')} - {dayjs(kpiResult.previousPeriod.endDate).format('MMM DD, YYYY')}
                    </p>
                  </Card>
                </Col>
              </Row>
              <Card type="inner" title="Calculation Details">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Formula"><code style={{ fontSize: '14px' }}>{kpiResult.formula}</code></Descriptions.Item>
                  <Descriptions.Item label="Calculation"><code style={{ fontSize: '14px' }}>{kpiResult.calculation}</code></Descriptions.Item>
                  {kpiResult.note && <Descriptions.Item label="Note"><Tag color="orange">{kpiResult.note}</Tag></Descriptions.Item>}
                </Descriptions>
              </Card>
            </>
          )}

          {!loading && !kpiResult && !error && (
            <Card><div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <UserOutlined style={{ fontSize: '72px', color: '#d9d9d9', marginBottom: '16px' }} />
              <h3 style={{ color: '#8c8c8c' }}>No Data Yet</h3>
              <p style={{ color: '#bfbfbf' }}>Select a connection and date range, then click "Calculate Customer Count"</p>
            </div></Card>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

