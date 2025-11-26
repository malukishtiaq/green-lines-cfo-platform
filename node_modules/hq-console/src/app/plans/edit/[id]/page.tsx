'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Alert,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import DashboardLayout from '@/components/DashboardLayout';
import PlanBuilder from '@/presentation/components/PlanBuilder';
import { CleanArchitectureConfig } from '@/application';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    CleanArchitectureConfig.initialize();
    fetchPlanData();
  }, [id]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plans/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const planData = await response.json();
      
      console.log('📦 Raw API response:', planData);
      setPlan(planData);
      
      // Parse JSON fields safely
      let features = planData.features;
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch (e) {
          console.error('Failed to parse features:', e);
          features = {};
        }
      }
      
      let governancePolicy = planData.governancePolicy;
      if (typeof governancePolicy === 'string') {
        try {
          governancePolicy = JSON.parse(governancePolicy);
        } catch (e) {
          console.error('Failed to parse governancePolicy:', e);
          governancePolicy = {};
        }
      }

      let erpConnection = planData.erpConnection;
      if (typeof erpConnection === 'string') {
        try {
          erpConnection = JSON.parse(erpConnection);
        } catch (e) {
          console.error('Failed to parse erpConnection:', e);
          erpConnection = {};
        }
      }
      
      console.log('🔍 Parsed features:', features);
      console.log('🔍 Parsed governancePolicy:', governancePolicy);
      console.log('🔍 Parsed erpConnection:', erpConnection);
      console.log('🔍 KPIs from relations:', planData.kpis);
      console.log('🔍 Assignments from relations:', planData.assignments);
      
      // Build comprehensive Plan Builder data structure
      const planBuilderData = {
        // ========== STAGE 1: BASIC INFO ==========
        planName: planData.name || '',
        description: planData.description || '',
        clientId: planData.customerId || '',
        industry: features?.industry || '',
        companySize: features?.companySize || '',
        planType: planData.type || 'RIGHT_TRACK',
        branchQty: features?.branchQty || 1,
        
        // Plan Period - convert date strings to dayjs
        planPeriod: {
          durationType: features?.planPeriod?.durationType || 'FIXED',
          quarter: features?.planPeriod?.quarter || '',
          startDate: features?.planPeriod?.startDate ? dayjs(features.planPeriod.startDate) : null,
          endDate: features?.planPeriod?.endDate ? dayjs(features.planPeriod.endDate) : null,
        },
        
        // Session Configuration
        session: {
          frequency: features?.session?.frequency || 'MONTHLY',
          meetingHoursPerMonth: features?.session?.meetingHoursPerMonth || 8,
          presentMode: features?.session?.presentMode || 'ONLINE',
        },
        
        objectives: features?.objectives || '',
        users: Array.isArray(features?.users) ? features.users : [],
        
        // ========== STAGE 2: ERP & DATA SOURCES ==========
        erpType: erpConnection?.type || erpConnection?.erpType || 'ODOO',
        erpStatus: erpConnection?.status || erpConnection?.erpStatus || 'CONNECTED',
        mappingHealth: erpConnection?.mappingHealth || 85,
        dataDomains: Array.isArray(planData.dataDomains) ? planData.dataDomains : ['AR', 'AP', 'GL'],
        lastSyncDate: erpConnection?.lastSync ? dayjs(erpConnection.lastSync) : (erpConnection?.lastSyncDate ? dayjs(erpConnection.lastSyncDate) : null),
        syncFrequency: erpConnection?.syncFrequency || 'DAILY',
        erpNotes: erpConnection?.notes || erpConnection?.erpNotes || '',
        
        // ========== STAGE 3: KPIs & TARGETS ==========
        kpis: (() => {
          // Priority 1: Check features.kpis (stored in JSON)
          if (features?.kpis && Array.isArray(features.kpis) && features.kpis.length > 0) {
            console.log('✅ Using KPIs from features.kpis');
            return features.kpis.map((kpi: any) => ({
              id: kpi.id || `kpi-${Date.now()}-${Math.random()}`,
              kpiCode: kpi.kpiCode || kpi.kpiName || '',
              kpiName: kpi.kpiName || '',
              targetValue: kpi.targetValue || 0,
              thresholdGreen: kpi.thresholdGreen || 90,
              thresholdAmber: kpi.thresholdAmber || 70,
              thresholdRed: kpi.thresholdRed || 50,
              weight: kpi.weight || 0,
              calculationSource: kpi.calculationSource || 'MANUAL',
            }));
          }
          
          // Priority 2: Check relations (planData.kpis)
          if (planData.kpis && Array.isArray(planData.kpis) && planData.kpis.length > 0) {
            console.log('✅ Using KPIs from planData.kpis relations');
            return planData.kpis.map((kpi: any) => ({
              id: kpi.id,
              kpiCode: kpi.kpiName,
              kpiName: kpi.kpiName,
              targetValue: kpi.targetValue,
              thresholdGreen: kpi.thresholdGreen,
              thresholdAmber: kpi.thresholdAmber,
              thresholdRed: kpi.thresholdRed,
              weight: kpi.weight,
              calculationSource: kpi.calculationSource || 'MANUAL',
            }));
          }
          
          console.log('⚠️ No KPIs found');
          return [];
        })(),
        
        // ========== STAGE 4: MILESTONES & TIMELINE ==========
        milestones: (() => {
          // Milestones are stored in features.milestones
          if (features?.milestones && Array.isArray(features.milestones)) {
            console.log('✅ Using milestones from features');
            return features.milestones.map((m: any) => ({
              id: m.id || `milestone-${Date.now()}-${Math.random()}`,
              sequence: m.sequence || 1,
              name: m.name || '',
              durationWeeks: m.durationWeeks || 0,
              budgetPercent: parseFloat(m.budgetAllocation || m.budgetPercent || 0),
              deliverables: m.deliverables || '',
              dependencies: Array.isArray(m.dependencies) ? m.dependencies : [],
              criticalPath: m.isCriticalPath || m.criticalPath || false,
              owner: m.owner || 'HQ',
            }));
          }
          console.log('⚠️ No milestones found');
          return [];
        })(),
        
        // ========== STAGE 5: WORKFLOW & GOVERNANCE ==========
        governance: governancePolicy ? {
          approvalMode: governancePolicy.approvalMode || 'MODE_A',
          notificationChannels: Array.isArray(governancePolicy.notificationChannels) 
            ? governancePolicy.notificationChannels 
            : ['EMAIL'],
          reportCadence: governancePolicy.reportCadence || 'WEEKLY',
          slaResponseHours: governancePolicy.slaResponseHours || 24,
          escalationEnabled: governancePolicy.escalationEnabled ?? true,
          escalationContacts: governancePolicy.escalationContacts || '',
          meetingCadence: governancePolicy.meetingCadence || 'WEEKLY',
          decisionLogRequired: governancePolicy.decisionLogRequired ?? true,
          governanceNotes: governancePolicy.governanceNotes || governancePolicy.notes || '',
        } : {},
        
        // ========== STAGE 6: PRICING & COMMERCIALS ==========
        pricing: (() => {
          // Priority 1: Check features.pricing (nested structure)
          if (features?.pricing) {
            console.log('✅ Using pricing from features.pricing (nested)');
            return {
              package: features.pricing.package || 'STANDARD',
              addOns: Array.isArray(features.pricing.addOns) ? features.pricing.addOns : [],
              basePrice: features.pricing.basePrice || 0,
              totalPrice: features.pricing.totalPrice || planData.price || 0,
              currency: features.pricing.currency || planData.currency || 'AED',
              billingFrequency: features.pricing.billingFrequency || 'MONTHLY',
              upfrontPaymentPct: features.pricing.upfrontPaymentPct || 25,
              platformCommissionPct: features.pricing.platformCommissionPct || 15,
              partnerCommissionPct: features.pricing.partnerCommissionPct || 20,
              payoutDelayDays: features.pricing.payoutDelayDays || 30,
              refundPolicy: features.pricing.refundPolicy || '',
              contractStartDate: features.pricing.contractStartDate ? dayjs(features.pricing.contractStartDate) : null,
              contractEndDate: features.pricing.contractEndDate ? dayjs(features.pricing.contractEndDate) : null,
              paymentTerms: features.pricing.paymentTerms || '',
              notes: features.pricing.notes || '',
            };
          }
          
          // Priority 2: Check root level of features (current structure from PlanBuilder)
          console.log('✅ Using pricing from features root level');
          return {
            package: features?.package || 'STANDARD',
            addOns: Array.isArray(features?.addOns) ? features.addOns : [],
            basePrice: planData.price ? parseFloat(planData.price.toString()) : 0,
            totalPrice: planData.price ? parseFloat(planData.price.toString()) : 0,
            currency: planData.currency || 'AED',
            billingFrequency: 'MONTHLY',
            upfrontPaymentPct: features?.upfrontPaymentPct || 25,
            platformCommissionPct: features?.platformCommissionPct || 15,
            partnerCommissionPct: features?.partnerCommissionPct || 20,
            payoutDelayDays: features?.payoutDelayDays || 30,
            refundPolicy: features?.refundPolicy || '',
            contractStartDate: null,
            contractEndDate: null,
            paymentTerms: features?.paymentTerms || '',
            notes: features?.notes || '',
          };
        })(),
        
        // ========== STAGE 7: ASSIGNMENTS & PARTNERS ==========
        assignments: (() => {
          // Priority 1: Check features.assignments
          if (features?.assignments && Array.isArray(features.assignments) && features.assignments.length > 0) {
            console.log('✅ Using assignments from features');
            return features.assignments.map((a: any) => ({
              id: a.id || `assignment-${Date.now()}-${Math.random()}`,
              type: a.type || 'SETUP',
              partnerId: a.partnerId || null,
              partnerName: a.partnerName || '',
              assignmentOwner: a.assignmentOwner || 'HQ',
              slaHours: a.slaHours || 48,
              dueDate: a.dueDate || dayjs().add(7, 'day').format('YYYY-MM-DD'),
              priority: a.priority || 'MEDIUM',
              status: a.status || 'PENDING',
              notes: a.notes || '',
            }));
          }
          
          // Priority 2: Check relations (planData.assignments)
          if (planData.assignments && Array.isArray(planData.assignments) && planData.assignments.length > 0) {
            console.log('✅ Using assignments from planData.assignments relations');
            return planData.assignments.map((a: any) => ({
              id: a.id,
              type: a.type,
              partnerId: a.partnerId,
              partnerName: a.partner?.name || '',
              assignmentOwner: a.assignmentOwner,
              slaHours: a.slaHours,
              dueDate: a.dueDate,
              priority: a.priority,
              status: a.status,
              notes: a.notes || '',
            }));
          }
          
          console.log('⚠️ No assignments found');
          return [];
        })(),
        
        // ========== METADATA ==========
        planId: planData.id,
        customerId: planData.customerId,
        totalBudget: planData.price ? parseFloat(planData.price.toString()) : 0,
        currency: planData.currency || 'AED',
        notes: planData.description || '',
        currentStage: 0, // Start from first stage for editing
        lastSaved: new Date().toISOString(),
        isEdit: true,
      };
      
      console.log('💾 Final planBuilderData being stored:', planBuilderData);
      console.log('💰 Pricing object specifically:', planBuilderData.pricing);
      console.log('📝 Full pricing details:', JSON.stringify(planBuilderData.pricing, null, 2));
      localStorage.setItem('planBuilderDraft', JSON.stringify(planBuilderData));
      
      message.success('Plan data loaded successfully! All stages are now populated.');
    } catch (err) {
      console.error('❌ Error fetching plan data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch plan data');
      message.error('Failed to load plan data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/plans';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Loading plan data...</Text>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !plan) {
    return (
      <DashboardLayout>
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description={error || 'Plan not found'}
            type="error"
            showIcon
            action={
              <Button onClick={handleBack}>
                <ArrowLeftOutlined /> Go Back
              </Button>
            }
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            style={{ marginBottom: '16px' }}
          >
            Back to Plans
          </Button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Edit Plan: {plan.name}
              </Title>
              <Text type="secondary">Modify your service plan details</Text>
            </div>
          </div>
        </div>

        {/* Plan Builder Component */}
        <PlanBuilder />
      </div>
    </DashboardLayout>
  );
}
