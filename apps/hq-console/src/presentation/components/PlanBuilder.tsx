'use client';

import React, { useMemo, useState } from 'react';
import { Card, Steps, Button, Form, Input, Select, DatePicker, Checkbox, Space, Typography, message } from 'antd';

const { Title, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;

type StageKey = 'basic' | 'milestones' | 'resources' | 'cfo' | 'services' | 'attachments' | 'review';

interface BasicInfoForm {
  planName: string;
  description?: string;
  industry: string;
  companySize: 'STARTUP' | 'SME' | 'ENTERPRISE';
  durationType: 'FIXED' | 'ONGOING';
  durationWeeks?: number;
  startDate?: string;
  workingDays?: string[];
  address?: string;
  siteType?: string;
  accessRequirements?: string[];
}

const industries = ['Retail','Technology','Healthcare','Finance','Hospitality','Government','Education'];
const companySizes = [
  { value: 'STARTUP', label: 'Startup (1-50)' },
  { value: 'SME', label: 'SME (51-200)' },
  { value: 'ENTERPRISE', label: 'Enterprise (201+)' },
];

const workingDays = ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];
const siteTypes = ['Office','Retail','Warehouse','Residential','Mixed-Use'];
const accessOptions = ['Security clearance','Timing restrictions','Parking'];

const PlanBuilder: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);
  const [basicForm] = Form.useForm<BasicInfoForm>();

  const stages: { key: StageKey; title: string }[] = useMemo(() => ([
    { key: 'basic', title: 'Basic Information' },
    { key: 'milestones', title: 'Milestones' },
    { key: 'resources', title: 'Resources' },
    { key: 'cfo', title: 'CFO Analysis' },
    { key: 'services', title: 'Services & Partners' },
    { key: 'attachments', title: 'Attachments' },
    { key: 'review', title: 'Review' },
  ]), []);

  const next = async () => {
    if (stages[current].key === 'basic') {
      try {
        await basicForm.validateFields();
      } catch {
        message.error('Please complete required fields');
        return;
      }
    }
    setCurrent((c) => Math.min(c + 1, stages.length - 1));
  };

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <Card bordered={false}>
      <Title level={3} style={{ marginTop: 0 }}>Plan Builder</Title>
      <Steps current={current} responsive style={{ marginBottom: 24 }}>
        {stages.map(s => (<Step key={s.key} title={s.title} />))}
      </Steps>

      {stages[current].key === 'basic' && (
        <Form form={basicForm} layout="vertical" initialValues={{ durationType: 'FIXED' }}>
          <Title level={4}>Plan Identity</Title>
          <Form.Item name="planName" label="Plan Name" rules={[{ required: true, message: 'Required' }]}>
            <Input maxLength={120} showCount />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ max: 500 }] }>
            <Input.TextArea rows={3} maxLength={500} showCount />
          </Form.Item>
          <Space size="large" wrap>
            <Form.Item name="industry" label="Client Industry" rules={[{ required: true }]}>
              <Select style={{ minWidth: 220 }}>
                {industries.map(x => <Option key={x} value={x}>{x}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="companySize" label="Company Size" rules={[{ required: true }]}>
              <Select style={{ minWidth: 220 }} options={companySizes} />
            </Form.Item>
          </Space>

          <Title level={4} style={{ marginTop: 24 }}>Timeline Configuration</Title>
          <Space size="large" wrap>
            <Form.Item name="durationType" label="Duration Type" rules={[{ required: true }]}>
              <Select style={{ minWidth: 220 }} options={[{value:'FIXED',label:'Fixed Duration'},{value:'ONGOING',label:'Ongoing Service'}]} />
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {() => basicForm.getFieldValue('durationType') === 'FIXED' && (
                <Form.Item name="durationWeeks" label="Duration Weeks" rules={[{ required: true }, { type: 'number', transform: (v)=>Number(v), min: 1, max: 104 }] }>
                  <Input type="number" style={{ width: 220 }} />
                </Form.Item>
              )}
            </Form.Item>
            <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: 220 }} />
            </Form.Item>
            <Form.Item name="workingDays" label="Preferred Working Days">
              <Select mode="multiple" style={{ minWidth: 320 }}>
                {workingDays.map(d => <Option key={d} value={d}>{d}</Option>)}
              </Select>
            </Form.Item>
          </Space>

          <Title level={4} style={{ marginTop: 24 }}>Location Details</Title>
          <Form.Item name="address" label="Client Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space size="large" wrap>
            <Form.Item name="siteType" label="Site Type">
              <Select style={{ minWidth: 220 }}>
                {siteTypes.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="accessRequirements" label="Access Requirements">
              <Select mode="multiple" style={{ minWidth: 320 }}>
                {accessOptions.map(a => <Option key={a} value={a}>{a}</Option>)}
              </Select>
            </Form.Item>
          </Space>
        </Form>
      )}

      {stages[current].key !== 'basic' && (
        <Card size="small" style={{ marginTop: 12 }}>
          <Paragraph>Stage "{stages[current].title}" coming next.</Paragraph>
        </Card>
      )}

      <Space style={{ marginTop: 24 }}>
        <Button onClick={prev} disabled={current === 0}>Back</Button>
        {current < stages.length - 1 && (
          <Button type="primary" onClick={next}>Next</Button>
        )}
        {current === stages.length - 1 && (
          <Button type="primary">Submit Plan</Button>
        )}
      </Space>
    </Card>
  );
};

export default PlanBuilder;


