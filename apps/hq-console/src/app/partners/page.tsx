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
  Rate,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnsType } from 'antd/es/table';
import DashboardLayout from '@/components/DashboardLayout';

const { Search } = Input;

interface Partner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string;
  city: string | null;
  domain: string;
  role: string;
  rating: number | null;
  activeEngagements: number;
  availability: string;
  remoteOk: boolean;
  createdAt: string;
  _count?: {
    assignments: number;
  };
}

export default function PartnersPage() {
  const router = useRouter();
  
  // Fallback translations when context is not available
  let t: any, tCommon: any;
  try {
    t = useTranslations('partners');
    tCommon = useTranslations('common');
  } catch (e) {
    t = (key: string) => {
      const fallbacks: any = {
        'title': 'Partners Management',
        'addPartner': 'Add Partner',
        'fetchError': 'Failed to fetch partners',
        'deleteConfirmTitle': 'Delete Partner',
        'deleteConfirmContent': 'Are you sure you want to delete this partner?',
        'deleteSuccess': 'Partner deleted successfully',
        'deleteError': 'Failed to delete partner',
        'name': 'Name',
        'email': 'Email',
        'country': 'Country',
        'domain': 'Domain/Expertise',
        'role': 'Role',
        'rating': 'Rating',
        'availability': 'Availability',
        'remoteOk': 'Remote Work',
        'activeEngagements': 'Active Engagements',
        'searchPlaceholder': 'Search by name, email, or domain',
        'filterByRegion': 'Filter by Region',
        'filterByRole': 'Filter by Role',
        'filterByAvailability': 'Filter by Availability',
        'partners': 'partners',
        'yes': 'Yes',
        'no': 'No'
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

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null);
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
    fetchPartners();
  }, [searchText, regionFilter, roleFilter, availabilityFilter]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.set('search', searchText);
      if (regionFilter) params.set('region', regionFilter);
      if (roleFilter) params.set('role', roleFilter);
      if (availabilityFilter) params.set('availability', availabilityFilter);

      const res = await fetch(`/api/partners?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
      } else {
        message.error(t('fetchError'));
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
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
      const res = await fetch(`/api/partners/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        message.success(t('deleteSuccess'));
        fetchPartners();
      } else {
        const error = await res.json();
        message.error(error.error || t('deleteError'));
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      message.error(t('deleteError'));
    } finally {
      setDeleteModal({ visible: false, id: '', name: '' });
    }
  };

  const getAvailabilityColor = (availability: string) => {
    const colors: { [key: string]: string } = {
      AVAILABLE: 'green',
      MODERATE: 'blue',
      BUSY: 'orange',
      UNAVAILABLE: 'red',
    };
    return colors[availability] || 'default';
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      ERP_CONSULTANT: 'purple',
      TECHNICAL: 'blue',
      ACCOUNTS: 'green',
      STOCK_COUNT: 'orange',
      IMPLEMENTATION: 'cyan',
      TRAINING: 'magenta',
      OTHER: 'default',
    };
    return colors[role] || 'default';
  };

  const columns: ColumnsType<Partner> = [
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
      render: (text) => text || '-',
    },
    {
      title: t('country'),
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: t('domain'),
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={getRoleColor(role)}>{role.replace('_', ' ')}</Tag>,
    },
    {
      title: t('rating'),
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => rating ? <Rate disabled defaultValue={rating} style={{ fontSize: '14px' }} /> : '-',
    },
    {
      title: t('availability'),
      dataIndex: 'availability',
      key: 'availability',
      render: (availability) => <Tag color={getAvailabilityColor(availability)}>{availability}</Tag>,
    },
    {
      title: t('remoteOk'),
      dataIndex: 'remoteOk',
      key: 'remoteOk',
      render: (remoteOk) => remoteOk ? 
        <CheckCircleOutlined style={{ color: 'green' }} /> : 
        <StopOutlined style={{ color: 'red' }} />,
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
              onClick={() => router.push(`/partners/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title={tCommon('edit')}>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => router.push(`/partners/${record.id}/edit`)}
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
              onClick={() => router.push('/partners/new')}
              size="large"
            >
              {t('addPartner')}
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
              placeholder={t('filterByRole')}
              allowClear
              style={{ width: '100%' }}
              onChange={setRoleFilter}
              options={[
                { label: 'ERP Consultant', value: 'ERP_CONSULTANT' },
                { label: 'Technical', value: 'TECHNICAL' },
                { label: 'Accounts', value: 'ACCOUNTS' },
                { label: 'Stock Count', value: 'STOCK_COUNT' },
                { label: 'Implementation', value: 'IMPLEMENTATION' },
                { label: 'Training', value: 'TRAINING' },
                { label: 'Other', value: 'OTHER' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder={t('filterByAvailability')}
              allowClear
              style={{ width: '100%' }}
              onChange={setAvailabilityFilter}
              options={[
                { label: 'Available', value: 'AVAILABLE' },
                { label: 'Moderate', value: 'MODERATE' },
                { label: 'Busy', value: 'BUSY' },
                { label: 'Unavailable', value: 'UNAVAILABLE' },
              ]}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={partners}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${tCommon('total')} ${total} ${t('partners')}`,
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

