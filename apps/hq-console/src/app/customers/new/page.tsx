'use client';

import React, { useState } from 'react';
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
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { TextArea } = Input;

export default function NewCustomerPage() {
  const router = useRouter();
  
  // Fallback translations when context is not available
  let t: any, tCommon: any;
  try {
    t = useTranslations('customers');
    tCommon = useTranslations('common');
  } catch (e) {
    t = (key: string) => {
      const fallbacks: any = {
        'addCustomer': 'Add Customer',
        'createSuccess': 'Customer created successfully',
        'createError': 'Failed to create customer',
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

  const countries = {
    GCC: ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'],
    MENA: ['Egypt', 'Jordan', 'Lebanon', 'Morocco', 'Tunisia', 'Algeria', 'Iraq', 'Yemen'],
    APAC: ['India', 'Pakistan', 'Bangladesh', 'Philippines', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'China', 'Japan', 'South Korea', 'Australia'],
    EU: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Poland', 'Belgium', 'Sweden', 'Austria']
  };

  const allCountries = Object.values(countries).flat().sort();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success(t('createSuccess'));
        router.push('/customers');
      } else {
        const error = await res.json();
        message.error(error.error || t('createError'));
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      message.error(t('createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0 }}>{t('addCustomer')}</h2>
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
            initialValues={{ status: 'ACTIVE', size: 'MEDIUM' }}
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

