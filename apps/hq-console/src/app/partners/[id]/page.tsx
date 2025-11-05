'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Divider,
  Table,
  Rate,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnsType } from 'antd/es/table';
import DashboardLayout from '@/components/DashboardLayout';

interface Assignment {
  id: string;
  status: string;
  assignedAt: string;
  servicePlan: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
}

interface Partner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  domain: string;
  role: string;
  rating: number | null;
  activeEngagements: number;
  availability: string;
  remoteOk: boolean;
  notes: string | null;
  createdAt: string;
  assignments?: Assignment[];
}

export default function ViewPartnerPage() {
  const router = useRouter();
  const params = useParams();
  
  // Fallback translations
  let t: any, tCommon: any;
  try {
    t = useTranslations('partners');
    tCommon = useTranslations('common');
  } catch (e) {
    t = (key: string) => {
      const fallbacks: any = {
        'viewPartner': 'Partner Details',
        'fetchError': 'Failed to fetch partner',
        'name': 'Name',
        'email': 'Email',
        'phone': 'Phone',
        'country': 'Country',
        'city': 'City',
        'address': 'Address',
        'domain': 'Domain/Expertise',
        'role': 'Role',
        'rating': 'Rating',
        'availability': 'Availability',
        'remoteOk': 'Remote Work',
        'activeEngagements': 'Active Engagements',
        'latitude': 'Latitude',
        'longitude': 'Longitude',
        'notes': 'Notes',
        'createdAt': 'Created At',
        'assignments': 'Assignments',
        'yes': 'Yes',
        'no': 'No'
      };
      return fallbacks[key] || key;
    };
    tCommon = (key: string) => {
      const fallbacks: any = {
        'back': 'Back',
        'edit': 'Edit',
        'name': 'Name',
        'type': 'Type',
        'status': 'Status',
      };
      return fallbacks[key] || key;
    };
  }
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartner();
  }, []);

  const fetchPartner = async () => {
    try {
      const res = await fetch(`/api/partners/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPartner(data);
      } else {
        router.push('/partners');
      }
    } catch (error) {
      console.error('Error fetching partner:', error);
      router.push('/partners');
    } finally {
      setLoading(false);
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

  const assignmentColumns: ColumnsType<Assignment> = [
    {
      title: tCommon('name'),
      dataIndex: ['servicePlan', 'name'],
      key: 'name',
    },
    {
      title: tCommon('type'),
      dataIndex: ['servicePlan', 'type'],
      key: 'type',
    },
    {
      title: tCommon('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'COMPLETED' ? 'green' : 'blue'}>{status}</Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!partner) {
    return null;
  }

  return (
    <DashboardLayout>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <UserOutlined style={{ fontSize: 24 }} />
              <h2 style={{ margin: 0 }}>{partner.name}</h2>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/partners')}
              >
                {tCommon('back')}
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/partners/${partner.id}/edit`)}
              >
                {tCommon('edit')}
              </Button>
            </Space>
          </Col>
        </Row>

        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label={t('name')}>{partner.name}</Descriptions.Item>
          <Descriptions.Item label={t('email')}>{partner.email || '-'}</Descriptions.Item>
          
          <Descriptions.Item label={t('phone')}>
            {partner.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('country')}>
            {partner.country}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('city')}>
            {partner.city || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('address')}>
            {partner.address || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('domain')}>
            {partner.domain}
          </Descriptions.Item>
          <Descriptions.Item label={t('role')}>
            <Tag color={getRoleColor(partner.role)}>{partner.role.replace('_', ' ')}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label={t('rating')}>
            {partner.rating ? <Rate disabled defaultValue={partner.rating} style={{ fontSize: '14px' }} /> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('availability')}>
            <Tag color={getAvailabilityColor(partner.availability)}>{partner.availability}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label={t('remoteOk')}>
            {partner.remoteOk ? 
              <CheckCircleOutlined style={{ color: 'green', fontSize: 18 }} /> : 
              <StopOutlined style={{ color: 'red', fontSize: 18 }} />}
          </Descriptions.Item>
          <Descriptions.Item label={t('activeEngagements')}>
            {partner.activeEngagements}
          </Descriptions.Item>
          
          {partner.latitude && (
            <Descriptions.Item label={t('latitude')}>
              {partner.latitude}
            </Descriptions.Item>
          )}
          {partner.longitude && (
            <Descriptions.Item label={t('longitude')}>
              {partner.longitude}
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label={t('createdAt')}>
            {new Date(partner.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          
          {partner.notes && (
            <Descriptions.Item label={t('notes')} span={2}>
              {partner.notes}
            </Descriptions.Item>
          )}
        </Descriptions>

        {partner.assignments && partner.assignments.length > 0 && (
          <>
            <Divider orientation="left">{t('assignments')}</Divider>
            <Table
              columns={assignmentColumns}
              dataSource={partner.assignments}
              rowKey="id"
              pagination={false}
            />
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}

