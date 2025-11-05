'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  message,
  Card,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnsType } from 'antd/es/table';
import DashboardLayout from '@/components/DashboardLayout';

const { Search } = Input;

interface Plan {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  price: number | null;
  currency: string;
  duration: number | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    country: string;
  };
  _count?: {
    tasks: number;
    assignments: number;
  };
}

export default function PlansPage() {
  const router = useRouter();
  
  // Fallback translations
  let t: any, tCommon: any;
  try {
    t = useTranslations('plans');
    tCommon = useTranslations('common');
  } catch (e) {
    t = (key: string) => {
      const fallbacks: any = {
        'title': 'Service Plans Management',
        'addPlan': 'Add Plan',
        'fetchError': 'Failed to fetch plans',
        'deleteConfirmTitle': 'Delete Plan',
        'deleteSuccess': 'Plan deleted successfully',
        'deleteError': 'Failed to delete plan',
        'name': 'Plan Name',
        'customer': 'Customer',
        'type': 'Plan Type',
        'status': 'Status',
        'price': 'Price',
        'duration': 'Duration',
        'tasks': 'Tasks',
        'searchPlaceholder': 'Search by name or description',
        'filterByType': 'Filter by Type',
        'filterByStatus': 'Filter by Status',
        'plans': 'plans',
      };
      return fallbacks[key] || key;
    };
    tCommon = (key: string) => {
      const fallbacks: any = {
        'delete': 'Delete',
        'cancel': 'Cancel',
        'edit': 'Edit',
        'actions': 'Actions',
        'total': 'Total'
      };
      return fallbacks[key] || key;
    };
  }

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; id: string; name: string }>({
    visible: false,
    id: '',
    name: '',
  });

  // Initialize from URL params and listen for global filter changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // Plans page doesn't directly use region filter but we keep the listener
      // in case we want to add region-based filtering in the future
    }

    // Listen for global filter changes (for future use)
    const handleGlobalFilterChange = (event: any) => {
      // Currently plans don't filter by region, but this is ready for future enhancement
      console.log('Global filter changed:', event.detail);
    };

    window.addEventListener('globalFilterChange', handleGlobalFilterChange);
    return () => window.removeEventListener('globalFilterChange', handleGlobalFilterChange);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [searchText, typeFilter, statusFilter]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.set('search', searchText);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/plans?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      } else {
        message.error(t('fetchError'));
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      message.error(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteModal({ visible: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/plans/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        message.success(t('deleteSuccess'));
        fetchPlans();
      } else {
        const error = await res.json();
        message.error(error.error || t('deleteError'));
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      message.error(t('deleteError'));
    } finally {
      setDeleteModal({ visible: false, id: '', name: '' });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      BASIC_CFO: 'blue',
      PREMIUM_CFO: 'purple',
      ENTERPRISE_CFO: 'gold',
      CONSULTING: 'green',
      AUDIT: 'orange',
      TAX_FILING: 'cyan',
      CUSTOM: 'default',
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      ACTIVE: 'green',
      INACTIVE: 'default',
      SUSPENDED: 'orange',
      COMPLETED: 'blue',
    };
    return colors[status] || 'default';
  };

  const columns: ColumnsType<Plan> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FileTextOutlined />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: t('customer'),
      dataIndex: ['customer', 'name'],
      key: 'customer',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.customer.country}</div>
        </div>
      ),
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={getTypeColor(type)}>{type.replace('_', ' ')}</Tag>,
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => price ? `${price} ${record.currency}` : '-',
    },
    {
      title: t('duration'),
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => duration ? `${duration} months` : '-',
    },
    {
      title: t('tasks'),
      dataIndex: ['_count', 'tasks'],
      key: 'tasks',
      render: (count) => count || 0,
    },
    {
      title: tCommon('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/plans/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title={tCommon('edit')}>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => router.push(`/plans/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title={tCommon('delete')}>
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id, record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <h2 style={{ margin: 0 }}>{t('title')}</h2>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/plans/new')}
              size="large"
            >
              {t('addPlan')}
            </Button>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('searchPlaceholder')}
              allowClear
              onSearch={setSearchText}
              onChange={(e) => !e.target.value && setSearchText('')}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder={t('filterByType')}
              allowClear
              style={{ width: '100%' }}
              onChange={setTypeFilter}
              options={[
                { label: 'Basic CFO', value: 'BASIC_CFO' },
                { label: 'Premium CFO', value: 'PREMIUM_CFO' },
                { label: 'Enterprise CFO', value: 'ENTERPRISE_CFO' },
                { label: 'Consulting', value: 'CONSULTING' },
                { label: 'Audit', value: 'AUDIT' },
                { label: 'Tax Filing', value: 'TAX_FILING' },
                { label: 'Custom', value: 'CUSTOM' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder={t('filterByStatus')}
              allowClear
              style={{ width: '100%' }}
              onChange={setStatusFilter}
              options={[
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
                { label: 'Suspended', value: 'SUSPENDED' },
                { label: 'Completed', value: 'COMPLETED' },
              ]}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={plans}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${tCommon('total')} ${total} ${t('plans')}`,
          }}
        />
      </Card>

      <Modal
        title={t('deleteConfirmTitle')}
        open={deleteModal.visible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModal({ visible: false, id: '', name: '' })}
        okText={tCommon('delete')}
        cancelText={tCommon('cancel')}
        okType="danger"
        centered
      >
        <p>Are you sure you want to delete <strong>{deleteModal.name}</strong>?</p>
      </Modal>
    </DashboardLayout>
  );
}
