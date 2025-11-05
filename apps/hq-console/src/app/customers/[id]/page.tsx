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
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnsType } from 'antd/es/table';

interface ServicePlan {
  id: string;
  name: string;
  type: string;
  status: string;
  price: number;
  currency: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  size: string;
  status: string;
  notes: string | null;
  createdAt: string;
  servicePlans?: ServicePlan[];
}

export default function ViewCustomerPage() {
  const router = useRouter();
  const params = useParams();
  
  // Fallback translations
  let t: any, tCommon: any;
  try {
    t = useTranslations('customers');
    tCommon = useTranslations('common');
  } catch (e) {
    t = (key: string) => {
      const fallbacks: any = {
        'viewCustomer': 'Customer Details',
        'fetchError': 'Failed to fetch customer',
        'name': 'Name',
        'email': 'Email',
        'phone': 'Phone',
        'company': 'Company',
        'country': 'Country',
        'city': 'City',
        'address': 'Address',
        'industry': 'Industry',
        'size': 'Size',
        'status': 'Status',
        'notes': 'Notes',
        'createdAt': 'Created At',
        'servicePlans': 'Service Plans',
        'noServicePlans': 'No service plans'
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
        'price': 'Price'
      };
      return fallbacks[key] || key;
    };
  }
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      } else {
        router.push('/customers');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      router.push('/customers');
    } finally {
      setLoading(false);
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

  const servicePlanColumns: ColumnsType<ServicePlan> = [
    {
      title: tCommon('name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: tCommon('type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: tCommon('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: tCommon('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => `${record.currency} ${price.toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <UserOutlined style={{ fontSize: 24 }} />
              <h2 style={{ margin: 0 }}>{customer.name}</h2>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/customers')}
              >
                {tCommon('back')}
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/customers/${customer.id}/edit`)}
              >
                {tCommon('edit')}
              </Button>
            </Space>
          </Col>
        </Row>

        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label={t('name')}>{customer.name}</Descriptions.Item>
          <Descriptions.Item label={t('email')}>{customer.email}</Descriptions.Item>
          
          <Descriptions.Item label={t('phone')}>
            {customer.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('company')}>
            {customer.company || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('country')}>
            {customer.country || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('city')}>
            {customer.city || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('address')} span={2}>
            {customer.address || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label={t('industry')}>
            {customer.industry || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('size')}>
            <Tag color={getSizeColor(customer.size)}>{customer.size}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label={t('status')}>
            <Tag color={getStatusColor(customer.status)}>{customer.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('createdAt')}>
            {new Date(customer.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          
          {customer.notes && (
            <Descriptions.Item label={t('notes')} span={2}>
              {customer.notes}
            </Descriptions.Item>
          )}
        </Descriptions>

        {customer.servicePlans && customer.servicePlans.length > 0 && (
          <>
            <Divider orientation="left">{t('servicePlans')}</Divider>
            <Table
              columns={servicePlanColumns}
              dataSource={customer.servicePlans}
              rowKey="id"
              pagination={false}
            />
          </>
        )}
      </Card>
    </div>
  );
}

