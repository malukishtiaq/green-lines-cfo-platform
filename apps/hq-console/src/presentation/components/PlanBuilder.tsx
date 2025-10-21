'use client';

import React, { useMemo, useState } from 'react';
import { Card, Steps, Button, Form, Input, Select, DatePicker, Space, Typography, message, Table, InputNumber, Checkbox, Modal, Tag, Progress, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, DeleteFilled } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
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

interface Milestone {
  id: string;
  sequence: number;
  name: string;
  durationWeeks: number;
  budgetPercent: number;
  deliverables: string;
  dependencies: string[];
  criticalPath: boolean;
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

const DRAFT_KEY = 'planBuilderDraft';

const PlanBuilder: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);
  const [basicForm] = Form.useForm<BasicInfoForm>();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneForm] = Form.useForm();
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestoneModalVisible, setMilestoneModalVisible] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load draft on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          
          // Handle both old format (basic/milestones) and new format (direct fields)
          if (draft.basic) {
            // Old format
            basicForm.setFieldsValue(draft.basic);
            if (draft.milestones) {
              setMilestones(draft.milestones);
            }
          } else {
            // New format from edit page
            basicForm.setFieldsValue({
              planName: draft.planName,
              description: draft.description,
              industry: draft.industry,
              companySize: draft.companySize,
              durationType: draft.durationType,
              durationWeeks: draft.durationWeeks,
              startDate: draft.startDate,
              workingDays: draft.workingDays,
              address: draft.address,
              siteType: draft.siteType,
              accessRequirements: draft.accessRequirements,
            });
            
            if (draft.milestones) {
              // Convert milestone format if needed
              const convertedMilestones = draft.milestones.map((m: any) => ({
                id: m.id,
                sequence: m.sequence,
                name: m.name,
                durationWeeks: m.durationWeeks,
                budgetPercent: m.budgetAllocation,
                deliverables: m.deliverables || '',
                dependencies: m.dependencies ? (typeof m.dependencies === 'string' ? JSON.parse(m.dependencies) : m.dependencies) : [],
                criticalPath: m.isCriticalPath || false,
              }));
              setMilestones(convertedMilestones);
            }
          }
          
          if (draft.currentStage !== undefined) {
            setCurrent(draft.currentStage);
          }
          if (draft.lastSaved) {
            setLastSaved(draft.lastSaved);
          }
          setDraftLoaded(true);
          
          if (draft.isEdit) {
            message.info('Plan data loaded. You can now edit your plan.');
          } else {
            message.info('Draft loaded. Continue where you left off!');
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
        }
      }
    }
  }, [basicForm]);

  // Auto-save draft on changes
  React.useEffect(() => {
    if (draftLoaded || milestones.length > 0) {
      const timestamp = new Date().toISOString();
      const basicValues = basicForm.getFieldsValue();
      
      // Check if we're in edit mode by looking for existing draft
      const existingDraft = localStorage.getItem(DRAFT_KEY);
      let isEditMode = false;
      let planId = null;
      let customerId = null;
      
      if (existingDraft) {
        try {
          const parsed = JSON.parse(existingDraft);
          isEditMode = parsed.isEdit;
          planId = parsed.planId;
          customerId = parsed.customerId;
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      const draft = isEditMode ? {
        // Edit mode format
        planName: basicValues.planName,
        description: basicValues.description,
        industry: basicValues.industry,
        companySize: basicValues.companySize,
        durationType: basicValues.durationType,
        durationWeeks: basicValues.durationWeeks,
        startDate: basicValues.startDate,
        workingDays: basicValues.workingDays,
        address: basicValues.address,
        siteType: basicValues.siteType,
        accessRequirements: basicValues.accessRequirements,
        milestones: milestones.map(m => ({
          id: m.id,
          sequence: m.sequence,
          name: m.name,
          durationWeeks: m.durationWeeks,
          budgetAllocation: m.budgetPercent,
          deliverables: m.deliverables,
          dependencies: JSON.stringify(m.dependencies),
          isCriticalPath: m.criticalPath,
        })),
        planId,
        customerId,
        currentStage: current,
        lastSaved: timestamp,
        isEdit: true,
      } : {
        // New plan format
        basic: basicValues,
        milestones,
        currentStage: current,
        lastSaved: timestamp,
      };
      
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(timestamp);
    }
  }, [basicForm, milestones, current, draftLoaded]);

  const stages: { key: StageKey; title: string }[] = useMemo(() => ([
    { key: 'basic', title: 'Basic Information' },
    { key: 'milestones', title: 'Milestones' },
    { key: 'resources', title: 'Resources' },
    { key: 'cfo', title: 'CFO Analysis' },
    { key: 'services', title: 'Services & Partners' },
    { key: 'attachments', title: 'Attachments' },
    { key: 'review', title: 'Review' },
  ]), []);

  const totalBudget = useMemo(() => {
    return milestones.reduce((sum, m) => sum + m.budgetPercent, 0);
  }, [milestones]);

  const next = async () => {
    if (stages[current].key === 'basic') {
      try {
        await basicForm.validateFields();
      } catch {
        message.error('Please complete required fields');
        return;
      }
    }
    if (stages[current].key === 'milestones') {
      if (milestones.length === 0) {
        message.error('Please add at least one milestone');
        return;
      }
      if (Math.abs(totalBudget - 100) > 0.01) {
        message.error(`Budget must total 100% (currently ${totalBudget.toFixed(1)}%)`);
        return;
      }
    }
    setCurrent((c) => Math.min(c + 1, stages.length - 1));
  };

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const openMilestoneModal = (milestone?: Milestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      milestoneForm.setFieldsValue(milestone);
    } else {
      setEditingMilestone(null);
      milestoneForm.resetFields();
      milestoneForm.setFieldsValue({ sequence: milestones.length + 1, criticalPath: false });
    }
    setMilestoneModalVisible(true);
  };

  const saveMilestone = async () => {
    try {
      const values = await milestoneForm.validateFields();
      if (editingMilestone) {
        setMilestones(prev => prev.map(m => m.id === editingMilestone.id ? { ...editingMilestone, ...values } : m));
        message.success('Milestone updated');
      } else {
        const newMilestone: Milestone = {
          id: Date.now().toString(),
          ...values,
        };
        setMilestones(prev => [...prev, newMilestone]);
        message.success('Milestone added');
      }
      setMilestoneModalVisible(false);
    } catch (err) {
      message.error('Please complete all required fields');
    }
  };

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    message.success('Milestone deleted');
  };

  const handleSubmit = async () => {
    try {
      // TODO: Implement actual submission logic
      const planData = {
        basic: basicForm.getFieldsValue(),
        milestones,
      };
      console.log('Plan Data:', planData);
      message.success('Plan submitted successfully!');
      
      // Clear draft after successful submission
      localStorage.removeItem(DRAFT_KEY);
      
      // Reset form
      basicForm.resetFields();
      setMilestones([]);
      setCurrent(0);
      
      // TODO: Navigate to plans list or plan detail page
    } catch (error) {
      message.error('Failed to submit plan');
    }
  };

  const clearDraft = () => {
    Modal.confirm({
      title: 'Clear Draft?',
      content: 'Are you sure you want to discard this draft? This action cannot be undone.',
      okText: 'Yes, Clear Draft',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        localStorage.removeItem(DRAFT_KEY);
        basicForm.resetFields();
        setMilestones([]);
        setCurrent(0);
        message.success('Draft cleared');
      },
    });
  };

  return (
    <Card variant="borderless">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>Plan Builder</Title>
        <Space>
          {(draftLoaded || milestones.length > 0) && (
            <>
              <Tooltip title={lastSaved ? `Last saved: ${new Date(lastSaved).toLocaleString()}` : 'Draft saved'}>
                <Tag icon={<SaveOutlined />} color="blue">Draft Auto-Saved</Tag>
              </Tooltip>
              <Button size="small" danger icon={<DeleteFilled />} onClick={clearDraft}>
                Clear Draft
              </Button>
            </>
          )}
        </Space>
      </div>
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

      {stages[current].key === 'milestones' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>Milestone Planning</Title>
              <Text type="secondary">Define project phases with budget allocation</Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openMilestoneModal()}>Add Milestone</Button>
          </div>

          {milestones.length > 0 && (
            <>
              <Card 
                size="small" 
                style={{ 
                  marginBottom: 16, 
                  backgroundColor: totalBudget === 100 ? '#f6ffed' : '#fff2e8',
                  border: totalBudget === 100 ? '1px solid #b7eb8f' : '1px solid #ffbb96'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>Budget Allocation: {totalBudget.toFixed(1)}%</Text>
                  {totalBudget === 100 ? (
                    <Tag color="success">✓ Budget Complete</Tag>
                  ) : (
                    <Tag color="warning">{totalBudget < 100 ? `${(100 - totalBudget).toFixed(1)}% remaining` : `${(totalBudget - 100).toFixed(1)}% over budget`}</Tag>
                  )}
                </div>
                <Progress percent={Math.min(totalBudget, 100)} status={totalBudget === 100 ? 'success' : totalBudget > 100 ? 'exception' : 'active'} style={{ marginTop: 8 }} />
                {totalBudget !== 100 && (
                  <Text type="warning" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                    ⚠️ Budget must total exactly 100% to proceed to next stage
                  </Text>
                )}
              </Card>

              <Table
                dataSource={milestones}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Seq', dataIndex: 'sequence', key: 'sequence', width: 60 },
                  { title: 'Name', dataIndex: 'name', key: 'name', render: (text: string, record: Milestone) => (
                    <span>{text} {record.criticalPath && <Tag color="red" style={{ marginLeft: 8 }}>Critical</Tag>}</span>
                  )},
                  { title: 'Duration (weeks)', dataIndex: 'durationWeeks', key: 'durationWeeks', width: 140 },
                  { title: 'Budget %', dataIndex: 'budgetPercent', key: 'budgetPercent', width: 100, render: (v: number) => `${v}%` },
                  { title: 'Actions', key: 'actions', width: 120, render: (_: any, record: Milestone) => (
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openMilestoneModal(record)} />
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteMilestone(record.id)} />
                    </Space>
                  )},
                ]}
              />

              <Card size="small" style={{ marginTop: 16 }} title="Visual Timeline">
                <div>
                  {milestones.sort((a, b) => a.sequence - b.sequence).map((m, idx) => {
                    let cumulativeWeeks = 0;
                    for (let i = 0; i < idx; i++) {
                      cumulativeWeeks += milestones[i].durationWeeks;
                    }
                    return (
                      <div key={m.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                          <Text strong style={{ minWidth: 100 }}>Week {cumulativeWeeks + 1}-{cumulativeWeeks + m.durationWeeks}:</Text>
                          <Text>{m.name}</Text>
                          {m.criticalPath && <Tag color="red" style={{ marginLeft: 8 }}>Critical</Tag>}
                          <Text type="secondary" style={{ marginLeft: 'auto' }}>[{m.budgetPercent}%]</Text>
                        </div>
                        <Progress percent={m.budgetPercent} showInfo={false} strokeColor={m.criticalPath ? '#ff4d4f' : '#1890ff'} />
                        {m.deliverables && (
                          <Text type="secondary" style={{ fontSize: 12 }}>✓ {m.deliverables}</Text>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}

          {milestones.length === 0 && (
            <Card size="small" style={{ textAlign: 'center', padding: '40px 0' }}>
              <Paragraph type="secondary">No milestones added yet. Click "Add Milestone" to begin.</Paragraph>
            </Card>
          )}
        </div>
      )}

      {stages[current].key !== 'basic' && stages[current].key !== 'milestones' && (
        <Card size="small" style={{ marginTop: 12 }}>
          <Paragraph>Stage "{stages[current].title}" coming next.</Paragraph>
        </Card>
      )}

      <Modal
        open={milestoneModalVisible}
        title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
        onCancel={() => setMilestoneModalVisible(false)}
        onOk={saveMilestone}
        okText="Save"
        width={600}
      >
        <Form form={milestoneForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="sequence" label="Sequence Number" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="name" label="Milestone Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g., Planning & Assessment" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="durationWeeks" label="Duration (weeks)" rules={[{ required: true }, { type: 'number', min: 1, max: 52 }]}>
              <InputNumber min={1} max={52} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="budgetPercent" label="Budget Allocation %" rules={[{ required: true }, { type: 'number', min: 0, max: 100 }]}>
              <InputNumber min={0} max={100} step={0.1} style={{ width: 150 }} />
            </Form.Item>
          </Space>
          <Form.Item name="deliverables" label="Deliverables" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="e.g., Site Survey, Technical Design, Equipment Procurement" />
          </Form.Item>
          <Form.Item name="dependencies" label="Dependencies (previous milestones)">
            <Select mode="multiple" placeholder="Select dependencies">
              {milestones.filter(m => !editingMilestone || m.id !== editingMilestone.id).map(m => (
                <Option key={m.id} value={m.id}>Phase {m.sequence}: {m.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="criticalPath" valuePropName="checked">
            <Checkbox>Mark as Critical Path</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Space style={{ marginTop: 24 }}>
        <Button onClick={prev} disabled={current === 0}>Back</Button>
        {current < stages.length - 1 && (
          <>
            {stages[current].key === 'milestones' && totalBudget !== 100 ? (
              <Tooltip title={`Budget must total 100% (currently ${totalBudget.toFixed(1)}%). Add/edit milestones to reach 100%.`}>
                <Button type="primary" disabled>Next</Button>
              </Tooltip>
            ) : (
              <Button type="primary" onClick={next}>Next</Button>
            )}
          </>
        )}
        {current === stages.length - 1 && (
          <Button type="primary" onClick={handleSubmit}>Submit Plan</Button>
        )}
      </Space>
    </Card>
  );
};

export default PlanBuilder;


