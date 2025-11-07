'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { Card, Steps, Button, Form, Input, Select, DatePicker, Space, Typography, message, Table, InputNumber, Checkbox, Modal, Tag, Progress, Tooltip, App, Row, Col, Divider, Switch, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, DeleteFilled, ReloadOutlined } from '@ant-design/icons';

type CheckboxValueType = string | number | boolean;

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

type StageKey = 'basic' | 'erp' | 'kpis' | 'milestones' | 'governance' | 'pricing' | 'assignments' | 'review';

interface BasicInfoForm {
  planName: string;
  description?: string;
  clientId?: string; // Lookup to Customer
  branchQty: number;
  planPeriod: {
    durationType: 'FIXED' | 'QUARTER';
    startDate?: string;
    endDate?: string;
    quarter?: string;
  };
  session: {
    frequency: 'WEEKLY' | 'MONTHLY';
    meetingHoursPerMonth: number;
    presentMode: 'ONLINE' | 'VISIT';
  };
  planType: 'RIGHT_TRACK' | 'PERFORMANCE_MONITORING';
  objectives: string;
  users: Array<{
    id: string;
    name: string;
    phone: string;
  }>;
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
  lastSync?: Dayjs;
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
  // New fields from spec
  partnerAssigned?: string; // Partner type: ERP, Accounting, Stock count, etc.
  dateFrom?: string;
  dateTo?: string;
  dashboardTitle?: string;
  dueDate?: string;
  owner: 'HQ' | 'PARTNER' | 'CLIENT';
}

interface GovernanceForm {
  approvalMode: 'MODE_A' | 'MODE_B' | 'MODE_C';
  notificationChannels: string[];
  reportCadence: string;
  slaResponseHours: number;
  escalationEnabled: boolean;
  escalationContacts?: string;
  meetingCadence?: string;
  decisionLogRequired?: boolean;
  governanceNotes?: string;
}

interface PricingForm {
  package: string;
  addOns: string[];
  currency: string;
  billingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  basePrice: number;
  totalPrice: number;
  upfrontPaymentPct: number;
  platformCommissionPct: number;
  partnerCommissionPct: number;
  payoutDelayDays: number;
  refundPolicy: string;
  contractStartDate: Dayjs;
  contractEndDate: Dayjs;
  paymentTerms: string;
  notes?: string;
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

const DEFAULT_PACKAGE = 'STANDARD';

const approvalModes = [
  { value: 'MODE_A', label: 'HQ-led approvals' },
  { value: 'MODE_B', label: 'Joint steering committee' },
  { value: 'MODE_C', label: 'Client approvals with HQ oversight' },
];

const notificationChannelOptions = [
  { label: 'Email', value: 'EMAIL' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Slack', value: 'SLACK' },
  { label: 'MS Teams', value: 'TEAMS' },
];

const reportCadenceOptions = [
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Bi-weekly', value: 'BI_WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
];

const billingFrequencyOptions = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Annual', value: 'ANNUAL' },
];

const currencyOptions = [
  { label: 'AED', value: 'AED' },
  { label: 'SAR', value: 'SAR' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
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
  const [selectedPackage, setSelectedPackage] = useState<string>(DEFAULT_PACKAGE);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; phone: string }>>([]);
  const [partners, setPartners] = useState<Array<{ id: string; name: string; domain: string; role: string }>>([]);
  
  // Track completed steps for navigation
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Clients state
  const [clients, setClients] = useState<Array<{ id: string; name: string; company?: string | null; industry?: string | null }>>([]);
  const [clientsLoading, setClientsLoading] = useState<boolean>(false);

  const pricingCurrency = Form.useWatch('currency', pricingForm) || 'AED';
  const billingFrequency = Form.useWatch('billingFrequency', pricingForm) || 'MONTHLY';
  
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

  // Fetch clients for dropdown
  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        setClientsLoading(true);
        const response = await fetch('/api/customers');
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setClients(
            data.map((client: any) => ({
              id: client.id,
              name: client.name,
              company: client.company ?? null,
              industry: client.industry ?? null,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading customers:', error);
        message.error('Failed to load customers. Please refresh.');
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Fetch partners for assignment dropdown
  React.useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/partners');
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setPartners(
            data.map((partner: any) => ({
              id: partner.id,
              name: partner.name,
              domain: partner.domain || 'General',
              role: partner.role || 'CONSULTANT',
            }))
          );
        }
      } catch (error) {
        console.error('Error loading partners:', error);
        message.error('Failed to load partners. Please refresh.');
      }
    };

    fetchPartners();
  }, []);

  // Keep base/total price in sync with selections
  React.useEffect(() => {
    const basePackage = packageOptions.find((pkg) => pkg.value === selectedPackage);
    const basePrice = basePackage?.price ?? 0;
    const addOnsPrice = selectedAddOns.reduce((sum, addOnValue) => {
      const addOn = addOnOptions.find((option) => option.value === addOnValue);
      return sum + (addOn?.price ?? 0);
    }, 0);

    pricingForm.setFieldsValue({
      package: selectedPackage,
      addOns: selectedAddOns,
      basePrice,
      totalPrice: basePrice + addOnsPrice,
    });
  }, [selectedPackage, selectedAddOns, pricingForm]);

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
            clientId: draft.clientId || '',
            branchQty: draft.branchQty || 1,
            planType: draft.planType || 'RIGHT_TRACK',
            industry: draft.industry || '',
            companySize: draft.companySize || '',
            durationType: draft.durationType || 'FIXED',
            durationWeeks: draft.durationWeeks,
            startDate: draft.startDate ? dayjs(draft.startDate) : undefined as any,
            workingDays: Array.isArray(draft.workingDays) ? draft.workingDays : [],
            address: draft.address || '',
            siteType: draft.siteType || '',
            accessRequirements: Array.isArray(draft.accessRequirements) ? draft.accessRequirements : [],
            objectives: draft.objectives || '',
            users: Array.isArray(draft.users) ? draft.users : [],
          });
          
          // Set nested planPeriod fields separately
          if (draft.planPeriod) {
            basicForm.setFieldsValue({
              planPeriod: {
                durationType: draft.planPeriod.durationType || 'FIXED',
                quarter: draft.planPeriod.quarter || '',
                startDate: draft.planPeriod.startDate ? dayjs(draft.planPeriod.startDate) : undefined as any,
                endDate: draft.planPeriod.endDate ? dayjs(draft.planPeriod.endDate) : undefined as any,
              },
            });
          }
          
          // Set nested session fields separately
          if (draft.session) {
            basicForm.setFieldsValue({
              session: {
                frequency: draft.session.frequency || 'MONTHLY',
                meetingHoursPerMonth: draft.session.meetingHoursPerMonth || 8,
                presentMode: draft.session.presentMode || 'ONLINE',
              },
            });
          }
          
          // Load ERP form fields
          if (draft.erpType || draft.erpStatus || draft.dataDomains) {
            erpForm.setFieldsValue({
              erpType: draft.erpType || 'ODOO',
              erpStatus: draft.erpStatus || 'CONNECTED',
              mappingHealth: draft.mappingHealth || 0,
              dataDomains: Array.isArray(draft.dataDomains) ? draft.dataDomains : [],
              lastSync: (draft.lastSyncDate || draft.lastSync) ? dayjs(draft.lastSyncDate || draft.lastSync) : undefined,
            });
          }

          if (draft.governance) {
            governanceForm.setFieldsValue({
              approvalMode: draft.governance.approvalMode || 'MODE_A',
              notificationChannels: Array.isArray(draft.governance.notificationChannels) ? draft.governance.notificationChannels : ['EMAIL'],
              reportCadence: draft.governance.reportCadence || 'WEEKLY',
              slaResponseHours: draft.governance.slaResponseHours ?? 24,
              escalationEnabled: draft.governance.escalationEnabled ?? true,
              escalationContacts: draft.governance.escalationContacts || '',
              meetingCadence: draft.governance.meetingCadence || '',
              decisionLogRequired: draft.governance.decisionLogRequired ?? true,
              governanceNotes: draft.governance.governanceNotes || '',
            });
          }

          if (draft.pricing) {
            const draftPackage = draft.pricing.package || DEFAULT_PACKAGE;
            const draftAddOns = Array.isArray(draft.pricing.addOns) ? draft.pricing.addOns : [];
            setSelectedPackage(draftPackage);
            setSelectedAddOns(draftAddOns);
            pricingForm.setFieldsValue({
              package: draftPackage,
              addOns: draftAddOns,
              currency: draft.pricing.currency || 'AED',
              billingFrequency: draft.pricing.billingFrequency || 'MONTHLY',
              basePrice: draft.pricing.basePrice ?? 0,
              totalPrice: draft.pricing.totalPrice ?? 0,
              upfrontPaymentPct: draft.pricing.upfrontPaymentPct ?? 25,
              platformCommissionPct: draft.pricing.platformCommissionPct ?? 15,
              partnerCommissionPct: draft.pricing.partnerCommissionPct ?? 20,
              payoutDelayDays: draft.pricing.payoutDelayDays ?? 30,
              refundPolicy: draft.pricing.refundPolicy || '',
              contractStartDate: draft.pricing.contractStartDate ? dayjs(draft.pricing.contractStartDate) : dayjs(),
              contractEndDate: draft.pricing.contractEndDate ? dayjs(draft.pricing.contractEndDate) : dayjs().add(6, 'month'),
              paymentTerms: draft.pricing.paymentTerms || '',
              notes: draft.pricing.notes || '',
            });
          }
          
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
          
          // Load KPIs
          if (draft.kpis && Array.isArray(draft.kpis)) {
            console.log('Loading KPIs from draft:', draft.kpis);
            setKPIs(draft.kpis);
          }
          
          // Load Assignments
          if (draft.assignments && Array.isArray(draft.assignments)) {
            console.log('Loading assignments from draft:', draft.assignments);
            setAssignments(draft.assignments);
          }
          
          // Load Users
          if (draft.users && Array.isArray(draft.users)) {
            console.log('Loading users from draft:', draft.users);
            setUsers(draft.users);
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
      const governanceValues = governanceForm.getFieldsValue();
      const pricingRaw = pricingForm.getFieldsValue();
      const pricingValues = {
        ...pricingRaw,
        contractStartDate: pricingRaw.contractStartDate ? (pricingRaw.contractStartDate as Dayjs).format('YYYY-MM-DD') : undefined,
        contractEndDate: pricingRaw.contractEndDate ? (pricingRaw.contractEndDate as Dayjs).format('YYYY-MM-DD') : undefined,
      };
      
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
      
      // Preserve existing pricing data from draft to avoid losing fields
      let existingPricing = {};
      if (existingDraft) {
        try {
          const parsed = JSON.parse(existingDraft);
          existingPricing = parsed.pricing || {};
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
        governance: governanceValues,
        pricing: {
          ...existingPricing,  // Preserve all existing pricing data first
          ...pricingValues,    // Then apply current form values
          package: selectedPackage,
          addOns: selectedAddOns,
        },
        planId: isEditMode ? planId : null,
        customerId: isEditMode ? customerId : null,
        currentStage: current,
        lastSaved: timestamp,
        isEdit: isEditMode,
      };
      
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(timestamp);
    }
  }, [basicForm, governanceForm, pricingForm, milestones, current, draftLoaded, selectedPackage, selectedAddOns]);

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

  const basePackagePrice = useMemo(() => {
    const pkg = packageOptions.find((p) => p.value === selectedPackage);
    return pkg?.price || 0;
  }, [selectedPackage]);

  const addOnsTotal = useMemo(() => {
    return selectedAddOns.reduce((sum, addOnValue) => {
      const addOn = addOnOptions.find((a) => a.value === addOnValue);
      return sum + (addOn?.price || 0);
    }, 0);
  }, [selectedAddOns]);

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
    
    // Mark current step as completed
    setCompletedSteps(prev => new Set([...prev, current]));
    
    setCurrent((c) => Math.min(c + 1, stages.length - 1));
  };

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  // Handle step click for navigation
  const handleStepClick = (stepIndex: number) => {
    // Check if we're on the last step (Review & Approval) - if so, allow jumping to any step
    const isOnReviewStep = current === stages.length - 1;
    
    // Allow navigation if:
    // 1. On Review & Approval step (all steps completed) - can jump anywhere
    // 2. Clicking on current step or earlier steps
    // 3. Clicking on a completed step
    if (isOnReviewStep || stepIndex <= current || completedSteps.has(stepIndex)) {
      setCurrent(stepIndex);
    } else {
      message.warning('Please complete previous steps first');
    }
  };

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
      kpiForm.setFieldsValue({
        ...kpi,
        effectiveFrom: kpi.effectiveFrom ? dayjs(kpi.effectiveFrom) : undefined,
        effectiveTo: kpi.effectiveTo ? dayjs(kpi.effectiveTo) : undefined,
      });
    } else {
      setEditingKPI(null);
      kpiForm.resetFields();
      kpiForm.setFieldsValue({ 
        kpiCode: '',
        kpiName: '',
        targetValue: 0,
        thresholdGreen: 90, 
        thresholdAmber: 70, 
        thresholdRed: 50,
        weight: 0,
        effectiveFrom: dayjs(),
      });
    }
    setKPIModalVisible(true);
  };

  const saveKPI = async () => {
    try {
      const rawValues = await kpiForm.validateFields();
      const values = {
        ...rawValues,
        targetValue: Number(rawValues.targetValue ?? 0),
        thresholdGreen: Number(rawValues.thresholdGreen ?? 0),
        thresholdAmber: Number(rawValues.thresholdAmber ?? 0),
        thresholdRed: Number(rawValues.thresholdRed ?? 0),
        weight: Number(rawValues.weight ?? 0),
        effectiveFrom: rawValues.effectiveFrom ? (rawValues.effectiveFrom as Dayjs).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        effectiveTo: rawValues.effectiveTo ? (rawValues.effectiveTo as Dayjs).format('YYYY-MM-DD') : undefined,
      };
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
      assignmentForm.setFieldsValue({
        ...assignment,
        dueDate: assignment.dueDate ? dayjs(assignment.dueDate) : undefined,
      });
    } else {
      setEditingAssignment(null);
      assignmentForm.resetFields();
      assignmentForm.setFieldsValue({ 
        type: 'SETUP',
        assignmentOwner: 'HQ',
        slaHours: 48,
        priority: 'MEDIUM',
        dueDate: dayjs().add(7, 'day'),
      });
    }
    setAssignmentModalVisible(true);
  };

  const saveAssignment = async () => {
    try {
      const rawValues = await assignmentForm.validateFields();
      const values = {
        ...rawValues,
        dueDate: rawValues.dueDate ? (rawValues.dueDate as Dayjs).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      };

      // If a partner is selected, find and add the partner name
      if (values.partnerId) {
        const selectedPartner = partners.find(p => p.id === values.partnerId);
        if (selectedPartner) {
          values.partnerName = selectedPartner.name;
        }
      }

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

  const handleSelectPackage = (pkgValue: string) => {
    setSelectedPackage(pkgValue);
    message.success('Package selected');
  };

  const handleAddOnsChange = (values: CheckboxValueType[]) => {
    setSelectedAddOns(values as string[]);
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
      const governanceValues = governanceForm.getFieldsValue(true);
      const pricingRaw = pricingForm.getFieldsValue(true);
      const pricingValues = {
        ...pricingRaw,
        contractStartDate: pricingRaw.contractStartDate ? (pricingRaw.contractStartDate as Dayjs).format('YYYY-MM-DD') : undefined,
        contractEndDate: pricingRaw.contractEndDate ? (pricingRaw.contractEndDate as Dayjs).format('YYYY-MM-DD') : undefined,
      };
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
      const clientId = basicValues.clientId || basicForm.getFieldValue('clientId');
      
      // Validate required fields
      if (!clientId) {
        console.error('❌ CRITICAL: Client ID is missing!');
        message.error('Client selection is required. Please go back to Stage 1 and select a client.');
        setSubmitting(false);
        setCurrent(0); // Go back to stage 1
        return;
      }
      
      // Check if we're in edit mode
      const existingDraft = localStorage.getItem(DRAFT_KEY);
      let isEditMode = false;
      let existingPlanId = null;
      let customerId = null;
      
      if (existingDraft) {
        try {
          const parsed = JSON.parse(existingDraft);
          isEditMode = parsed.isEdit;
          existingPlanId = parsed.planId;
          customerId = parsed.customerId || clientId; // Use clientId from form if not in draft
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Prepare the plan data for API with proper type conversions
      // Map planType to ServiceType enum
      const serviceTypeMap: Record<string, string> = {
        'RIGHT_TRACK': 'CONSULTING',
        'PERFORMANCE_MONITORING': 'CONSULTING',
      };
      
      const planData = {
        customerId: clientId, // REQUIRED: Customer/Client ID
        name: planName,
        description: basicValues.description || basicForm.getFieldValue('description') || '',
        type: serviceTypeMap[basicValues.planType || basicForm.getFieldValue('planType') || 'RIGHT_TRACK'] || 'CONSULTING', // Map to ServiceType enum
        status: 'ACTIVE', // ServiceStatus enum: ACTIVE | INACTIVE | SUSPENDED | COMPLETED
        price: pricingValues.totalPrice ?? 0,
        currency: pricingValues.currency || 'AED',
        duration: parseInt(String(basicValues.durationWeeks || basicForm.getFieldValue('durationWeeks') || 0)) || null,
        features: JSON.stringify({ 
          planType: basicValues.planType || basicForm.getFieldValue('planType'),
          branchQty: parseInt(String(basicValues.branchQty || basicForm.getFieldValue('branchQty') || 1)),
          objectives: basicValues.objectives || basicForm.getFieldValue('objectives') || '',
          industry: basicValues.industry || basicForm.getFieldValue('industry') || '',
          companySize: basicValues.companySize || basicForm.getFieldValue('companySize') || '',
          package: selectedPackage, 
          addOns: selectedAddOns,
          planPeriod: basicValues.planPeriod,
          session: basicValues.session,
          durationType: basicValues.durationType || basicForm.getFieldValue('durationType') || 'FIXED',
          startDate: basicValues.startDate || basicForm.getFieldValue('startDate') || undefined,
          workingDays: parseInt(basicValues.workingDays || basicForm.getFieldValue('workingDays') || '5') || 5,
          address: basicValues.address || basicForm.getFieldValue('address') || '',
          siteType: basicValues.siteType || basicForm.getFieldValue('siteType') || '',
          accessRequirements: Array.isArray(basicValues.accessRequirements) 
            ? basicValues.accessRequirements.filter(Boolean).join(', ') 
            : (basicValues.accessRequirements || basicForm.getFieldValue('accessRequirements') || ''),
          totalBudget: milestones.reduce((sum, m) => sum + (parseFloat(String(m.budgetPercent)) || 0), 0),
          paymentTerms: pricingValues.paymentTerms,
          refundPolicy: pricingValues.refundPolicy,
          upfrontPaymentPct: pricingValues.upfrontPaymentPct,
          platformCommissionPct: pricingValues.platformCommissionPct,
          partnerCommissionPct: pricingValues.partnerCommissionPct,
          payoutDelayDays: pricingValues.payoutDelayDays,
          currentStage: current + 1,
          totalStages: stages.length,
          // Users with CFO App access
          users: users.map(u => ({
            id: u.id,
            name: u.name,
            phone: u.phone,
          })),
          // Milestones data
          milestones: milestones.map(m => ({
            sequence: m.sequence,
            name: m.name,
            description: m.deliverables,
            durationWeeks: m.durationWeeks,
            budgetPercent: m.budgetPercent,
            deliverables: m.deliverables,
            dependencies: m.dependencies,
            criticalPath: m.criticalPath,
          })),
          // KPIs data
          kpis: kpis.map(k => ({
            kpiCode: k.kpiCode,
            kpiName: k.kpiName,
            targetValue: k.targetValue,
            weight: k.weight,
            thresholdGreen: k.thresholdGreen,
            thresholdAmber: k.thresholdAmber,
            thresholdRed: k.thresholdRed,
            calculationSource: k.calculationSource,
            effectiveFrom: k.effectiveFrom,
            effectiveTo: k.effectiveTo,
          })),
          // Assignments
          assignments: assignments.map(a => ({
            type: a.type,
            partnerId: a.partnerId,
            assignmentOwner: a.assignmentOwner,
            slaHours: a.slaHours,
            dueDate: a.dueDate,
            priority: a.priority,
            notes: a.notes,
          })),
        }),
        erpConnection: JSON.stringify({
          type: erpForm.getFieldValue('erpType') || 'NONE',
          status: erpForm.getFieldValue('erpStatus') || 'NOT_CONNECTED',
          mappingHealth: erpForm.getFieldValue('mappingHealth') || 0,
          lastSync: erpForm.getFieldValue('lastSync') ? erpForm.getFieldValue('lastSync').toISOString() : null,
        }),
        dataDomains: erpForm.getFieldValue('dataDomains') || [],
        governancePolicy: JSON.stringify(governanceValues),
      };

      console.log('📤 Sending plan data:', planData);

      let response;
      if (isEditMode && existingPlanId) {
        console.log('🔄 Updating existing plan:', existingPlanId);
        // Update existing plan
        response = await fetch(`/api/plans/${existingPlanId}`, {
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
      
      // Check if we have a successful response with plan ID
      if (response.ok || response.status === 201) {
        console.log('✅ Plan saved successfully!');
        message.success(isEditMode ? 'Plan updated successfully!' : 'Plan created successfully!');
        
        // Clear draft after successful submission
        console.log('🗑️ Clearing draft...');
        localStorage.removeItem(DRAFT_KEY);
        
        // Get the plan ID from response
        const savedPlanId = result?.id || existingPlanId;
        
        if (savedPlanId) {
          // Redirect to the plan view page
          console.log('🚀 Redirecting to plan view:', savedPlanId);
          window.location.href = `/plans/${savedPlanId}`;
        } else {
          // Fallback to plans list
          console.log('🚀 Redirecting to plans list...');
          window.location.href = '/plans';
        }
        return;
      }
      
      if (result && result.success) {
        console.log('✅ Plan saved successfully!', result.data);
        message.success(isEditMode ? 'Plan updated successfully!' : 'Plan created successfully!');
        
        // Clear draft after successful submission
        console.log('🗑️ Clearing draft...');
        localStorage.removeItem(DRAFT_KEY);
        
        // Get the plan ID
        const savedPlanId = result.data?.id || result.id || existingPlanId;
        
        // Redirect to the plan view page
        if (savedPlanId) {
          console.log('🚀 Redirecting to plan view:', savedPlanId);
          window.location.href = `/plans/${savedPlanId}`;
        } else {
          console.log('🚀 Redirecting to plans list...');
          window.location.href = '/plans';
        }
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
        {stages.map((s, index) => {
          // Check if we're on the last step (Review & Approval)
          const isOnReviewStep = current === stages.length - 1;
          const isClickable = isOnReviewStep || index <= current || completedSteps.has(index);
          
          return (
            <Step 
              key={s.key} 
              title={s.title} 
              status={
                index < current ? 'finish' : 
                index === current ? 'process' : 
                completedSteps.has(index) ? 'finish' : 
                'wait'
              }
              style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
              onClick={() => handleStepClick(index)}
            />
          );
        })}
      </Steps>

      {stages[safeCurrent]?.key === 'basic' && (
        <Form form={basicForm} layout="vertical" initialValues={{ 
          planType: 'RIGHT_TRACK',
          'planPeriod.durationType': 'FIXED',
          'session.frequency': 'MONTHLY',
          'session.presentMode': 'ONLINE',
          branchQty: 1,
          users: []
        }}>
          <Title level={4}>Client & Scope</Title>
          
          {/* Plan Name - CRITICAL FIELD */}
          <Form.Item 
            name="planName" 
            label="Plan Name" 
            rules={[
              { required: true, message: 'Plan name is required' },
              { min: 3, message: 'Plan name must be at least 3 characters' }
            ]}
          >
            <Input 
              placeholder="e.g., Q1 2025 Performance Plan - ABC Company" 
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea 
              rows={3} 
              placeholder="Optional description of this plan..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Divider />

          {/* Client Selection */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="clientId" label="Client" rules={[{ required: true, message: 'Please select a client' }]}>
                <Select 
                  showSearch
                  placeholder="Select a client"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={clients.map(client => ({
                    value: client.id,
                    label: `${client.name}${client.industry ? ` (${client.industry})` : ''}`,
                  }))}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item name="branchQty" label="Branch Quantity" rules={[{ required: true }]}>
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Plan Type */}
          <Form.Item name="planType" label="Plan Type" rules={[{ required: true }]}>
            <Select style={{ width: '100%' }}>
              <Option value="RIGHT_TRACK">Right Track</Option>
              <Option value="PERFORMANCE_MONITORING">Performance Monitoring</Option>
            </Select>
          </Form.Item>

          {/* Plan Period */}
          <Card size="small" title="Plan Period" style={{ marginBottom: 16 }}>
            <Form.Item name={['planPeriod', 'durationType']} label="Duration Type" rules={[{ required: true }]}>
              <Select style={{ width: '100%' }}>
                <Option value="FIXED">Fixed (Start & End Date)</Option>
                <Option value="QUARTER">By Quarter</Option>
              </Select>
            </Form.Item>

            <Form.Item shouldUpdate={(prevValues, currentValues) => 
              prevValues.planPeriod?.durationType !== currentValues.planPeriod?.durationType
            } noStyle>
              {() => {
                const durationType = basicForm.getFieldValue(['planPeriod', 'durationType']);
                return durationType === 'FIXED' ? (
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item name={['planPeriod', 'startDate']} label="Start Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name={['planPeriod', 'endDate']} label="End Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : (
                  <Form.Item name={['planPeriod', 'quarter']} label="Quarter" rules={[{ required: true }]}>
                    <Select style={{ width: '100%' }}>
                      <Option value="Q1_2025">Q1 2025</Option>
                      <Option value="Q2_2025">Q2 2025</Option>
                      <Option value="Q3_2025">Q3 2025</Option>
                      <Option value="Q4_2025">Q4 2025</Option>
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Card>

          {/* Session Details */}
          <Card size="small" title="Session Configuration" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item name={['session', 'frequency']} label="Frequency" rules={[{ required: true }]}>
                  <Select style={{ width: '100%' }}>
                    <Option value="WEEKLY">Weekly</Option>
                    <Option value="MONTHLY">Monthly</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name={['session', 'meetingHoursPerMonth']} label="Meeting Hours/Month" rules={[{ required: true }]}>
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name={['session', 'presentMode']} label="Presentation Mode" rules={[{ required: true }]}>
                  <Select style={{ width: '100%' }}>
                    <Option value="ONLINE">Online</Option>
                    <Option value="VISIT">On-Site Visit</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Objectives */}
          <Form.Item name="objectives" label="Objectives" rules={[{ required: true, message: 'Please provide plan objectives' }]}>
            <Input.TextArea 
              rows={4} 
              maxLength={1000} 
              showCount 
              placeholder="Describe the main objectives of this plan..."
            />
          </Form.Item>

          {/* User Details */}
          <Card size="small" title="App Users" style={{ marginBottom: 16 }}>
            <Paragraph type="secondary">Add users who will have access to the CFO App for this plan</Paragraph>
            
            {users.map((user, index) => (
              <Card key={user.id} size="small" style={{ marginBottom: 8 }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col span={10}>
                    <Input
                      placeholder="User Name"
                      value={user.name}
                      onChange={(e) => {
                        const newUsers = [...users];
                        newUsers[index].name = e.target.value;
                        setUsers(newUsers);
                      }}
                    />
                  </Col>
                  <Col span={10}>
                    <Input
                      placeholder="Phone Number"
                      value={user.phone}
                      onChange={(e) => {
                        const newUsers = [...users];
                        newUsers[index].phone = e.target.value;
                        setUsers(newUsers);
                      }}
                    />
                  </Col>
                  <Col span={4}>
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => setUsers(users.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}

            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              onClick={() => setUsers([...users, { id: Date.now().toString(), name: '', phone: '' }])}
              block
            >
              Add User
            </Button>
          </Card>
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

      {stages[safeCurrent]?.key === 'governance' && (
        <Form
          form={governanceForm}
          layout="vertical"
          initialValues={{
            approvalMode: 'MODE_A',
            notificationChannels: ['EMAIL'],
            reportCadence: 'WEEKLY',
            slaResponseHours: 24,
            escalationEnabled: true,
            decisionLogRequired: true,
          }}
          style={{ marginTop: 16 }}
        >
          <Title level={4}>Workflow & Governance</Title>
          <Paragraph type="secondary">
            Configure approvals, notifications, and escalation paths for this plan.
          </Paragraph>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="approvalMode" label="Approval Mode" rules={[{ required: true }]}>
                <Select options={approvalModes} placeholder="Select approval mode" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="notificationChannels"
                label="Notification Channels"
                rules={[{ required: true, message: 'Select at least one channel' }]}
              >
                <Checkbox.Group options={notificationChannelOptions} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="reportCadence" label="Reporting Cadence" rules={[{ required: true }]}>
                <Select options={reportCadenceOptions} placeholder="Select cadence" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="meetingCadence" label="Steering Meeting Cadence">
                <Input placeholder="e.g., Weekly steering call every Monday" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="slaResponseHours"
                label="Issue Response SLA (hours)"
                rules={[{ required: true, message: 'Provide SLA response time' }]}
              >
                <InputNumber min={1} max={240} style={{ width: '100%' }} addonAfter="hrs" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="decisionLogRequired" label="Decision Log Required" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="escalationEnabled" label="Escalation Workflow Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {() =>
              governanceForm.getFieldValue('escalationEnabled') ? (
                <Form.Item
                  name="escalationContacts"
                  label="Escalation Contacts"
                  rules={[{ required: true, message: 'Provide escalation contacts' }]}
                >
                  <Input.TextArea rows={3} placeholder="List escalation owners and contact details" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item name="governanceNotes" label="Additional Governance Notes">
            <Input.TextArea rows={3} placeholder="Any additional workflow notes" />
          </Form.Item>
        </Form>
      )}

      {stages[safeCurrent]?.key === 'pricing' && (
        <div style={{ marginTop: 16 }}>
          <Title level={4}>Pricing & Commercials</Title>
          <Paragraph type="secondary">
            Select the package, optional add-ons, and capture commercial terms for this engagement.
          </Paragraph>

          <Row gutter={[16, 16]}>
            {packageOptions.map((pkg) => {
              const isSelected = pkg.value === selectedPackage;
              return (
                <Col xs={24} sm={12} md={6} key={pkg.value}>
                  <Card
                    hoverable
                    onClick={() => handleSelectPackage(pkg.value)}
                    style={{
                      borderColor: isSelected ? '#1890ff' : '#f0f0f0',
                      background: isSelected ? '#f0f7ff' : '#fff',
                    }}
                  >
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text strong>{pkg.label}</Text>
                      <Text type="secondary">AED {pkg.price.toLocaleString()} per cycle</Text>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Card size="small" title="Optional Add-ons" style={{ marginTop: 24 }}>
            <Checkbox.Group value={selectedAddOns} onChange={handleAddOnsChange} style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                {addOnOptions.map((addOn) => (
                  <Col xs={24} sm={12} key={addOn.value}>
                    <Checkbox value={addOn.value} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>{addOn.label}</Text>
                        <Text type="secondary">+ AED {addOn.price.toLocaleString()}</Text>
                      </div>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Card>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={16}>
              <Form
                form={pricingForm}
                layout="vertical"
                initialValues={{
                  currency: 'AED',
                  billingFrequency: 'MONTHLY',
                  basePrice: basePackagePrice,
                  totalPrice,
                  upfrontPaymentPct: 25,
                  platformCommissionPct: 15,
                  partnerCommissionPct: 20,
                  payoutDelayDays: 30,
                  refundPolicy: '30 days written notice required for unused services.',
                  contractStartDate: dayjs(),
                  contractEndDate: dayjs().add(6, 'month'),
                  paymentTerms: 'Net 30 days. 50% upfront, remainder on completion.',
                  notes: '',
                }}
              >
                <Form.Item name="package" hidden rules={[{ required: true }]}> 
                  <Input readOnly />
                </Form.Item>
                <Form.Item name="addOns" hidden>
                  <Input readOnly />
                </Form.Item>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
                      <Select options={currencyOptions} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="billingFrequency" label="Billing Frequency" rules={[{ required: true }]}>
                      <Select options={billingFrequencyOptions} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="upfrontPaymentPct" label="Upfront Payment %" rules={[{ required: true }]}>
                      <InputNumber style={{ width: '100%' }} min={0} max={100} addonAfter="%" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="payoutDelayDays" label="Payout Delay" rules={[{ required: true }]}>
                      <InputNumber style={{ width: '100%' }} min={0} addonAfter="days" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="platformCommissionPct" label="Platform Commission %" rules={[{ required: true }]}>
                      <InputNumber style={{ width: '100%' }} min={0} max={100} addonAfter="%" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="partnerCommissionPct" label="Partner Commission %" rules={[{ required: true }]}>
                      <InputNumber style={{ width: '100%' }} min={0} max={100} addonAfter="%" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="basePrice" label="Base Package Price" rules={[{ required: true }]}>
                      <InputNumber style={{ width: '100%' }} min={0} disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="totalPrice" label="Total Price per Cycle" rules={[{ required: true }]}>
                      <InputNumber style={{ width: '100%' }} min={0} disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="contractStartDate" label="Contract Start" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="contractEndDate" label="Contract End" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="refundPolicy" label="Refund & Cancellation Policy" rules={[{ required: true }]}>
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="paymentTerms" label="Payment Terms" rules={[{ required: true }]}>
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="notes" label="Commercial Notes">
                  <Input.TextArea rows={3} placeholder="Any additional commercial considerations" />
                </Form.Item>
              </Form>
            </Col>
            <Col xs={24} lg={8}>
              <Card size="small" title="Pricing Summary" style={{ height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Base package</Text>
                    <Text strong>{pricingCurrency} {basePackagePrice.toLocaleString()}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Add-ons</Text>
                    <Text strong>{pricingCurrency} {addOnsTotal.toLocaleString()}</Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <Statistic title="Total per billing cycle" value={totalPrice} prefix={`${pricingCurrency} `} precision={0} />
                  <Text type="secondary">Billed {billingFrequency.toLowerCase()}.</Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {stages[safeCurrent]?.key === 'assignments' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>Assignments & Partners</Title>
              <Text type="secondary">Assign partners and define responsibilities for plan execution</Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openAssignmentModal()}>Add Assignment</Button>
          </div>

          {assignments.length > 0 && (
            <Table
              dataSource={assignments}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              columns={[
                { title: 'Type', dataIndex: 'type', key: 'type', width: 150 },
                { title: 'Partner', dataIndex: 'partnerName', key: 'partnerName', width: 200, render: (name: string) => name || <Text type="secondary">Unassigned</Text> },
                { title: 'Owner', dataIndex: 'assignmentOwner', key: 'assignmentOwner', width: 150 },
                { title: 'SLA (hours)', dataIndex: 'slaHours', key: 'slaHours', width: 120 },
                { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', width: 120, render: (date: string) => dayjs(date).format('MMM DD, YYYY') },
                { title: 'Priority', dataIndex: 'priority', key: 'priority', width: 100, render: (priority: string) => {
                  const colors: Record<string, string> = { LOW: 'blue', MEDIUM: 'orange', HIGH: 'red', URGENT: 'red' };
                  return <Tag color={colors[priority] || 'default'}>{priority}</Tag>;
                }},
                { title: 'Actions', key: 'actions', width: 120, fixed: 'right' as const, render: (_: any, record: AssignmentItem) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openAssignmentModal(record)} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteAssignment(record.id)} />
                  </Space>
                )},
              ]}
            />
          )}

          {assignments.length === 0 && (
            <Card size="small" style={{ textAlign: 'center', padding: '40px 0' }}>
              <Paragraph type="secondary">
                No assignments created yet. Add assignments to specify partner responsibilities and SLA commitments.
              </Paragraph>
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                💡 Assignments help track partner deliverables, manage SLAs, and ensure clear accountability.
              </Paragraph>
            </Card>
          )}

          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f0f5ff' }}>
            <Paragraph>
              <strong>📋 Assignment Guidelines:</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li><strong>Setup:</strong> Initial configuration and onboarding tasks</li>
                <li><strong>Training:</strong> User training and knowledge transfer</li>
                <li><strong>Implementation:</strong> System deployment and integration</li>
                <li><strong>Support:</strong> Ongoing maintenance and troubleshooting</li>
              </ul>
            </Paragraph>
          </Card>
        </div>
      )}

      <Modal
        open={kpiModalVisible}
        title={editingKPI ? `Edit KPI: ${editingKPI.kpiName}` : 'Add Custom KPI'}
        onCancel={() => setKPIModalVisible(false)}
        onOk={saveKPI}
        okText="Save"
        width={700}
      >
        <Form form={kpiForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="kpiCode" label="KPI Code" rules={[{ required: true, message: 'KPI Code is required' }]}>
                <Input placeholder="e.g., FIN.REV_GROWTH" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="kpiName" label="KPI Name" rules={[{ required: true, message: 'KPI Name is required' }]}>
                <Input placeholder="e.g., Revenue Growth %" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="targetValue" label="Target Value" rules={[{ required: true, message: 'Target is required' }]}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g., 15" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="weight" label="Weight %" rules={[{ required: true, message: 'Weight is required' }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.1} placeholder="e.g., 20" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Threshold Settings</Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item name="thresholdGreen" label="Green ≥" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="90" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="thresholdAmber" label="Amber ≥" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="70" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="thresholdRed" label="Red <" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="50" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="calculationSource" label="Calculation Source / Data Source" rules={[{ required: true, message: 'Calculation source is required' }]}>
            <Input.TextArea rows={2} placeholder="e.g., GL, Sales Ledger, or custom formula" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="effectiveFrom" label="Effective From" rules={[{ required: true, message: 'Start date is required' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="effectiveTo" label="Effective To">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

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
          <Form.Item name="name" label="Milestone Title" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g., Planning & Assessment" />
          </Form.Item>
          
          <Form.Item name="partnerAssigned" label="Partner Assigned">
            <Select placeholder="Select partner type" allowClear>
              <Option value="ERP">ERP Consultant</Option>
              <Option value="ACCOUNTING">Accounting Firm</Option>
              <Option value="STOCK_COUNT">Stock Count</Option>
              <Option value="IMPLEMENTATION">Implementation</Option>
              <Option value="TRAINING">Training</Option>
              <Option value="OTHER">Other</Option>
            </Select>
          </Form.Item>
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="dateFrom" label="Start Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateTo" label="End Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
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
          
          <Divider>Milestone Dashboard Settings</Divider>
          
          <Form.Item name="dashboardTitle" label="Dashboard Title" rules={[{ required: true }]}>
            <Input placeholder="Title to show on dashboard" />
          </Form.Item>
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="owner" label="Owner" rules={[{ required: true }]}>
                <Select style={{ width: '100%' }}>
                  <Option value="HQ">HQ</Option>
                  <Option value="PARTNER">Partner</Option>
                  <Option value="CLIENT">Client</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="durationWeeks" label="Duration (weeks)" rules={[{ required: true }, { type: 'number', min: 1, max: 52 }]}>
              <InputNumber min={1} max={52} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="budgetPercent" label="Budget Allocation %" rules={[{ required: true }, { type: 'number', min: 0, max: 100 }]}>
              <InputNumber min={0} max={100} step={0.1} style={{ width: 150 }} />
            </Form.Item>
          </Space>
          
          <Form.Item name="criticalPath" valuePropName="checked">
            <Checkbox>Mark as Critical Path</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={assignmentModalVisible}
        title={editingAssignment ? 'Edit Assignment' : 'Add Assignment'}
        onCancel={() => setAssignmentModalVisible(false)}
        onOk={saveAssignment}
        okText="Save"
        width={700}
      >
        <Form form={assignmentForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="type" label="Assignment Type" rules={[{ required: true, message: 'Select assignment type' }]}>
                <Select placeholder="Select type">
                  <Option value="SETUP">Setup & Configuration</Option>
                  <Option value="TRAINING">Training & Knowledge Transfer</Option>
                  <Option value="IMPLEMENTATION">Implementation & Integration</Option>
                  <Option value="SUPPORT">Ongoing Support & Maintenance</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="assignmentOwner" label="Assignment Owner" rules={[{ required: true, message: 'Select owner' }]}>
                <Select placeholder="Select owner">
                  <Option value="HQ">HQ Team</Option>
                  <Option value="PARTNER">Partner</Option>
                  <Option value="CLIENT">Client</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="partnerId" label="Assign to Partner (Optional)">
                <Select 
                  placeholder="Select partner" 
                  allowClear 
                  showSearch 
                  filterOption={(input: string, option: any) => {
                    const children = option?.children;
                    if (typeof children === 'string') {
                      return children.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  {partners.map((partner) => (
                    <Option key={partner.id} value={partner.id}>
                      {partner.name} ({partner.domain})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                <Select placeholder="Select priority">
                  <Option value="LOW">Low</Option>
                  <Option value="MEDIUM">Medium</Option>
                  <Option value="HIGH">High</Option>
                  <Option value="URGENT">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="slaHours" label="SLA Response Time (hours)" rules={[{ required: true, message: 'Enter SLA hours' }]}>
                <InputNumber min={1} max={720} style={{ width: '100%' }} placeholder="e.g., 48" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="dueDate" label="Due Date" rules={[{ required: true, message: 'Select due date' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Assignment Notes">
            <Input.TextArea rows={3} placeholder="Any special instructions, requirements, or notes for this assignment" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Review & Approval Step */}
      {stages[safeCurrent]?.key === 'review' && (
        <div style={{ marginTop: 16 }}>
          <Title level={4}>📋 Review & Approval</Title>
          <Paragraph type="secondary">
            Review all plan details before final submission. Ensure all information is accurate and complete.
          </Paragraph>

          {/* Step 1: Client & Scope Summary */}
          <Card size="small" style={{ marginBottom: 16 }} title="✅ Step 1: Client & Scope">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Statistic title="Plan Name" value={basicForm.getFieldValue('planName') || 'Not set'} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col xs={24} md={12}>
                <Statistic title="Plan Type" value={basicForm.getFieldValue('planType')?.replace('_', ' ') || 'Not set'} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col xs={24} md={12}>
                <Statistic title="Industry" value={basicForm.getFieldValue('industry') || 'Not set'} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col xs={24} md={12}>
                <Statistic title="Company Size" value={basicForm.getFieldValue('companySize') || 'Not set'} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col xs={24} md={12}>
                <Statistic title="Branch Quantity" value={basicForm.getFieldValue('branchQty') || 0} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col xs={24} md={12}>
                <Statistic 
                  title="Duration Type" 
                  value={basicForm.getFieldValue('durationType') || 'Not set'} 
                  valueStyle={{ fontSize: 16 }} 
                />
              </Col>
              {basicForm.getFieldValue('durationType') === 'FIXED' && basicForm.getFieldValue('durationWeeks') && (
                <Col xs={24} md={12}>
                  <Statistic title="Duration (Weeks)" value={basicForm.getFieldValue('durationWeeks')} valueStyle={{ fontSize: 16 }} />
                </Col>
              )}
              {basicForm.getFieldValue('startDate') && (
                <Col xs={24} md={12}>
                  <Statistic 
                    title="Start Date" 
                    value={dayjs(basicForm.getFieldValue('startDate')).format('MMM DD, YYYY')} 
                    valueStyle={{ fontSize: 16 }} 
                  />
                </Col>
              )}
            </Row>
            {basicForm.getFieldValue('objectives') && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Objectives:</Text>
                <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{basicForm.getFieldValue('objectives')}</Paragraph>
              </div>
            )}
            {basicForm.getFieldValue('description') && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Description:</Text>
                <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{basicForm.getFieldValue('description')}</Paragraph>
              </div>
            )}
          </Card>

          {/* Step 2: ERP & Data Sources Summary */}
          <Card size="small" style={{ marginBottom: 16 }} title="✅ Step 2: Baseline & Data Sources">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Statistic title="ERP Type" value={erpForm.getFieldValue('erpType') || 'Not set'} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col xs={24} md={12}>
                <Statistic title="ERP Status" value={erpForm.getFieldValue('erpStatus') || 'Not set'} valueStyle={{ fontSize: 16 }} />
              </Col>
              {erpForm.getFieldValue('mappingHealth') && (
                <Col xs={24} md={12}>
                  <div>
                    <Text>Mapping Health:</Text>
                    <Progress 
                      percent={erpForm.getFieldValue('mappingHealth')} 
                      status={erpForm.getFieldValue('mappingHealth') >= 80 ? 'success' : erpForm.getFieldValue('mappingHealth') >= 50 ? 'normal' : 'exception'}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                </Col>
              )}
            </Row>
            {erpForm.getFieldValue('dataDomains') && erpForm.getFieldValue('dataDomains').length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Data Domains:</Text>
                <div style={{ marginTop: 8 }}>
                  {erpForm.getFieldValue('dataDomains').map((domain: string) => (
                    <Tag key={domain} color="blue" style={{ marginBottom: 8 }}>{domain}</Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Step 3: KPIs Summary */}
          <Card size="small" style={{ marginBottom: 16 }} title={`✅ Step 3: KPIs & Targets (${kpis.length} KPIs)`}>
            {kpis.length > 0 ? (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} md={12}>
                    <Statistic 
                      title="Total KPIs" 
                      value={kpis.length} 
                      valueStyle={{ fontSize: 16, color: '#1890ff' }} 
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <div>
                      <Text>Total Weight:</Text>
                      <Progress 
                        percent={totalKPIWeight} 
                        status={totalKPIWeight === 100 ? 'success' : totalKPIWeight > 100 ? 'exception' : 'normal'}
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  </Col>
                </Row>
                <Table
                  dataSource={kpis}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: 'KPI Code', dataIndex: 'kpiCode', key: 'kpiCode', width: 150 },
                    { title: 'KPI Name', dataIndex: 'kpiName', key: 'kpiName' },
                    { title: 'Target', dataIndex: 'targetValue', key: 'targetValue', width: 100 },
                    { title: 'Weight %', dataIndex: 'weight', key: 'weight', width: 100, render: (w: number) => `${w}%` },
                    { 
                      title: 'Thresholds', 
                      key: 'thresholds', 
                      width: 200,
                      render: (_: any, record: KPIItem) => (
                        <Space size={4}>
                          <Tag color="green">≥{record.thresholdGreen}</Tag>
                          <Tag color="orange">≥{record.thresholdAmber}</Tag>
                          <Tag color="red">&lt;{record.thresholdRed}</Tag>
                        </Space>
                      )
                    },
                  ]}
                />
              </>
            ) : (
              <Paragraph type="secondary" style={{ textAlign: 'center', margin: '20px 0' }}>
                No KPIs added yet
              </Paragraph>
            )}
          </Card>

          {/* Step 4: Milestones Summary */}
          <Card size="small" style={{ marginBottom: 16 }} title={`✅ Step 4: Milestones & Timeline (${milestones.length} Milestones)`}>
            {milestones.length > 0 ? (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} md={12}>
                    <Statistic 
                      title="Total Milestones" 
                      value={milestones.length} 
                      valueStyle={{ fontSize: 16, color: '#1890ff' }} 
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <div>
                      <Text>Budget Allocation:</Text>
                      <Progress 
                        percent={totalBudget} 
                        status={totalBudget === 100 ? 'success' : totalBudget > 100 ? 'exception' : 'normal'}
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  </Col>
                </Row>
                <Table
                  dataSource={milestones.sort((a, b) => a.sequence - b.sequence)}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '#', dataIndex: 'sequence', key: 'sequence', width: 60 },
                    { title: 'Milestone Name', dataIndex: 'name', key: 'name' },
                    { title: 'Duration (weeks)', dataIndex: 'durationWeeks', key: 'durationWeeks', width: 130 },
                    { title: 'Budget %', dataIndex: 'budgetPercent', key: 'budgetPercent', width: 100, render: (b: number) => `${b}%` },
                    { 
                      title: 'Owner', 
                      dataIndex: 'owner', 
                      key: 'owner', 
                      width: 100,
                      render: (owner: string) => {
                        const colors: Record<string, string> = { HQ: 'blue', PARTNER: 'green', CLIENT: 'orange' };
                        return <Tag color={colors[owner] || 'default'}>{owner}</Tag>;
                      }
                    },
                    {
                      title: 'Critical Path',
                      dataIndex: 'criticalPath',
                      key: 'criticalPath',
                      width: 100,
                      render: (critical: boolean) => critical ? <Tag color="red">Critical</Tag> : <Tag>Normal</Tag>
                    },
                  ]}
                />
              </>
            ) : (
              <Paragraph type="secondary" style={{ textAlign: 'center', margin: '20px 0' }}>
                No milestones added yet
              </Paragraph>
            )}
          </Card>

          {/* Step 5: Governance Summary */}
          <Card size="small" style={{ marginBottom: 16 }} title="✅ Step 5: Workflow & Governance">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Statistic 
                  title="Approval Mode" 
                  value={governanceForm.getFieldValue('approvalMode') || 'Not set'} 
                  valueStyle={{ fontSize: 16 }} 
                />
              </Col>
              <Col xs={24} md={12}>
                <Statistic 
                  title="Report Cadence" 
                  value={governanceForm.getFieldValue('reportCadence') || 'Not set'} 
                  valueStyle={{ fontSize: 16 }} 
                />
              </Col>
              <Col xs={24} md={12}>
                <Statistic 
                  title="SLA Response Time" 
                  value={`${governanceForm.getFieldValue('slaResponseHours') || 0} hours`} 
                  valueStyle={{ fontSize: 16 }} 
                />
              </Col>
              <Col xs={24} md={12}>
                <div>
                  <Text>Escalation Workflow:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color={governanceForm.getFieldValue('escalationEnabled') ? 'green' : 'default'}>
                      {governanceForm.getFieldValue('escalationEnabled') ? 'Enabled' : 'Disabled'}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
            {governanceForm.getFieldValue('notificationChannels') && governanceForm.getFieldValue('notificationChannels').length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Notification Channels:</Text>
                <div style={{ marginTop: 8 }}>
                  {governanceForm.getFieldValue('notificationChannels').map((channel: string) => (
                    <Tag key={channel} color="blue" style={{ marginBottom: 8 }}>{channel}</Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Step 6: Pricing Summary */}
          <Card size="small" style={{ marginBottom: 16 }} title="✅ Step 6: Pricing & Commercials">
            <Row gutter={[16, 24]}>
              <Col xs={24} md={8}>
                <Statistic 
                  title="Base Package" 
                  value={basePackagePrice} 
                  prefix="AED" 
                  valueStyle={{ fontSize: 20, color: '#1890ff' }} 
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {packageOptions.find(p => p.value === selectedPackage)?.label || 'No package selected'}
                </Text>
              </Col>
              <Col xs={24} md={8}>
                <Statistic 
                  title="Add-ons Total" 
                  value={addOnsTotal} 
                  prefix="AED" 
                  valueStyle={{ fontSize: 20, color: '#52c41a' }} 
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {selectedAddOns.length} add-on(s) selected
                </Text>
              </Col>
              <Col xs={24} md={8}>
                <Statistic 
                  title="Total Price" 
                  value={totalPrice} 
                  prefix="AED" 
                  valueStyle={{ fontSize: 20, color: '#ff4d4f', fontWeight: 'bold' }} 
                />
              </Col>
            </Row>
            {selectedAddOns.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Selected Add-ons:</Text>
                <div style={{ marginTop: 8 }}>
                  {selectedAddOns.map((addOnValue) => {
                    const addOn = addOnOptions.find(a => a.value === addOnValue);
                    return addOn ? (
                      <Tag key={addOnValue} color="green" style={{ marginBottom: 8 }}>
                        {addOn.label} - AED {addOn.price.toLocaleString()}
                      </Tag>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text strong>Currency:</Text> <Text>{pricingForm.getFieldValue('currency') || 'AED'}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Billing Frequency:</Text> <Text>{pricingForm.getFieldValue('billingFrequency') || 'Not set'}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Upfront Payment:</Text> <Text>{pricingForm.getFieldValue('upfrontPaymentPct') || 0}%</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Platform Commission:</Text> <Text>{pricingForm.getFieldValue('platformCommissionPct') || 0}%</Text>
              </Col>
            </Row>
            {pricingForm.getFieldValue('paymentTerms') && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Payment Terms:</Text>
                <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{pricingForm.getFieldValue('paymentTerms')}</Paragraph>
              </div>
            )}
          </Card>

          {/* Step 7: Assignments Summary */}
          <Card size="small" style={{ marginBottom: 16 }} title={`✅ Step 7: Assignments & Partners (${assignments.length} Assignments)`}>
            {assignments.length > 0 ? (
              <Table
                dataSource={assignments}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  { title: 'Type', dataIndex: 'type', key: 'type', width: 150 },
                  { title: 'Owner', dataIndex: 'assignmentOwner', key: 'assignmentOwner', width: 100 },
                  { title: 'SLA (hours)', dataIndex: 'slaHours', key: 'slaHours', width: 100 },
                  { 
                    title: 'Due Date', 
                    dataIndex: 'dueDate', 
                    key: 'dueDate', 
                    width: 120, 
                    render: (date: string) => dayjs(date).format('MMM DD, YYYY') 
                  },
                  { 
                    title: 'Priority', 
                    dataIndex: 'priority', 
                    key: 'priority', 
                    width: 100, 
                    render: (priority: string) => {
                      const colors: Record<string, string> = { LOW: 'blue', MEDIUM: 'orange', HIGH: 'red', URGENT: 'red' };
                      return <Tag color={colors[priority] || 'default'}>{priority}</Tag>;
                    }
                  },
                ]}
              />
            ) : (
              <Paragraph type="secondary" style={{ textAlign: 'center', margin: '20px 0' }}>
                No assignments created yet
              </Paragraph>
            )}
          </Card>

          {/* Validation & Warnings */}
          <Card size="small" style={{ backgroundColor: '#f0f5ff', borderColor: '#1890ff' }}>
            <Title level={5} style={{ marginTop: 0 }}>📌 Validation Checklist</Title>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div>
                {basicForm.getFieldValue('planName') ? 
                  <Text type="success">✅ Plan name is set</Text> : 
                  <Text type="danger">❌ Plan name is required</Text>
                }
              </div>
              <div>
                {kpis.length > 0 ? 
                  <Text type="success">✅ {kpis.length} KPI(s) added (Weight: {totalKPIWeight}%)</Text> : 
                  <Text type="warning">⚠️ No KPIs added</Text>
                }
              </div>
              <div>
                {milestones.length > 0 ? (
                  totalBudget === 100 ?
                    <Text type="success">✅ {milestones.length} Milestone(s) added (Budget: {totalBudget}%)</Text> :
                    <Text type="danger">❌ Budget must total 100% (currently {totalBudget.toFixed(1)}%)</Text>
                ) : (
                  <Text type="danger">❌ No milestones added</Text>
                )}
              </div>
              <div>
                {selectedPackage ? 
                  <Text type="success">✅ Package selected: {packageOptions.find(p => p.value === selectedPackage)?.label}</Text> : 
                  <Text type="warning">⚠️ No package selected</Text>
                }
              </div>
              <div>
                {assignments.length > 0 ? 
                  <Text type="success">✅ {assignments.length} Assignment(s) created</Text> : 
                  <Text type="warning">⚠️ No assignments created</Text>
                }
              </div>
            </Space>
          </Card>
        </div>
      )}

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


