'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Spin,
  Alert,
  message,
  Statistic,
  Row,
  Col,
  Select,
} from 'antd';
import {
  ReloadOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface ERPConnection {
  id: string;
  customerId: string;
  customerName: string;
  erpType: string;
  status: string;
}

interface POSOrder {
  id: string;
  name: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  partner?: string;
  session?: string;
}

export default function ERPTestPage() {
  const [connections, setConnections] = useState<ERPConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/erp/connections');
      const result = await response.json();
      
      console.log('📊 All ERP Connections:', result);
      
      if (result.success && result.connections.length > 0) {
        console.log('✅ Found connections:', result.connections);
        
        // Show all Odoo connections, even if not fully connected
        const odooConnections = result.connections.filter(
          (c: ERPConnection) => c.erpType === 'ODOO'
        );
        
        console.log('🔌 Odoo connections:', odooConnections);
        
        setConnections(odooConnections);
        
        if (odooConnections.length > 0) {
          setSelectedConnection(odooConnections[0].id);
          
          // Show warning if not connected
          if (odooConnections[0].status !== 'CONNECTED') {
            message.warning(`Connection status is: ${odooConnections[0].status}. Please complete the connection from ERP Integration page.`);
          }
        }
      } else {
        console.log('❌ No connections found');
      }
    } catch (err: any) {
      console.error('Error fetching connections:', err);
      message.error('Failed to load ERP connections');
    } finally {
      setLoading(false);
    }
  };

  const fetchPOSOrders = async () => {
    if (!selectedConnection) {
      message.warning('Please select an ERP connection');
      return;
    }

    try {
      setFetchingOrders(true);
      setError('');
      
      // Call our custom endpoint to fetch POS orders
      const response = await fetch(`/api/erp/test/pos-orders?connectionId=${selectedConnection}`);
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
        message.success(`Successfully fetched ${result.data.length} POS orders from Odoo!`);
      } else {
        setError(result.error || 'Failed to fetch orders');
        message.error(result.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      console.error('Error fetching POS orders:', err);
      setError(err.message || 'Failed to fetch orders');
      message.error('Failed to fetch orders');
    } finally {
      setFetchingOrders(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalAmount: orders.reduce((sum, order) => sum + order.amount, 0),
    paidOrders: orders.filter(o => o.status === 'paid' || o.status === 'invoiced').length,
  };

  const columns = [
    {
      title: 'Order Ref',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Session',
      dataIndex: 'session',
      key: 'session',
    },
    {
      title: 'Customer',
      dataIndex: 'partner',
      key: 'partner',
      render: (partner: string) => partner || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: POSOrder) => (
        <strong style={{ color: '#52c41a' }}>
          {amount.toFixed(2)} {record.currency}
        </strong>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          paid: 'success',
          invoiced: 'success',
          done: 'success',
          draft: 'default',
          cancel: 'error',
        };
        return <Tag color={colorMap[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          ERP Integration Test - POS Orders
        </h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          Testing live data retrieval from connected Odoo ERP system
        </p>
      </div>

      {/* Connection Selection */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <span>Select ERP Connection:</span>
            <Select
              value={selectedConnection}
              onChange={setSelectedConnection}
              style={{ width: 300 }}
              loading={loading}
              disabled={loading || connections.length === 0}
            >
              {connections.map((conn) => (
                <Select.Option key={conn.id} value={conn.id}>
                  {conn.customerName} - {conn.erpType}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchPOSOrders}
            loading={fetchingOrders}
            disabled={!selectedConnection}
          >
            Fetch POS Orders from Odoo
          </Button>
        </Space>
      </Card>

      {connections.length === 0 && !loading && (
        <Alert
          message="No ERP Connections Found"
          description={
            <div>
              <p>No Odoo ERP connections have been created yet.</p>
              <p><strong>Steps to create a connection:</strong></p>
              <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Go to <strong>ERP Integration → Connections</strong></li>
                <li>Click <strong>"New Connection"</strong></li>
                <li>Select a customer and enter Odoo credentials</li>
                <li>Click <strong>"Test Connection"</strong> to verify</li>
                <li>Click <strong>"Connect"</strong> button to save</li>
              </ol>
            </div>
          }
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => window.location.href = '/erp'}>
              Go to ERP Integration
            </Button>
          }
        />
      )}

      {error && (
        <Alert
          message="Error Fetching Data"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Statistics */}
      {orders.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Amount"
                value={stats.totalAmount}
                precision={2}
                suffix="AED"
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Paid Orders"
                value={stats.paidOrders}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Orders Table */}
      {fetchingOrders ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" tip="Fetching POS orders from Odoo..." />
          </div>
        </Card>
      ) : orders.length > 0 ? (
        <Card
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>POS Orders from Odoo</span>
              <Tag color="green">Live Data</Tag>
            </Space>
          }
        >
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showTotal: (total) => `Total ${total} orders`,
            }}
          />
        </Card>
      ) : (
        !error && (
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <ShoppingCartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <p>Click "Fetch POS Orders from Odoo" button above to load data</p>
            </div>
          </Card>
        )
      )}
    </div>
  );
}

