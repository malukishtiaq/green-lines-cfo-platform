'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  message,
  Empty,
  Spin,
  Modal,
  Statistic,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ERPConfigurationForm } from '@/presentation/components/ERPConfigurationForm';
import { ERPConnectionStatus } from '@/presentation/components/ERPConnectionStatus';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  industry?: string;
}

interface ERPConnection {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  erpType: string;
  status: string;
  lastSyncDate: string | null;
  lastSyncStatus: string | null;
  mappingHealth: number;
  dataDomains: string[];
  createdAt: string;
}

type ERPIntegrationTranslations = {
  reconnect: string;
  reconnectSuccess: string;
  reconnectError: string;
  refreshStatus: string;
  syncData: string;
  sessionExpiredTitle: string;
  sessionExpiredDescription: string;
};

const DEFAULT_TRANSLATIONS: ERPIntegrationTranslations = {
  reconnect: 'Reconnect',
  reconnectSuccess: 'ERP connection restored successfully.',
  reconnectError: 'Failed to reconnect ERP connection.',
  refreshStatus: 'Refresh Status',
  syncData: 'Sync Data',
  sessionExpiredTitle: 'Session expired',
  sessionExpiredDescription:
    'Reconnect to refresh the ERP session and resume syncing.',
};

export default function ERPIntegrationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [connections, setConnections] = useState<ERPConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ERPConnection | null>(null);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);
  const translations = DEFAULT_TRANSLATIONS;
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterERPType, setFilterERPType] = useState<string>('all');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch customers
      const customersRes = await fetch('/api/customers');
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      // Fetch ERP connections
      const connectionsRes = await fetch('/api/erp/connections');
      if (connectionsRes.ok) {
        const result = await connectionsRes.json();
        if (result.success) {
          setConnections(result.connections);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfig = (customerId?: string) => {
    if (customerId) {
      setSelectedCustomerId(customerId);
    }
    setConfigModalVisible(true);
  };

  const handleConfigSuccess = () => {
    setConfigModalVisible(false);
    fetchData();
    message.success('ERP connection configured successfully!');
  };

  const handleViewDetails = (connection: ERPConnection) => {
    setSelectedConnection(connection);
    setDetailsModalVisible(true);
  };

  const handleReconnectConnection = async (connectionId: string) => {
    try {
      setReconnectingId(connectionId);
      const response = await fetch(`/api/erp/connections/${connectionId}/reconnect`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message || translations.reconnectSuccess);
        await fetchData();
      } else {
        message.error(result.error || translations.reconnectError);
      }
    } catch (error) {
      console.error('Error reconnecting ERP connection:', error);
      message.error(translations.reconnectError);
    } finally {
      setReconnectingId(null);
    }
  };

  // Filter connections
  const filteredConnections = connections.filter((conn) => {
    const matchesSearch = 
      conn.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      conn.erpType.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || conn.status === filterStatus;
    const matchesERPType = filterERPType === 'all' || conn.erpType === filterERPType;
    
    return matchesSearch && matchesStatus && matchesERPType;
  });

  // Calculate statistics
  const stats = {
    total: connections.length,
    connected: connections.filter(c => c.status === 'CONNECTED').length,
    error: connections.filter(c => c.status === 'ERROR').length,
    avgHealth: connections.length > 0 
      ? Math.round(connections.reduce((sum, c) => sum + c.mappingHealth, 0) / connections.length)
      : 0,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'ERROR':
      case 'DISCONNECTED':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
    }
  };

  const getStatusTag = (status: string) => {
    const colorMap: Record<string, string> = {
      CONNECTED: 'success',
      NOT_CONNECTED: 'default',
      CONNECTING: 'processing',
      ERROR: 'error',
      DISCONNECTED: 'warning',
    };

    return (
      <Tag icon={getStatusIcon(status)} color={colorMap[status] || 'default'}>
        {status.replace(/_/g, ' ')}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string, record: ERPConnection) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.customerEmail}</div>
        </div>
      ),
    },
    {
      title: 'ERP System',
      dataIndex: 'erpType',
      key: 'erpType',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Last Sync',
      dataIndex: 'lastSyncDate',
      key: 'lastSyncDate',
      render: (date: string | null, record: ERPConnection) => (
        <div>
          {date ? (
            <>
              <div>{dayjs(date).format('DD/MM/YYYY HH:mm')}</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {record.lastSyncStatus && (
                  <Tag size="small" color={record.lastSyncStatus === 'SUCCESS' ? 'success' : 'error'}>
                    {record.lastSyncStatus}
                  </Tag>
                )}
              </div>
            </>
          ) : (
            <span style={{ color: '#999' }}>Never</span>
          )}
        </div>
      ),
    },
    {
      title: 'Mapping Health',
      dataIndex: 'mappingHealth',
      key: 'mappingHealth',
      render: (health: number) => (
        <Tag color={health >= 90 ? 'success' : health >= 70 ? 'warning' : 'error'}>
          {health}%
        </Tag>
      ),
    },
    {
      title: 'Data Domains',
      dataIndex: 'dataDomains',
      key: 'dataDomains',
      render: (domains: string[]) => (
        <Space size="small" wrap>
          {domains.length > 0 ? (
            domains.slice(0, 3).map((domain) => (
              <Tag key={domain} size="small">{domain}</Tag>
            ))
          ) : (
            <span style={{ color: '#999' }}>None</span>
          )}
          {domains.length > 3 && (
            <Tag size="small">+{domains.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ERPConnection) => (
        <Space>
          <Button
            type="link"
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
          {record.status !== 'CONNECTED' && (
            <Button
              type="link"
              icon={<ReloadOutlined />}
              onClick={() => handleReconnectConnection(record.id)}
              loading={reconnectingId === record.id}
            >
              {translations.reconnect}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const overviewTab = (
    <div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Connections"
              value={stats.total}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Connected"
              value={stats.connected}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Errors"
              value={stats.error}
              valueStyle={{ color: '#f5222d' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Mapping Health"
              value={stats.avgHealth}
              suffix="%"
              valueStyle={{ color: stats.avgHealth >= 90 ? '#52c41a' : stats.avgHealth >= 70 ? '#faad14' : '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Input
              placeholder="Search customers or ERP..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="CONNECTED">Connected</Select.Option>
              <Select.Option value="ERROR">Error</Select.Option>
              <Select.Option value="NOT_CONNECTED">Not Connected</Select.Option>
            </Select>
            <Select
              placeholder="ERP Type"
              value={filterERPType}
              onChange={setFilterERPType}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All ERPs</Select.Option>
              <Select.Option value="ODOO">Odoo</Select.Option>
              <Select.Option value="SALESFORCE">Salesforce</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<SyncOutlined />} onClick={fetchData}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenConfig()}
            >
              New Connection
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Connections Table */}
      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Space direction="vertical" align="center" size="large">
              <Spin size="large" />
              <span style={{ color: '#666' }}>Loading connections...</span>
            </Space>
          </div>
        </Card>
      ) : filteredConnections.length > 0 ? (
        <Table
          dataSource={filteredConnections}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} connections`,
          }}
        />
      ) : (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchText || filterStatus !== 'all' || filterERPType !== 'all'
                ? 'No connections match your filters'
                : 'No ERP connections yet. Create your first connection!'
            }
          >
            {!searchText && filterStatus === 'all' && filterERPType === 'all' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenConfig()}
              >
                Create First Connection
              </Button>
            )}
          </Empty>
        </Card>
      )}
    </div>
  );

  const customersTab = (
    <div>
      <Alert
        message="Customer ERP Management"
        description="Select a customer to view or configure their ERP connection."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Table
        dataSource={customers}
        loading={loading}
        rowKey="id"
        columns={[
          {
            title: 'Customer Name',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Company',
            dataIndex: 'company',
            key: 'company',
          },
          {
            title: 'Industry',
            dataIndex: 'industry',
            key: 'industry',
          },
          {
            title: 'ERP Status',
            key: 'erpStatus',
            render: (_: any, record: Customer) => {
              const connection = connections.find(c => c.customerId === record.id);
              return connection ? (
                getStatusTag(connection.status)
              ) : (
                <Tag>No Connection</Tag>
              );
            },
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Customer) => {
              const connection = connections.find(c => c.customerId === record.id);
              return (
                <Space>
                  {connection ? (
                    <Button
                      type="link"
                      onClick={() => handleViewDetails(connection)}
                    >
                      View Connection
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleOpenConfig(record.id)}
                    >
                      Configure ERP
                    </Button>
                  )}
                </Space>
              );
            },
          },
        ]}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total ${total} customers`,
        }}
      />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          <ApiOutlined style={{ marginRight: 8 }} />
          ERP Integration Management
        </h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          Manage ERP connections, sync data, and monitor integration health
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: 'All Connections',
            children: overviewTab,
          },
          {
            key: 'customers',
            label: 'By Customer',
            children: customersTab,
          },
        ]}
      />

      {/* Configuration Modal */}
      <Modal
        title="Select Customer"
        open={configModalVisible && !selectedCustomerId}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="Please select a customer first"
          description="Choose which customer's ERP system you want to connect to."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Select
          placeholder="Select a customer"
          style={{ width: '100%' }}
          showSearch
          optionFilterProp="children"
          onChange={(value) => {
            setSelectedCustomerId(value);
          }}
        >
          {customers.map((customer) => (
            <Select.Option key={customer.id} value={customer.id}>
              {customer.name} {customer.company && `(${customer.company})`}
            </Select.Option>
          ))}
        </Select>
      </Modal>

      {selectedCustomerId && (
        <ERPConfigurationForm
          visible={configModalVisible}
          customerId={selectedCustomerId}
          onCancel={() => {
            setConfigModalVisible(false);
            setSelectedCustomerId('');
          }}
          onSuccess={() => {
            handleConfigSuccess();
            setSelectedCustomerId('');
          }}
        />
      )}

      {/* Details Modal */}
      <Modal
        title={`ERP Connection Details - ${selectedConnection?.customerName}`}
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedConnection(null);
        }}
        footer={null}
        width={900}
      >
        {selectedConnection && (
          <ERPConnectionStatus
            customerId={selectedConnection.customerId}
            translations={translations}
          />
        )}
      </Modal>
    </div>
  );
}

