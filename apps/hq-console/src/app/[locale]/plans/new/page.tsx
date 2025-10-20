'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PlanBuilder from '@/presentation/components/PlanBuilder';
import { CleanArchitectureConfig } from '@/application';
import { useEffect } from 'react';

export default function NewPlanPage() {
  useEffect(() => {
    CleanArchitectureConfig.initialize();
  }, []);

  return (
    <DashboardLayout>
      <PlanBuilder />
    </DashboardLayout>
  );
}


