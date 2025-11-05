'use client';

import React, { useMemo, useState } from 'react';
import { Card, Steps, Button, Form, Input, Select, DatePicker, Space, Typography, message, Table, InputNumber, Checkbox, Modal, Tag, Progress, Tooltip, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, DeleteFilled } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

type StageKey = 'basic' | 'erp' | 'kpis' | 'milestones' | 'governance' | 'pricing' | 'assignments' | 'review';

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

interface ERPForm {
  erpType: string;
  erpStatus: string;
  dataDomains: string[];
  mappingHealth?: number;
  lastSync?: string;
}

interface KPIItem {
  id: string;
  kpiCode: string;
  kpiName: string;
  targetValue: number;
  thresholdGreen: number;
  thresholdAmber: number;
  thresholdRed: number;
  weight: number;
  calculationSource: string;
  effectiveFrom: string;
  effectiveTo?: string;
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

interface GovernanceForm {
  approvalMode: 'MODE_A' | 'MODE_B' | 'MODE_C';
  notificationChannels: string[];
  reportCadence: string;
  slaResponseHours: number;
  escalationEnabled: boolean;
}

interface PricingForm {
  package: string;
  addOns: string[];
  basePrice: number;
  totalPrice: number;
  platformCommissionPct: number;
  partnerCommissionPct: number;
  payoutDelayDays: number;
  refundPolicy: string;
  contractStartDate: string;
  contractEndDate: string;
  paymentTerms: string;
}

interface AssignmentItem {
  id: string;
  type: string;
  partnerId?: string;
  partnerName?: string;
  assignmentOwner: string;
  slaHours: number;
  dueDate: string;
  priority: string;
  notes?: string;
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

// ERP Types
const erpTypes = [
  { value: 'NONE', label: 'No ERP / Manual Entry' },
  { value: 'ODOO', label: 'Odoo' },
  { value: 'SAP', label: 'SAP' },
  { value: 'QUICKBOOKS', label: 'QuickBooks' },
  { value: 'ZOHO', label: 'Zoho Books' },
  { value: 'MANUAL', label: 'Manual/CSV Import' },
];

const dataDomainOptions = [
  'AR (Accounts Receivable)',
  'AP (Accounts Payable)',
  'GL (General Ledger)',
  'Sales',
  'Inventory',
  'Payroll',
  'Assets',
  'Banking',
];

// Sample KPI Catalog (first 20 from Master KPI Catalog)
const kpiCatalog = [
  { code: 'FIN.REV_GROWTH', name: 'Revenue Growth %', industry: 'Cross-Industry', dataSource: 'GL, Sales Ledger' },
  { code: 'FIN.GM%', name: 'Gross Margin %', industry: 'Cross-Industry', dataSource: 'GL, COGS' },
  { code: 'FIN.OP_MARGIN%', name: 'Operating Margin %', industry: 'Cross-Industry', dataSource: 'GL' },
  { code: 'FIN.NET_MARGIN%', name: 'Net Profit Margin %', industry: 'Cross-Industry', dataSource: 'GL' },
  { code: 'FIN.EBITDA_MARGIN%', name: 'EBITDA Margin %', industry: 'Cross-Industry', dataSource: 'GL' },
  { code: 'WC.CCC', name: 'Cash Conversion Cycle (days)', industry: 'Cross-Industry', dataSource: 'AR, AP, Inventory' },
  { code: 'WC.DSO', name: 'Days Sales Outstanding', industry: 'Cross-Industry', dataSource: 'AR' },
  { code: 'WC.DPO', name: 'Days Payables Outstanding', industry: 'Cross-Industry', dataSource: 'AP, COGS' },
  { code: 'WC.DIO', name: 'Days Inventory Outstanding', industry: 'Cross-Industry', dataSource: 'Inventory, COGS' },
  { code: 'INV.TURN', name: 'Inventory Turnover (x)', industry: 'Cross-Industry', dataSource: 'Inventory, COGS' },
  { code: 'FIN.CURRENT_RATIO', name: 'Current Ratio', industry: 'Cross-Industry', dataSource: 'Balance Sheet' },
  { code: 'FIN.QUICK_RATIO', name: 'Quick Ratio', industry: 'Cross-Industry', dataSource: 'Balance Sheet' },
  { code: 'FIN.ROA%', name: 'Return on Assets %', industry: 'Cross-Industry', dataSource: 'GL, Balance Sheet' },
  { code: 'FIN.ROE%', name: 'Return on Equity %', industry: 'Cross-Industry', dataSource: 'GL, Balance Sheet' },
  { code: 'AR.AGING_90+%', name: 'AR >90 Days %', industry: 'Cross-Industry', dataSource: 'AR Aging' },
  { code: 'RTL.SSS_GROWTH%', name: 'Same-Store Sales Growth %', industry: 'Retail', dataSource: 'POS' },
  { code: 'RTL.AOV', name: 'Average Order Value', industry: 'Retail', dataSource: 'POS, eCom' },
  { code: 'RTL.CONV_RATE%', name: 'Conversion Rate %', industry: 'Retail', dataSource: 'Web Analytics, POS' },
  { code: 'MFG.OEE', name: 'Overall Equipment Effectiveness', industry: 'Manufacturing', dataSource: 'MES, Production' },
  { code: 'CS.NPS', name: 'Net Promoter Score', industry: 'Cross-Industry', dataSource: 'Surveys' },
];

const packageOptions = [
  { value: 'BASIC', label: 'Basic Package', price: 5000 },
  { value: 'STANDARD', label: 'Standard Package', price: 10000 },
  { value: 'PREMIUM', label: 'Premium Package', price: 20000 },
  { value: 'CUSTOM', label: 'Custom Package', price: 0 },
];

const addOnOptions = [
  { value: 'EXTRA_USERS', label: 'Extra Users (+5)', price: 1000 },
  { value: 'ADVANCED_REPORTING', label: 'Advanced Reporting', price: 2000 },
  { value: 'API_ACCESS', label: 'API Access', price: 1500 },
  { value: 'DEDICATED_SUPPORT', label: 'Dedicated Support', price: 3000 },
  { value: 'TRAINING_PACKAGE', label: 'Training Package', price: 2500 },
];

const DRAFT_KEY = 'planBuilderDraft';

const PlanBuilder: React.FC = () => {
  const { modal } = App.useApp();
  const [current, setCurrent] = useState<number>(0);
  
  // Forms for each stage
  const [basicForm] = Form.useForm<BasicInfoForm>();
  const [erpForm] = Form.useForm<ERPForm>();
  const [governanceForm] = Form.useForm<GovernanceForm>();
  const [pricingForm] = Form.useForm<PricingForm>();
  
  // Stage-specific state
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [kpis, setKPIs] = useState<KPIItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  
  // Modal states
  const [milestoneForm] = Form.useForm();
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestoneModalVisible, setMilestoneModalVisible] = useState(false);
  
  const [kpiForm] = Form.useForm();
  const [editingKPI, setEditingKPI] = useState<KPIItem | null>(null);
  const [kpiModalVisible, setKPIModalVisible] = useState(false);
  
  const [assignmentForm] = Form.useForm();
  const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | null>(null);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  
  // General state
  const [submitting, setSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [autoEditMilestone, setAutoEditMilestone] = useState<string | null>(null);

  // Check for milestone parameter in URL
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const milestoneId = urlParams.get('milestone');
      if (milestoneId) {
        setAutoEditMilestone(milestoneId);
      }
    }
  }, []);

  // Load draft on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          
          // Validate draft has minimum required structure
          if (!draft || typeof draft !== 'object') {
            console.warn('Invalid draft structure, clearing...');
            localStorage.removeItem(DRAFT_KEY);
            return;
          }
          
          // Load draft fields into form (with defaults for missing fields)
          basicForm.setFieldsValue({
            planName: draft.planName || '',
            description: draft.description || '',
            industry: draft.industry || '',
            companySize: draft.companySize || '',
            durationType: draft.durationType || 'FIXED',
            durationWeeks: draft.durationWeeks,
            startDate: draft.startDate,
            workingDays: Array.isArray(draft.workingDays) ? draft.workingDays : [],
            address: draft.address || '',
            siteType: draft.siteType || '',
            accessRequirements: Array.isArray(draft.accessRequirements) ? draft.accessRequirements : [],
          });
          
          if (draft.milestones && Array.isArray(draft.milestones)) {
            console.log('Loading milestones from draft:', draft.milestones);
            // Handle milestones - convert from database format to component format
            const convertedMilestones = draft.milestones.map((m: any) => ({
              id: m.id || `milestone-${Date.now()}-${Math.random()}`,
              sequence: m.sequence || 1,
              name: m.name || '',
              durationWeeks: m.durationWeeks || 0,
              budgetPercent: parseFloat(m.budgetAllocation || m.budgetPercent || 0),
              deliverables: m.deliverables || '',
              dependencies: Array.isArray(m.dependencies) ? m.dependencies : [],
              criticalPath: m.isCriticalPath || m.criticalPath || false,
            }));
            console.log('Converted milestones:', convertedMilestones);
            setMilestones(convertedMilestones);
          }
          
          if (draft.currentStage !== undefined) {
            setCurrent(draft.currentStage);
          }
          if (draft.lastSaved) {
            setLastSaved(draft.lastSaved);
          }
          setDraftLoaded(true);
          
          // Show info message after React finishes rendering to avoid compatibility warning
          setTimeout(() => {
            if (draft.isEdit) {
              message.info('Plan data loaded. You can now edit your plan.');
            } else {
              message.info('Draft loaded. Continue where you left off!');
            }
          }, 300);
        } catch (error) {
          console.error('Failed to load draft:', error);
          // Clear corrupted draft
          console.warn('Clearing corrupted draft...');
          localStorage.removeItem(DRAFT_KEY);
          message.warning('Previous draft was corrupted and has been cleared. Starting fresh.');
        }
      }
    }
  }, [basicForm]);

  // Auto-open milestone edit modal when milestone parameter is present and milestones are loaded
  React.useEffect(() => {
    if (autoEditMilestone && milestones.length > 0 && draftLoaded) {
      const milestoneToEdit = milestones.find(m => m.id === autoEditMilestone);
      if (milestoneToEdit) {
        console.log('Auto-opening milestone edit modal for:', milestoneToEdit.name);
        // Set current stage to milestones (stage 1)
        setCurrent(1);
        // Open the milestone edit modal
        setEditingMilestone(milestoneToEdit);
        milestoneForm.setFieldsValue(milestoneToEdit);
        setMilestoneModalVisible(true);
        // Clear the auto-edit flag
        setAutoEditMilestone(null);
        // Clean up URL parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('milestone');
        window.history.replaceState({}, '', url.toString());
        // Show success message
        message.success(`Editing milestone: ${milestoneToEdit.name}`);
      }
    }
  }, [autoEditMilestone, milestones, draftLoaded, milestoneForm]);

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
      
      // Use consistent format for both edit and new plan modes
      const draft = {
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
          budgetPercent: m.budgetPercent,
          deliverables: m.deliverables,
          dependencies: m.dependencies,
          criticalPath: m.criticalPath,
        })),
        planId: isEditMode ? planId : null,
        customerId: isEditMode ? customerId : null,
        currentStage: current,
        lastSaved: timestamp,
        isEdit: isEditMode,
      };
      
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(timestamp);
    }
  }, [basicForm, milestones, current, draftLoaded]);

  const stages: { key: StageKey; title: string }[] = useMemo(() => ([
    { key: 'basic', title: 'Client & Scope' },
    { key: 'erp', title: 'Baseline & Data Sources' },
    { key: 'kpis', title: 'KPIs & Targets' },
    { key: 'milestones', title: 'Milestones & Timeline' },
    { key: 'governance', title: 'Workflow & Governance' },
    { key: 'pricing', title: 'Pricing & Commercials' },
    { key: 'assignments', title: 'Assignments & Partners' },
    { key: 'review', title: 'Review & Approval' },
  ]), []);

  const clamped = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const safeCurrent = clamped(current, 0, stages.length - 1);

  const totalBudget = useMemo(() => {
    return milestones.reduce((sum, m) => sum + m.budgetPercent, 0);
  }, [milestones]);

  const totalKPIWeight = useMemo(() => {
    return kpis.reduce((sum, k) => sum + k.weight, 0);
  }, [kpis]);

  const totalPrice = useMemo(() => {
    const basePackage = packageOptions.find(p => p.value === selectedPackage);
    const basePrice = basePackage?.price || 0;
    const addOnsPrice = selectedAddOns.reduce((sum, addOnValue) => {
      const addOn = addOnOptions.find(a => a.value === addOnValue);
      return sum + (addOn?.price || 0);
    }, 0);
    return basePrice + addOnsPrice;
  }, [selectedPackage, selectedAddOns]);

  const next = async () => {
    // Stage 1: Basic Information validation
    if (stages[safeCurrent]?.key === 'basic') {
      try {
        await basicForm.validateFields();
      } catch {
        message.error('Please complete required fields');
        return;
      }
    }
    
    // Stage 2: ERP validation (optional but if filled, check completion)
    if (stages[safeCurrent]?.key === 'erp') {
      const erpValues = erpForm.getFieldsValue();
      if (erpValues.erpType && erpValues.erpType !== 'NONE' && (!erpValues.dataDomains || erpValues.dataDomains.length === 0)) {
        message.error('Please select at least one data domain for ERP integration');
        return;
      }
    }
    
    // Stage 3: KPIs validation
    if (stages[safeCurrent]?.key === 'kpis') {
      if (kpis.length === 0) {
        message.error('Please add at least one KPI to track');
        return;
      }
      if (Math.abs(totalKPIWeight - 100) > 0.01) {
        message.error(`KPI weights must total 100% (currently ${totalKPIWeight.toFixed(1)}%)`);
        return;
      }
    }
    
    // Stage 4: Milestones validation
    if (stages[safeCurrent]?.key === 'milestones') {
      if (milestones.length === 0) {
        message.error('Please add at least one milestone');
        return;
      }
      if (Math.abs(totalBudget - 100) > 0.01) {
        message.error(`Budget must total 100% (currently ${totalBudget.toFixed(1)}%)`);
        return;
      }
    }
    
    // Stage 5: Governance validation
    if (stages[safeCurrent]?.key === 'governance') {
      try {
        await governanceForm.validateFields();
      } catch {
        message.error('Please complete governance settings');
        return;
      }
    }
    
    // Stage 6: Pricing validation
    if (stages[safeCurrent]?.key === 'pricing') {
      try {
        await pricingForm.validateFields();
      } catch {
        message.error('Please complete pricing details');
        return;
      }
      if (!selectedPackage) {
        message.error('Please select a package');
        return;
      }
    }
    
    // Stage 7: Assignments validation
    if (stages[safeCurrent]?.key === 'assignments') {
      if (assignments.length === 0) {
        message.warning('No assignments created. You can add them later.');
        // Allow proceeding without assignments
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

  // KPI Modal Handlers
  const openKPIModal = (kpi?: KPIItem) => {
    if (kpi) {
      setEditingKPI(kpi);
      kpiForm.setFieldsValue(kpi);
    } else {
      setEditingKPI(null);
      kpiForm.resetFields();
      kpiForm.setFieldsValue({ 
        thresholdGreen: 90, 
        thresholdAmber: 70, 
        thresholdRed: 50,
        weight: 0,
        effectiveFrom: new Date().toISOString().split('T')[0]
      });
    }
    setKPIModalVisible(true);
  };

  const saveKPI = async () => {
    try {
      const values = await kpiForm.validateFields();
      if (editingKPI) {
        setKPIs(prev => prev.map(k => k.id === editingKPI.id ? { ...editingKPI, ...values } : k));
        message.success('KPI updated');
      } else {
        const newKPI: KPIItem = {
          id: Date.now().toString(),
          ...values,
        };
        setKPIs(prev => [...prev, newKPI]);
        message.success('KPI added');
      }
      setKPIModalVisible(false);
    } catch (err) {
      message.error('Please complete all required fields');
    }
  };

  const deleteKPI = (id: string) => {
    setKPIs(prev => prev.filter(k => k.id !== id));
    message.success('KPI deleted');
  };

  const addKPIFromCatalog = (catalogKPI: typeof kpiCatalog[0]) => {
    const newKPI: KPIItem = {
      id: Date.now().toString(),
      kpiCode: catalogKPI.code,
      kpiName: catalogKPI.name,
      targetValue: 0,
      thresholdGreen: 90,
      thresholdAmber: 70,
      thresholdRed: 50,
      weight: 0,
      calculationSource: catalogKPI.dataSource,
      effectiveFrom: new Date().toISOString().split('T')[0],
    };
    setKPIs(prev => [...prev, newKPI]);
    message.success(`Added ${catalogKPI.name} to KPIs`);
  };

  // Assignment Modal Handlers
  const openAssignmentModal = (assignment?: AssignmentItem) => {
    if (assignment) {
      setEditingAssignment(assignment);
      assignmentForm.setFieldsValue(assignment);
    } else {
      setEditingAssignment(null);
      assignmentForm.resetFields();
      assignmentForm.setFieldsValue({ 
        type: 'SETUP',
        slaHours: 24,
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    setAssignmentModalVisible(true);
  };

  const saveAssignment = async () => {
    try {
      const values = await assignmentForm.validateFields();
      if (editingAssignment) {
        setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? { ...editingAssignment, ...values } : a));
        message.success('Assignment updated');
      } else {
        const newAssignment: AssignmentItem = {
          id: Date.now().toString(),
          ...values,
        };
        setAssignments(prev => [...prev, newAssignment]);
        message.success('Assignment created');
      }
      setAssignmentModalVisible(false);
    } catch (err) {
      message.error('Please complete all required fields');
    }
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    message.success('Assignment deleted');
  };

  const handleSubmit = async () => {
    console.log('🚀 Submit button clicked!');
    console.log('📝 Starting plan submission directly...');
    await submitPlan();
  };

  const submitPlan = async () => {
    try {
      console.log('📝 Starting plan submission...');
      setSubmitting(true);
      
      // Validate form FIRST before getting values
      try {
        await basicForm.validateFields();
        console.log('✅ Form validation passed');
      } catch (error) {
        console.log('❌ Form validation failed:', error);
        message.error('Please fill in all required fields in the Basic Information stage');
        setSubmitting(false);
        setCurrent(0); // Go back to stage 1
        return;
      }
      
      // Get ALL form values (including untouched fields)
      const basicValues = basicForm.getFieldsValue(true);
      console.log('📋 Basic form values (all):', basicValues);
      console.log('📋 Plan name specifically:', basicValues.planName);
      console.log('📋 Form instance fields:', basicForm.getFieldValue('planName'));
      
      // Critical check: Ensure we have a plan name
      if (!basicValues.planName && !basicForm.getFieldValue('planName')) {
        console.error('❌ CRITICAL: Plan name is missing!');
        console.error('Form values:', basicForm.getFieldsValue());
        console.error('Form touched:', basicForm.isFieldsTouched());
        message.error('Plan name is required. Please go back to Stage 1 and enter a plan name.');
        setSubmitting(false);
        setCurrent(0); // Go back to stage 1
        return;
      }
      
      // Use direct field value if getFieldsValue doesn't work
      const planName = basicValues.planName || basicForm.getFieldValue('planName');
      
      // Check if we're in edit mode
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

      // Prepare the plan data for API with proper type conversions
      const planData = {
        name: planName,
        description: basicValues.description || basicForm.getFieldValue('description') || '',
        industry: basicValues.industry || basicForm.getFieldValue('industry') || '',
        companySize: basicValues.companySize || basicForm.getFieldValue('companySize') || '',
        durationType: basicValues.durationType || basicForm.getFieldValue('durationType') || 'FIXED',
        durationWeeks: parseInt(basicValues.durationWeeks || basicForm.getFieldValue('durationWeeks') || '0') || undefined,
        startDate: basicValues.startDate || basicForm.getFieldValue('startDate') || undefined,
        workingDays: parseInt(basicValues.workingDays || basicForm.getFieldValue('workingDays') || '5') || 5,
        address: basicValues.address || basicForm.getFieldValue('address') || '',
        siteType: basicValues.siteType || basicForm.getFieldValue('siteType') || '',
        accessRequirements: Array.isArray(basicValues.accessRequirements) 
          ? basicValues.accessRequirements.filter(Boolean).join(', ') 
          : (basicValues.accessRequirements || basicForm.getFieldValue('accessRequirements') || ''),
        totalBudget: milestones.reduce((sum, m) => sum + (parseFloat(String(m.budgetPercent)) || 0), 0),
        currency: 'SAR',
        notes: `Plan created with ${milestones.length} milestones. Completed up to stage ${current + 1}.`,
        status: 'ACTIVE', // Always ACTIVE when submitting (not DRAFT)
        currentStage: current + 1,
        totalStages: 2, // Updated total stages
        // Include milestones data for API
        milestones: milestones.map(m => ({
          sequence: m.sequence,
          name: m.name,
          description: m.deliverables, // Use deliverables as description
          durationWeeks: m.durationWeeks,
          budgetPercent: m.budgetPercent, // Send as budgetPercent for API to map to budgetAllocation
          deliverables: m.deliverables,
          dependencies: m.dependencies,
          criticalPath: m.criticalPath,
        })),
      };

      console.log('📤 Sending plan data:', planData);

      let response;
      if (isEditMode && planId) {
        console.log('🔄 Updating existing plan:', planId);
        // Update existing plan
        response = await fetch(`/api/plans/${planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        });
      } else {
        console.log('🆕 Creating new plan...');
        // Create new plan
        response = await fetch('/api/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        });
      }
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

      let result;
      try {
        const responseText = await response.text();
        console.log('📡 Raw response text:', responseText);
        
        if (responseText) {
          result = JSON.parse(responseText);
          console.log('📡 Parsed response:', result);
        } else {
          result = null;
          console.log('📡 Empty response');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        result = null;
      }
      
      // Treat any 2xx as success to avoid client-side stalls
      if (response.ok && (result == null || result.success === true)) {
        console.log('✅ Plan saved (HTTP OK). Proceeding to clear draft and redirect.');
        try { localStorage.removeItem(DRAFT_KEY); } catch {}
        window.location.href = '/plans';
        return;
      }
      
      if (result && result.success) {
        console.log('✅ Plan saved successfully!', result.data);
        message.success(isEditMode ? 'Plan updated successfully!' : 'Plan created successfully!');
        
        // Clear draft after successful submission
        console.log('🗑️ Clearing draft...');
        localStorage.removeItem(DRAFT_KEY);
        
        // Reset form
        console.log('🔄 Resetting form...');
        basicForm.resetFields();
        setMilestones([]);
        setCurrent(0);
        
        // Navigate to plans list
        console.log('🚀 Redirecting to plans list...');
        window.location.href = '/plans';
      } else {
        console.error('❌ API Error:', result);
        const errorMessage = result?.error || result?.message || `Failed to save plan (status ${response.status})`;
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting plan:', error);
      message.error('Failed to submit plan');
    } finally {
      setSubmitting(false);
    }
  };

  const clearDraft = () => {
    console.log('🗑️ Clearing draft immediately...');
    localStorage.removeItem(DRAFT_KEY);
    basicForm.resetFields();
    setMilestones([]);
    setCurrent(0);
    setDraftLoaded(false);
    setLastSaved(null);
    message.success('Draft cleared successfully');
    console.log('✅ Draft cleared!');
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
      <Steps current={safeCurrent} responsive style={{ marginBottom: 24 }}>
        {stages.map(s => (<Step key={s.key} title={s.title} />))}
      </Steps>

      {stages[safeCurrent]?.key === 'basic' && (
        <Form form={basicForm} layout="vertical" initialValues={{ durationType: 'FIXED', workingDays: [], accessRequirements: [] }}>
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

      {/* Stage 2: ERP & Data Sources */}
      {stages[safeCurrent]?.key === 'erp' && (
        <Form form={erpForm} layout="vertical" initialValues={{ erpType: 'NONE', dataDomains: [], mappingHealth: 0 }}>
          <Title level={4}>Baseline & Data Sources</Title>
          <Paragraph type="secondary">
            Connect your ERP system to automatically sync financial data, or choose manual entry for complete control.
          </Paragraph>

          <Form.Item name="erpType" label="ERP System" rules={[{ required: true }]}>
            <Select style={{ width: '100%' }} options={erpTypes} onChange={(value) => {
              if (value === 'NONE' || value === 'MANUAL') {
                erpForm.setFieldsValue({ dataDomains: [], mappingHealth: 0 });
              }
            }} />
          </Form.Item>

          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.erpType !== currentValues.erpType} noStyle>
            {() => {
              const erpType = erpForm.getFieldValue('erpType');
              return erpType && erpType !== 'NONE' ? (
                <>
                  <Form.Item name="erpStatus" label="Connection Status">
                    <Select style={{ width: '100%' }}>
                      <Option value="NOT_CONNECTED">Not Connected</Option>
                      <Option value="CONNECTING">Connecting...</Option>
                      <Option value="CONNECTED">Connected</Option>
                      <Option value="ERROR">Connection Error</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="dataDomains" label="Data Domains to Sync" rules={[{ required: true, message: 'Select at least one data domain' }]}>
                    <Select mode="multiple" style={{ width: '100%' }} placeholder="Select data domains">
                      {dataDomainOptions.map(d => <Option key={d} value={d}>{d}</Option>)}
                    </Select>
                  </Form.Item>

                  <Form.Item name="mappingHealth" label="Field Mapping Health %">
                    <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" placeholder="0-100" />
                  </Form.Item>

                  <Form.Item name="lastSync" label="Last Sync">
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>

                  <Space size="middle" style={{ marginTop: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />}>Connect ERP</Button>
                    <Button icon={<ReloadOutlined />}>Test Sync</Button>
                    <Button>Import CSV</Button>
                  </Space>
                </>
              ) : null;
            }}
          </Form.Item>

          <Card size="small" style={{ marginTop: 24, backgroundColor: '#f0f5ff' }}>
            <Paragraph>
              <strong>💡 ERP Integration Benefits:</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Automatic data sync - no manual entry</li>
                <li>Real-time KPI tracking</li>
                <li>Reduced errors and discrepancies</li>
                <li>Historical data analysis</li>
              </ul>
            </Paragraph>
          </Card>
        </Form>
      )}

      {/* Stage 3: KPIs & Targets */}
      {stages[safeCurrent]?.key === 'kpis' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>KPIs & Targets</Title>
              <Text type="secondary">Select and configure key performance indicators to track plan success</Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openKPIModal()}>Add Custom KPI</Button>
          </div>

          {/* KPI Weight Summary */}
          {kpis.length > 0 && (
            <Card 
              size="small" 
              style={{ 
                marginBottom: 16, 
                backgroundColor: totalKPIWeight === 100 ? '#f6ffed' : '#fff2e8',
                border: totalKPIWeight === 100 ? '1px solid #b7eb8f' : '1px solid #ffbb96'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Total KPI Weight: {totalKPIWeight.toFixed(1)}%</Text>
                {totalKPIWeight === 100 ? (
                  <Tag color="success">✓ Weights Complete</Tag>
                ) : (
                  <Tag color="warning">{totalKPIWeight < 100 ? `${(100 - totalKPIWeight).toFixed(1)}% remaining` : `${(totalKPIWeight - 100).toFixed(1)}% over weight`}</Tag>
                )}
              </div>
              <Progress percent={Math.min(totalKPIWeight, 100)} status={totalKPIWeight === 100 ? 'success' : totalKPIWeight > 100 ? 'exception' : 'active'} style={{ marginTop: 8 }} />
              {totalKPIWeight !== 100 && (
                <Text type="warning" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                  ⚠️ KPI weights must total exactly 100% to proceed
                </Text>
              )}
            </Card>
          )}

          {/* KPI Catalog */}
          {kpis.length === 0 && (
            <Card title="📊 KPI Catalog - Select from Standard KPIs" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[8, 8]}>
                {kpiCatalog.slice(0, 10).map(kpi => (
                  <Col span={12} key={kpi.code}>
                    <Card size="small" hoverable onClick={() => addKPIFromCatalog(kpi)} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>{kpi.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>{kpi.code}</Text>
                          <br />
                          <Tag color="blue" style={{ marginTop: 4 }}>{kpi.industry}</Tag>
                        </div>
                        <PlusOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
                Click any KPI to add it to your plan. You can customize targets and thresholds after adding.
              </Paragraph>
            </Card>
          )}

          {/* Selected KPIs Table */}
          {kpis.length > 0 && (
            <Table
              dataSource={kpis}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              columns={[
                { title: 'KPI Code', dataIndex: 'kpiCode', key: 'kpiCode', width: 120 },
                { title: 'KPI Name', dataIndex: 'kpiName', key: 'kpiName', width: 200 },
                { title: 'Target', dataIndex: 'targetValue', key: 'targetValue', width: 100 },
                { title: 'Green ≥', dataIndex: 'thresholdGreen', key: 'thresholdGreen', width: 80 },
                { title: 'Amber ≥', dataIndex: 'thresholdAmber', key: 'thresholdAmber', width: 80 },
                { title: 'Red <', dataIndex: 'thresholdRed', key: 'thresholdRed', width: 80 },
                { title: 'Weight %', dataIndex: 'weight', key: 'weight', width: 90, render: (v: number) => `${v}%` },
                { title: 'Actions', key: 'actions', width: 120, fixed: 'right' as const, render: (_: any, record: KPIItem) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openKPIModal(record)} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteKPI(record.id)} />
                  </Space>
                )},
              ]}
            />
          )}

          {kpis.length === 0 && (
            <Card size="small" style={{ textAlign: 'center', padding: '40px 0' }}>
              <Paragraph type="secondary">No KPIs added yet. Select from the catalog above or add a custom KPI.</Paragraph>
            </Card>
          )}
        </div>
      )}

      {stages[safeCurrent]?.key === 'milestones' && (
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






              <Modal
                open={milestoneModalVisible}
                title={
                  editingMilestone ? 
                    `Edit Milestone: ${editingMilestone.name}` : 
                    'Add Milestone'
                }
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
            {stages[safeCurrent]?.key === 'milestones' && totalBudget !== 100 ? (
              <Tooltip title={`Budget must total 100% (currently ${totalBudget.toFixed(1)}%). Add/edit milestones to reach 100%.`}>
                <Button type="primary" disabled>Next</Button>
              </Tooltip>
            ) : (
              <Button type="primary" onClick={next}>Next</Button>
            )}
          </>
        )}
        {totalBudget === 100 ? (
          <Button type="primary" onClick={handleSubmit} loading={submitting}>
            {submitting ? 'Saving...' : 'Submit Plan'}
          </Button>
        ) : (
          <Tooltip title={`Budget must total 100% (currently ${totalBudget.toFixed(1)}%). Add more milestones to reach 100%.`}>
            <Button type="primary" disabled>
              Submit Plan
            </Button>
          </Tooltip>
        )}
      </Space>
    </Card>
  );
};

export default PlanBuilder;


