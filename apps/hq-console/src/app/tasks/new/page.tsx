'use client';

import React, { useState } from 'react';
import { Card, Steps, Form, Input, Select, DatePicker, InputNumber, Button, Space, message } from 'antd';
import DashboardLayout from '@/components/DashboardLayout';
import { Priority, TaskStatus, TaskType } from '@/domain/entities';

const { Step } = Steps;
const { TextArea } = Input;

type BasicInfo = {
  title: string;
  description?: string;
  customerId: string;
};

type BudgetInfo = {
  budget?: number;
  actualCost?: number;
};

type SchedulingInfo = {
  dueDate?: string;
  estimatedHours?: number;
  priority: Priority;
  type: TaskType;
  status: TaskStatus;
};

export default function NewTaskPage() {
  const [current, setCurrent] = useState(0);
  const [basic, setBasic] = useState<BasicInfo>({ title: '', customerId: '' });
  const [budget, setBudget] = useState<BudgetInfo>({});
  const [schedule, setSchedule] = useState<SchedulingInfo>({ priority: Priority.MEDIUM, type: TaskType.OTHER, status: TaskStatus.PENDING });
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { title: 'Basic Information' },
    { title: 'Budget' },
    { title: 'Scheduling' },
    { title: 'Review & Create' },
  ];

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: basic.title,
          description: basic.description,
          customerId: basic.customerId,
          budget: budget.budget,
          actualCost: budget.actualCost,
          dueDate: schedule.dueDate,
          estimatedHours: schedule.estimatedHours,
          priority: schedule.priority,
          type: schedule.type,
          status: schedule.status,
        }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      message.success('Task created');
      window.location.href = '/tasks';
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Error creating task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: 24 }}>
        <Card>
          <Steps current={current} items={steps} style={{ marginBottom: 24 }} />

          {current === 0 && (
            <Form layout="vertical" onFinish={(v) => { setBasic(v); next(); }} initialValues={basic}>
              <Form.Item label="Title" name="title" rules={[{ required: true }]}>
                <Input placeholder="Task title" />
              </Form.Item>
              <Form.Item label="Description" name="description">
                <TextArea rows={3} placeholder="Task description" />
              </Form.Item>
              <Form.Item label="Customer ID" name="customerId" rules={[{ required: true }]}>
                <Input placeholder="Existing customer ID" />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">Next</Button>
              </Space>
            </Form>
          )}

          {current === 1 && (
            <Form layout="vertical" onFinish={(v) => { setBudget(v); next(); }} initialValues={budget}>
              <Form.Item label="Budget (SAR)" name="budget">
                <InputNumber style={{ width: 240 }} min={0} step={1000} />
              </Form.Item>
              <Form.Item label="Actual Cost (SAR)" name="actualCost">
                <InputNumber style={{ width: 240 }} min={0} step={1000} />
              </Form.Item>
              <Space>
                <Button onClick={prev}>Back</Button>
                <Button type="primary" htmlType="submit">Next</Button>
              </Space>
            </Form>
          )}

          {current === 2 && (
            <Form layout="vertical" onFinish={(v) => { setSchedule(v); next(); }} initialValues={schedule}>
              <Form.Item label="Due Date" name="dueDate">
                <DatePicker style={{ width: 240 }} />
              </Form.Item>
              <Form.Item label="Estimated Hours" name="estimatedHours">
                <InputNumber style={{ width: 240 }} min={0} />
              </Form.Item>
              <Form.Item label="Priority" name="priority" rules={[{ required: true }] }>
                <Select style={{ width: 240 }}>
                  {Object.values(Priority).map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item label="Type" name="type" rules={[{ required: true }] }>
                <Select style={{ width: 240 }}>
                  {Object.values(TaskType).map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item label="Status" name="status" rules={[{ required: true }] }>
                <Select style={{ width: 240 }}>
                  {Object.values(TaskStatus).map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                </Select>
              </Form.Item>
              <Space>
                <Button onClick={prev}>Back</Button>
                <Button type="primary" htmlType="submit">Next</Button>
              </Space>
            </Form>
          )}

          {current === 3 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <strong>Title:</strong> {basic.title}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Customer:</strong> {basic.customerId}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Budget:</strong> {budget.budget?.toLocaleString() ?? '—'} SAR
              </div>
              <Space>
                <Button onClick={prev}>Back</Button>
                <Button type="primary" loading={submitting} onClick={handleCreate}>Create Task</Button>
              </Space>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}


