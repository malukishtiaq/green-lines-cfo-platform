'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Alert,
  Space,
  Spin,
  message,
  Tabs,
} from 'antd';
import { SaveOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { ERPType } from '@/domain/entities/ERPIntegration';

interface ERPConfigurationFormProps {
  visible: boolean;
  customerId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface OdooCredentials {
  odooUrl: string;
  odooDatabase: string;
  odooUsername: string;
  odooPassword: string;
}

interface SalesforceCredentials {
  salesforceInstanceUrl: string;
  salesforceClientId: string;
  salesforceClientSecret: string;
  salesforceUsername: string;
  salesforcePassword: string;
  salesforceSecurityToken: string;
}

export const ERPConfigurationForm: React.FC<ERPConfigurationFormProps> = ({
  visible,
  customerId,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [selectedERP, setSelectedERP] = useState<ERPType | null>(null);
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleERPTypeChange = (value: ERPType) => {
    setSelectedERP(value);
    setTestResult(null);
    form.resetFields(['credentials']);
  };

  const handleTestConnection = async () => {
    try {
      await form.validateFields();
      setTesting(true);
      setTestResult(null);

      const values = form.getFieldsValue();
      const credentials = buildCredentials(selectedERP!, values);

      const response = await fetch('/api/erp/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          erpType: selectedERP,
          credentials,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: result.message || 'Connection successful!',
        });
        message.success('Connection test successful!');
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Connection test failed',
        });
        message.error('Connection test failed');
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      setTestResult({
        success: false,
        message: error.message || 'Failed to test connection',
      });
      message.error('Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    try {
      await form.validateFields();
      setConnecting(true);

      const values = form.getFieldsValue();
      const credentials = buildCredentials(selectedERP!, values);

      const response = await fetch('/api/erp/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          erpType: selectedERP,
          credentials,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('ERP connection established successfully!');
        form.resetFields();
        onSuccess();
      } else {
        message.error(result.error || 'Failed to establish connection');
      }
    } catch (error: any) {
      console.error('Connect error:', error);
      message.error('Failed to establish connection');
    } finally {
      setConnecting(false);
    }
  };

  const buildCredentials = (erpType: ERPType, values: any): any => {
    switch (erpType) {
      case ERPType.ODOO:
        return {
          odooUrl: values.odooUrl,
          odooDatabase: values.odooDatabase,
          odooUsername: values.odooUsername,
          odooPassword: values.odooPassword,
        } as OdooCredentials;

      case ERPType.SALESFORCE:
        return {
          salesforceInstanceUrl: values.salesforceInstanceUrl,
          salesforceClientId: values.salesforceClientId,
          salesforceClientSecret: values.salesforceClientSecret,
          salesforceUsername: values.salesforceUsername,
          salesforcePassword: values.salesforcePassword,
          salesforceSecurityToken: values.salesforceSecurityToken,
        } as SalesforceCredentials;

      default:
        return {};
    }
  };

  const renderCredentialsForm = () => {
    switch (selectedERP) {
      case ERPType.ODOO:
        return (
          <>
            <Form.Item
              label="Odoo URL"
              name="odooUrl"
              rules={[
                { required: true, message: 'Please enter Odoo URL' },
                { type: 'url', message: 'Please enter a valid URL' },
              ]}
            >
              <Input
                placeholder="https://your-instance.odoo.com"
                disabled={testing || connecting}
              />
            </Form.Item>

            <Form.Item
              label="Database"
              name="odooDatabase"
              rules={[{ required: true, message: 'Please enter database name' }]}
            >
              <Input placeholder="database_name" disabled={testing || connecting} />
            </Form.Item>

            <Form.Item
              label="Username"
              name="odooUsername"
              rules={[{ required: true, message: 'Please enter username' }]}
            >
              <Input placeholder="admin" disabled={testing || connecting} />
            </Form.Item>

            <Form.Item
              label="Password"
              name="odooPassword"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password
                placeholder="Enter password"
                disabled={testing || connecting}
              />
            </Form.Item>
          </>
        );

      case ERPType.SALESFORCE:
        return (
          <>
            <Form.Item
              label="Instance URL"
              name="salesforceInstanceUrl"
              rules={[
                { required: true, message: 'Please enter Salesforce instance URL' },
                { type: 'url', message: 'Please enter a valid URL' },
              ]}
            >
              <Input
                placeholder="https://your-instance.salesforce.com"
                disabled={testing || connecting}
              />
            </Form.Item>

            <Form.Item
              label="Client ID"
              name="salesforceClientId"
              rules={[{ required: true, message: 'Please enter Client ID' }]}
            >
              <Input placeholder="Consumer Key" disabled={testing || connecting} />
            </Form.Item>

            <Form.Item
              label="Client Secret"
              name="salesforceClientSecret"
              rules={[{ required: true, message: 'Please enter Client Secret' }]}
            >
              <Input.Password
                placeholder="Consumer Secret"
                disabled={testing || connecting}
              />
            </Form.Item>

            <Form.Item
              label="Username"
              name="salesforceUsername"
              rules={[
                { required: true, message: 'Please enter username' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="user@company.com" disabled={testing || connecting} />
            </Form.Item>

            <Form.Item
              label="Password"
              name="salesforcePassword"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password
                placeholder="Enter password"
                disabled={testing || connecting}
              />
            </Form.Item>

            <Form.Item
              label="Security Token"
              name="salesforceSecurityToken"
              rules={[{ required: true, message: 'Please enter security token' }]}
            >
              <Input.Password
                placeholder="Security Token"
                disabled={testing || connecting}
              />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title="Connect to ERP System"
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="test"
          onClick={handleTestConnection}
          loading={testing}
          disabled={!selectedERP || connecting}
        >
          <CheckCircleOutlined /> Test Connection
        </Button>,
        <Button
          key="connect"
          type="primary"
          onClick={handleConnect}
          loading={connecting}
          disabled={!testResult?.success || testing}
          icon={<SaveOutlined />}
        >
          Connect
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Alert
          message="ERP Connection Setup"
          description="Connect to your customer's ERP system to sync financial data. All credentials are encrypted and stored securely."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form.Item
          label="Select ERP System"
          name="erpType"
          rules={[{ required: true, message: 'Please select an ERP system' }]}
        >
          <Select
            placeholder="Choose ERP system"
            onChange={handleERPTypeChange}
            disabled={testing || connecting}
            size="large"
          >
            <Select.Option value={ERPType.ODOO}>Odoo</Select.Option>
            <Select.Option value={ERPType.SALESFORCE}>Salesforce</Select.Option>
          </Select>
        </Form.Item>

        {selectedERP && (
          <div style={{ marginTop: 16 }}>
            <h4>Credentials</h4>
            {renderCredentialsForm()}
          </div>
        )}

        {testResult && (
          <Alert
            message={testResult.success ? 'Connection Successful' : 'Connection Failed'}
            description={testResult.message}
            type={testResult.success ? 'success' : 'error'}
            showIcon
            icon={
              testResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />
            }
            style={{ marginTop: 16 }}
          />
        )}
      </Form>
    </Modal>
  );
};

