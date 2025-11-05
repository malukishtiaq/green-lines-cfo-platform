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
  UserOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnsType } from 'antd/es/table';
import DashboardLayout from '@/components/DashboardLayout';

const { Search } = Input;

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  size: string;
  status: string;
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  
  // Fallback translations when context is not available
  let t: any, tCommon: any;
  try {
    t = useTranslations('customers');
    tCommon = useTranslations('common');
  } catch (e) {
    // Provide fallback functions if i18n context is not available
    t = (key: string) => {
      const fallbacks: any = {
        'title': 'Customers Management',
        'addCustomer': 'Add Customer',
        'fetchError': 'Failed to fetch customers',
        'deleteConfirmTitle': 'Delete Customer',
        'deleteConfirmContent': 'Are you sure you want to delete this customer?',
        'deleteSuccess': 'Customer deleted successfully',
        'deleteError': 'Failed to delete customer',
        'name': 'Name',
        'email': 'Email',
        'company': 'Company',
        'country': 'Country',
        'industry': 'Industry',
        'size': 'Size',
        'status': 'Status',
        'searchPlaceholder': 'Search by name, email, or company',
        'filterByRegion': 'Filter by Region',
        'filterByIndustry': 'Filter by Industry',
        'filterByStatus': 'Filter by Status',
        'customers': 'customers'
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

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
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
      const urlRegion = params.get('region');
      if (urlRegion) {
        setRegionFilter(urlRegion);
      } else {
        setRegionFilter(null);
      }
    }

    // Listen for global filter changes
    const handleGlobalFilterChange = (event: any) => {
      if (event.detail.region !== undefined) {
        setRegionFilter(event.detail.region || null);
      }
    };

    window.addEventListener('globalFilterChange', handleGlobalFilterChange);
    return () => window.removeEventListener('globalFilterChange', handleGlobalFilterChange);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [searchText, regionFilter, industryFilter, statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.set('search', searchText);
      if (regionFilter) params.set('region', regionFilter);
      if (industryFilter) params.set('industry', industryFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      } else {
        message.error(t('fetchError'));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
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
      const res = await fetch(`/api/customers/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        message.success(t('deleteSuccess'));
        fetchCustomers();
      } else {
        const error = await res.json();
        message.error(error.error || t('deleteError'));
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error(t('deleteError'));
    } finally {
      setDeleteModal({ visible: false, id: '', name: '' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      ACTIVE: 'green',
      INACTIVE: 'orange',
      SUSPENDED: 'red',
    };
    return colors[status] || 'default';
  };

  const getSizeColor = (size: string) => {
    const colors: { [key: string]: string } = {
      SMALL: 'blue',
      MEDIUM: 'cyan',
      LARGE: 'purple',
      ENTERPRISE: 'gold',
    };
    return colors[size] || 'default';
  };

  const columns: ColumnsType<Customer> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: t('email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('company'),
      dataIndex: 'company',
      key: 'company',
      render: (text) => text || '-',
    },
    {
      title: t('country'),
      dataIndex: 'country',
      key: 'country',
      render: (text) => text || '-',
    },
    {
      title: t('industry'),
      dataIndex: 'industry',
      key: 'industry',
      render: (text) => text || '-',
    },
    {
      title: t('size'),
      dataIndex: 'size',
      key: 'size',
      render: (size) => <Tag color={getSizeColor(size)}>{size}</Tag>,
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
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
              onClick={() => router.push(`/customers/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title={tCommon('edit')}>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => router.push(`/customers/${record.id}/edit`)}
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
                onClick={() => router.push('/customers/new')}
                size="large"
              >
                {t('addCustomer')}
              </Button>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder={t('searchPlaceholder')}
                allowClear
                onSearch={setSearchText}
                onChange={(e) => !e.target.value && setSearchText('')}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder={t('filterByRegion')}
                allowClear
                style={{ width: '100%' }}
                onChange={setRegionFilter}
                options={[
                  { label: 'GCC', value: 'GCC' },
                  { label: 'MENA', value: 'MENA' },
                  { label: 'APAC', value: 'APAC' },
                  { label: 'EU', value: 'EU' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder={t('filterByIndustry')}
                allowClear
                style={{ width: '100%' }}
                onChange={setIndustryFilter}
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
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder={t('filterByStatus')}
                allowClear
                style={{ width: '100%' }}
                onChange={setStatusFilter}
                options={[
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Inactive', value: 'INACTIVE' },
                  { label: 'Suspended', value: 'SUSPENDED' },
                ]}
              />
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={customers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `${tCommon('total')} ${total} ${t('customers')}`,
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

