'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tag,
  Button,
  Space,
  Progress,
  Descriptions,
  Timeline,
  Empty,
  Spin,
  message,
  Modal,
  Select,
  Checkbox,
  Alert,
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface ERPConnectionStatusProps {
  customerId: string;
}

interface ERPConnection {
  id: string;
  customerId: string;
  customerName: string;
  erpType: string;
  status: string;
  lastSyncDate: string | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
  mappingHealth: number;
  dataDomains: string[];
  createdAt: string;
  updatedAt: string;
  syncHistory: ERPSyncHistory[];
}

interface ERPSyncHistory {
  id: string;
  syncType: string;
  status: string;
  recordsProcessed: number;
  recordsSkipped: number;
  errors: string[];
  warnings: string[];
  startTime: string;
  endTime: string;
  duration: number;
  triggeredBy: string | null;
  dataDomainsSynced: string[];
  createdAt: string;
}

export const ERPConnectionStatus: React.FC<ERPConnectionStatusProps> = ({
  customerId,
}) => {
  const [connection, setConnection] = useState<ERPConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const availableDomains = [
    { label: 'Accounts Receivable', value: 'AR' },
    { label: 'Accounts Payable', value: 'AP' },
    { label: 'General Ledger', value: 'GL' },
    { label: 'Sales', value: 'SALES' },
    { label: 'Inventory', value: 'INVENTORY' },
    { label: 'Payroll', value: 'PAYROLL' },
  ];

  useEffect(() => {
    fetchConnection();
  }, [customerId]);

  const fetchConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/erp/connections?customerId=${customerId}`);
      const result = await response.json();

      if (result.success && result.connections.length > 0) {
        setConnection(result.connections[0]);
        setSelectedDomains(result.connections[0].dataDomains || []);
      } else {
        setConnection(null);
      }
    } catch (error: any) {
      console.error('Error fetching ERP connection:', error);
      message.error('Failed to fetch ERP connection');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!connection || selectedDomains.length === 0) {
      message.warning('Please select at least one data domain to sync');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch(`/api/erp/connections/${connection.id}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains: selectedDomains,
          triggeredBy: 'USER', // TODO: Get actual user ID from session
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message || 'Data sync completed successfully');
        fetchConnection(); // Refresh connection data
        setSyncModalVisible(false);
      } else {
        message.error(result.error || 'Data sync failed');
      }
    } catch (error: any) {
      console.error('Error syncing data:', error);
      message.error('Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'SUCCESS':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'ERROR':
      case 'FAILED':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'CONNECTING':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'PARTIAL':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      default:
        return <CloseCircleOutlined style={{ color: '#d9d9d9' }} />;
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

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin tip="Loading ERP connection..." />
        </div>
      </Card>
    );
  }

  if (!connection) {
    return (
      <Card>
        <Empty
          description="No ERP connection found for this customer"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <Space>
            <span>ERP Connection Status</span>
            {getStatusTag(connection.status)}
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => setSyncModalVisible(true)}
            disabled={connection.status !== 'CONNECTED'}
          >
            Sync Data
          </Button>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ERP System">
            <Tag color="blue">{connection.erpType}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {getStatusTag(connection.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Last Sync">
            {connection.lastSyncDate
              ? dayjs(connection.lastSyncDate).format('DD/MM/YYYY HH:mm')
              : 'Never'}
          </Descriptions.Item>
          <Descriptions.Item label="Last Sync Status">
            {connection.lastSyncStatus ? (
              <Tag icon={getStatusIcon(connection.lastSyncStatus)}>
                {connection.lastSyncStatus}
              </Tag>
            ) : (
              'N/A'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Mapping Health" span={2}>
            <Progress
              percent={connection.mappingHealth}
              status={
                connection.mappingHealth >= 90
                  ? 'success'
                  : connection.mappingHealth >= 70
                  ? 'normal'
                  : 'exception'
              }
            />
          </Descriptions.Item>
          <Descriptions.Item label="Data Domains" span={2}>
            {connection.dataDomains.length > 0 ? (
              <Space wrap>
                {connection.dataDomains.map((domain) => (
                  <Tag key={domain} color="green">
                    {domain}
                  </Tag>
                ))}
              </Space>
            ) : (
              <span style={{ color: '#999' }}>No domains synced yet</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Connected At" span={2}>
            {dayjs(connection.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>

        {connection.lastSyncError && (
          <Alert
            message="Last Sync Error"
            description={connection.lastSyncError}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {connection.syncHistory && connection.syncHistory.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h4>Sync History</h4>
            <Timeline>
              {connection.syncHistory.map((sync) => (
                <Timeline.Item
                  key={sync.id}
                  color={
                    sync.status === 'SUCCESS'
                      ? 'green'
                      : sync.status === 'FAILED'
                      ? 'red'
                      : 'orange'
                  }
                >
                  <p>
                    <strong>{sync.status}</strong> - {dayjs(sync.createdAt).fromNow()}
                  </p>
                  <p style={{ color: '#666', fontSize: '12px' }}>
                    {sync.recordsProcessed} records processed in{' '}
                    {(sync.duration / 1000).toFixed(2)}s
                  </p>
                  {sync.errors.length > 0 && (
                    <p style={{ color: '#f5222d', fontSize: '12px' }}>
                      Errors: {sync.errors.join(', ')}
                    </p>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Card>

      <Modal
        title="Sync ERP Data"
        open={syncModalVisible}
        onCancel={() => setSyncModalVisible(false)}
        onOk={handleSync}
        confirmLoading={syncing}
        okText="Start Sync"
      >
        <p>Select the data domains you want to sync from the ERP system:</p>
        <Checkbox.Group
          options={availableDomains}
          value={selectedDomains}
          onChange={setSelectedDomains as any}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        />
        <Alert
          message="Note"
          description="This operation may take several minutes depending on the amount of data to sync."
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Modal>
    </>
  );
};

