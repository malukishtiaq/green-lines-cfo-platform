'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, Button, Select, DatePicker, Space, Statistic, Row, Col, Alert, Spin, Descriptions, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons';
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
  period: { startDate: string; endDate: string };
  employeesDeparted: number;
  avgEmployees: number;
  turnoverRate: number;
  formula: string;
  calculation: string;
  note?: string;
}

export default function EmployeeTurnoverKPIPage() {
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
      const url = `/api/erp/kpi/employee-turnover?connectionId=${selectedConnection}&startDate=${startDate}&endDate=${endDate}`;
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
              <TeamOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Employee Turnover Rate KPI</span>
            </Space>
          }
          extra={<Tag color="red" style={{ fontSize: '14px', padding: '4px 12px' }}>HR.TURNOVER%</Tag>}
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
                  Calculate Turnover Rate
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
              <Card type="inner" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)', color: 'white' }}>
                <Row gutter={[24, 24]} justify="center">
                  <Col xs={24} sm={12} md={8}>
                    <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Employee Turnover Rate</span>}
                      value={kpiResult.turnoverRate} precision={2} suffix="%"
                      valueStyle={{ color: 'white', fontSize: '48px', fontWeight: 'bold' }}
                      prefix={kpiResult.turnoverRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} />
                  </Col>
                </Row>
              </Card>
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12}>
                  <Card type="inner"><Statistic title="Employees Departed" value={kpiResult.employeesDeparted} valueStyle={{ color: '#ff4d4f' }} /></Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card type="inner"><Statistic title="Average Employees" value={kpiResult.avgEmployees} valueStyle={{ color: '#1890ff' }} /></Card>
                </Col>
              </Row>
              <Card type="inner" title="Calculation Details">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Formula"><code style={{ fontSize: '14px' }}>{kpiResult.formula}</code></Descriptions.Item>
                  <Descriptions.Item label="Calculation"><code style={{ fontSize: '14px' }}>{kpiResult.calculation}</code></Descriptions.Item>
                  <Descriptions.Item label="Period">
                    {dayjs(kpiResult.period.startDate).format('MMM DD, YYYY')} - {dayjs(kpiResult.period.endDate).format('MMM DD, YYYY')}
                  </Descriptions.Item>
                  {kpiResult.note && <Descriptions.Item label="Note"><Tag color="orange">{kpiResult.note}</Tag></Descriptions.Item>}
                </Descriptions>
              </Card>
            </>
          )}

          {!loading && !kpiResult && !error && (
            <Card><div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <TeamOutlined style={{ fontSize: '72px', color: '#d9d9d9', marginBottom: '16px' }} />
              <h3 style={{ color: '#8c8c8c' }}>No Data Yet</h3>
              <p style={{ color: '#bfbfbf' }}>Select a connection and date range, then click "Calculate Turnover Rate"</p>
            </div></Card>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

