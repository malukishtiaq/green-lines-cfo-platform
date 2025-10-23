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

const { Title, Text } = Typography;

interface PlanData {
  id: string;
  name: string;
  description?: string;
  customerId: string;
  industry: string;
  companySize: string;
  durationType: string;
  durationWeeks?: number;
  startDate?: string;
  workingDays: number;
  address?: string;
  siteType?: string;
  accessRequirements?: string;
  status: string;
  currentStage: number;
  totalStages: number;
  totalBudget: number;
  currency: string;
  notes?: string;
  milestones: Array<{
    id: string;
    sequence: number;
    name: string;
    description?: string;
    durationWeeks: number;
    budgetAllocation: number;
    deliverables?: string;
    dependencies?: string;
    isCriticalPath: boolean;
  }>;
}

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [plan, setPlan] = useState<PlanData | null>(null);
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
      const data = await response.json();
      
      if (data.success) {
        console.log('Plan data from API:', data.data);
        console.log('Milestones from API:', data.data.milestones);
        setPlan(data.data);
        // Load the plan data into localStorage for the PlanBuilder to use
        const planBuilderData = {
          // Stage 1 data
          planName: data.data.name,
          description: data.data.description || '',
          industry: data.data.industry,
          companySize: data.data.companySize,
          durationType: data.data.durationType,
          durationWeeks: data.data.durationWeeks,
          startDate: data.data.startDate,
          workingDays: data.data.workingDays,
          address: data.data.address || '',
          siteType: data.data.siteType || '',
          accessRequirements: data.data.accessRequirements || '',
          
          // Stage 2 data
          milestones: data.data.milestones.map((milestone: any) => ({
            id: milestone.id,
            sequence: milestone.sequence,
            name: milestone.name,
            durationWeeks: milestone.durationWeeks,
            budgetPercent: milestone.budgetAllocation || milestone.budgetPercent || 0,
            deliverables: milestone.deliverables || '',
            dependencies: milestone.dependencies ? milestone.dependencies.split(',').filter(Boolean) : [],
            criticalPath: milestone.isCriticalPath || milestone.criticalPath || false,
          })),
          
          // Plan metadata
          planId: data.data.id,
          customerId: data.data.customerId,
          totalBudget: data.data.totalBudget,
          currency: data.data.currency,
          notes: data.data.notes || '',
          currentStage: data.data.currentStage,
          lastSaved: new Date().toISOString(),
          isEdit: true,
        };
        
        console.log('Storing planBuilderData in localStorage:', planBuilderData);
        localStorage.setItem('planBuilderDraft', JSON.stringify(planBuilderData));
      } else {
        setError(data.error || 'Failed to fetch plan data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/plans';
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get the current draft data from localStorage
      const draftData = localStorage.getItem('planBuilderDraft');
      if (!draftData) {
        message.error('No plan data found to save');
        return;
      }

      const planData = JSON.parse(draftData);
      
      // Prepare the data for API
      const updateData = {
        name: planData.planName,
        description: planData.description,
        industry: planData.industry,
        companySize: planData.companySize,
        durationType: planData.durationType,
        durationWeeks: planData.durationWeeks,
        startDate: planData.startDate,
        workingDays: planData.workingDays,
        address: planData.address,
        siteType: planData.siteType,
        accessRequirements: planData.accessRequirements,
        totalBudget: planData.totalBudget,
        currency: planData.currency,
        notes: planData.notes,
        currentStage: planData.currentStage,
        status: 'active', // Update status when saving
      };

      const response = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('Plan updated successfully');
        // Clear the draft
        localStorage.removeItem('planBuilderDraft');
        // Redirect to plan details
        window.location.href = `/plans/${id}`;
      } else {
        message.error(result.error || 'Failed to update plan');
      }
    } catch (err) {
      message.error('Network error occurred');
    } finally {
      setSaving(false);
    }
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
            <Space>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                loading={saving}
              >
                Save Changes
              </Button>
            </Space>
          </div>
        </div>

        {/* Plan Builder Component */}
        <PlanBuilder />
      </div>
    </DashboardLayout>
  );
}
