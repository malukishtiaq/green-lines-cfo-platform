'use client';

import React, { useMemo, useState } from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Input, Select, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePartners } from '../hooks';
import { PartnerRole } from '../../domain/entities';
import { useTranslations } from 'next-intl';
import { useAccessControl, PermissionGate } from '../hooks/useAccessControl';
import { Permission } from '../../domain/entities/AccessControl';

const { Title } = Typography;
const { Option } = Select;

const PartnersPage: React.FC = () => {
  const t = useTranslations('partner');
  const tCommon = useTranslations('common');
  const { partners, loading, error, createPartner, updatePartner, deletePartner } = usePartners();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const roleOptions = useMemo(() => ([
    { value: PartnerRole.ERP_CONSULTANT, label: t('roles.erpConsultant') },
    { value: PartnerRole.TECHNICAL, label: t('roles.technical') },
    { value: PartnerRole.ACCOUNTS, label: t('roles.accounts') },
    { value: PartnerRole.STOCK_COUNT, label: t('roles.stockCount') },
    { value: PartnerRole.IMPLEMENTATION, label: t('roles.implementation') },
    { value: PartnerRole.TRAINING, label: t('roles.training') },
    { value: PartnerRole.OTHER, label: t('roles.other') },
  ]), [t]);

  const columns = [
    { title: tCommon('name'), dataIndex: 'name', key: 'name' },
    { title: tCommon('email'), dataIndex: 'email', key: 'email' },
    { title: tCommon('phone'), dataIndex: 'phone', key: 'phone' },
    { title: tCommon('country'), dataIndex: 'country', key: 'country' },
    { title: t('partnerDomain'), dataIndex: 'domain', key: 'domain' },
    { 
      title: t('partnerRole'), dataIndex: 'role', key: 'role',
      render: (role: string) => <Tag color="blue">{role}</Tag>
    },
    {
      title: tCommon('actions'), key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <PermissionGate permission={Permission.UPDATE_PARTNERS}>
            <Button onClick={() => onEdit(record)}>{tCommon('edit')}</Button>
          </PermissionGate>
          <PermissionGate permission={Permission.DELETE_PARTNERS}>
            <Button danger onClick={() => onDelete(record.id)}>{tCommon('delete')}</Button>
          </PermissionGate>
        </Space>
      )
    }
  ];

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const onEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const onDelete = async (id: string) => {
    await deletePartner(id);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    if (editingId) {
      await updatePartner(editingId, values);
    } else {
      await createPartner(values);
    }
    setIsModalVisible(false);
  };

  return (
    <Card
      title={<Title level={3} style={{ margin: 0 }}>{t('partners')}</Title>}
      extra={
        <PermissionGate permission={Permission.CREATE_PARTNERS}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('addPartner')}</Button>
        </PermissionGate>
      }
      bordered={false}
    >
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={partners}
        loading={loading}
      />

      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={onSubmit}
        title={editingId ? t('editPartner') : t('createPartner')}
        okText={tCommon('save')}
        cancelText={tCommon('cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('partnerName')} rules={[{ required: true, message: t('partnerName') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t('partnerEmail')}>
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone" label={t('partnerPhone')}>
            <Input />
          </Form.Item>
          <Form.Item name="country" label={t('partnerCountry')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="domain" label={t('partnerDomain')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={t('partnerRole')} rules={[{ required: true }]}>
            <Select showSearch>
              {roleOptions.map(o => (
                <Option key={o.value} value={o.value}>{o.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label={t('partnerNotes')}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PartnersPage;


