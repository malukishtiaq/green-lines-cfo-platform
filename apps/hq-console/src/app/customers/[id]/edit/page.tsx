'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
  Spin,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { TextArea } = Input;

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  
  // Fallback translations when context is not available
  let t: any, tCommon: any;
  try {
    t = useTranslations('customers');
    tCommon = useTranslations('common');
  } catch (e) {
    t = (key: string) => {
      const fallbacks: any = {
        'editCustomer': 'Edit Customer',
        'updateSuccess': 'Customer updated successfully',
        'updateError': 'Failed to update customer',
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
        'namePlaceholder': 'Enter customer name',
        'emailPlaceholder': 'Enter email address',
        'phonePlaceholder': 'Enter phone number',
        'companyPlaceholder': 'Enter company name',
        'countryPlaceholder': 'Select country',
        'cityPlaceholder': 'Enter city',
        'addressPlaceholder': 'Enter full address',
        'industryPlaceholder': 'Select industry',
        'notesPlaceholder': 'Add notes about this customer',
        'nameRequired': 'Customer name is required',
        'emailRequired': 'Email is required',
        'emailInvalid': 'Please enter a valid email'
      };
      return fallbacks[key] || key;
    };
    tCommon = (key: string) => {
      const fallbacks: any = {
        'back': 'Back',
        'cancel': 'Cancel',
        'save': 'Save'
      };
      return fallbacks[key] || key;
    };
  }
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const countries = {
    GCC: ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'],
    MENA: ['Egypt', 'Jordan', 'Lebanon', 'Morocco', 'Tunisia', 'Algeria', 'Iraq', 'Yemen'],
    APAC: ['India', 'Pakistan', 'Bangladesh', 'Philippines', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'China', 'Japan', 'South Korea', 'Australia'],
    EU: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Poland', 'Belgium', 'Sweden', 'Austria']
  };

  const allCountries = Object.values(countries).flat().sort();

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        form.setFieldsValue(data);
      } else {
        message.error(t('fetchError'));
        router.push('/customers');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      message.error(t('fetchError'));
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success(t('updateSuccess'));
        router.push('/customers');
      } else {
        const error = await res.json();
        message.error(error.error || t('updateError'));
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      message.error(t('updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0 }}>{t('editCustomer')}</h2>
            </Col>
            <Col>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/customers')}
              >
                {tCommon('back')}
              </Button>
            </Col>
          </Row>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label={t('name')}
                  rules={[{ required: true, message: t('nameRequired') }]}
                >
                  <Input size="large" placeholder={t('namePlaceholder')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label={t('email')}
                  rules={[
                    { required: true, message: t('emailRequired') },
                    { type: 'email', message: t('emailInvalid') },
                  ]}
                >
                  <Input size="large" placeholder={t('emailPlaceholder')} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="phone" label={t('phone')}>
                  <Input size="large" placeholder={t('phonePlaceholder')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="company" label={t('company')}>
                  <Input size="large" placeholder={t('companyPlaceholder')} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="country" label={t('country')}>
                  <Select
                    size="large"
                    placeholder={t('countryPlaceholder')}
                    showSearch
                    options={allCountries.map(c => ({ label: c, value: c }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="city" label={t('city')}>
                  <Input size="large" placeholder={t('cityPlaceholder')} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="address" label={t('address')}>
                  <Input size="large" placeholder={t('addressPlaceholder')} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="industry" label={t('industry')}>
                  <Select
                    size="large"
                    placeholder={t('industryPlaceholder')}
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
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="size" label={t('size')}>
                  <Select
                    size="large"
                    options={[
                      { label: 'Small', value: 'SMALL' },
                      { label: 'Medium', value: 'MEDIUM' },
                      { label: 'Large', value: 'LARGE' },
                      { label: 'Enterprise', value: 'ENTERPRISE' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="status" label={t('status')}>
                  <Select
                    size="large"
                    options={[
                      { label: 'Active', value: 'ACTIVE' },
                      { label: 'Inactive', value: 'INACTIVE' },
                      { label: 'Suspended', value: 'SUSPENDED' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="notes" label={t('notes')}>
                  <TextArea
                    rows={4}
                    placeholder={t('notesPlaceholder')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end">
              <Col>
                <Space>
                  <Button onClick={() => router.push('/customers')}>
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    size="large"
                  >
                    {tCommon('save')}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Space>
      </Card>
    </div>
  );
}

