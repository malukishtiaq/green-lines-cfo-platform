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
  Switch,
  InputNumber,
  Rate,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { TextArea } = Input;

export default function NewPartnerPage() {
  const router = useRouter();
  
  // Fallback translations
  let t: any, tCommon: any;
  try {
    t = useTranslations('partners');
    tCommon = useTranslations('common');
  } catch (e) {
    t = (key: string) => {
      const fallbacks: any = {
        'addPartner': 'Add Partner',
        'createSuccess': 'Partner created successfully',
        'createError': 'Failed to create partner',
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
        'notes': 'Notes',
        'latitude': 'Latitude',
        'longitude': 'Longitude',
        'namePlaceholder': 'Enter partner name',
        'emailPlaceholder': 'Enter email address',
        'phonePlaceholder': 'Enter phone number',
        'countryPlaceholder': 'Select country',
        'cityPlaceholder': 'Enter city',
        'addressPlaceholder': 'Enter full address',
        'domainPlaceholder': 'Enter expertise domain (e.g., Odoo, Stock Count)',
        'rolePlaceholder': 'Select role',
        'notesPlaceholder': 'Add notes about this partner',
        'nameRequired': 'Partner name is required',
        'countryRequired': 'Country is required',
        'domainRequired': 'Domain is required',
        'roleRequired': 'Role is required',
        'emailInvalid': 'Please enter a valid email',
      };
      return fallbacks[key] || key;
    };
    tCommon = (key: string) => {
      const fallbacks: any = {
        'back': 'Back',
        'cancel': 'Cancel',
        'save': 'Save',
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
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success(t('createSuccess'));
        router.push('/partners');
      } else {
        const error = await res.json();
        message.error(error.error || t('createError'));
      }
    } catch (error) {
      console.error('Error creating partner:', error);
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
              <h2 style={{ margin: 0 }}>{t('addPartner')}</h2>
            </Col>
            <Col>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/partners')}
              >
                {tCommon('back')}
              </Button>
            </Col>
          </Row>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ 
              availability: 'AVAILABLE', 
              remoteOk: false,
              rating: 0,
              activeEngagements: 0
            }}
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
                <Form.Item 
                  name="country" 
                  label={t('country')}
                  rules={[{ required: true, message: t('countryRequired') }]}
                >
                  <Select
                    size="large"
                    placeholder={t('countryPlaceholder')}
                    showSearch
                    options={allCountries.map(c => ({ label: c, value: c }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="city" label={t('city')}>
                  <Input size="large" placeholder={t('cityPlaceholder')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="address" label={t('address')}>
                  <Input size="large" placeholder={t('addressPlaceholder')} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="domain" 
                  label={t('domain')}
                  rules={[{ required: true, message: t('domainRequired') }]}
                >
                  <Input size="large" placeholder={t('domainPlaceholder')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="role" 
                  label={t('role')}
                  rules={[{ required: true, message: t('roleRequired') }]}
                >
                  <Select
                    size="large"
                    placeholder={t('rolePlaceholder')}
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
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="rating" label={t('rating')}>
                  <Rate allowHalf />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="availability" label={t('availability')}>
                  <Select
                    size="large"
                    options={[
                      { label: 'Available', value: 'AVAILABLE' },
                      { label: 'Moderate', value: 'MODERATE' },
                      { label: 'Busy', value: 'BUSY' },
                      { label: 'Unavailable', value: 'UNAVAILABLE' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="remoteOk" label={t('remoteOk')} valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="latitude" label={t('latitude')}>
                  <InputNumber size="large" style={{ width: '100%' }} step={0.000001} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="longitude" label={t('longitude')}>
                  <InputNumber size="large" style={{ width: '100%' }} step={0.000001} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="activeEngagements" label={t('activeEngagements')}>
                  <InputNumber size="large" style={{ width: '100%' }} min={0} />
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
                  <Button onClick={() => router.push('/partners')}>
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

