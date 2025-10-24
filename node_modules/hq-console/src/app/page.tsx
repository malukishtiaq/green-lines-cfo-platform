'use client';

import DashboardLayout from '@/components/DashboardLayout';
import DashboardPage from '@/presentation/components/DashboardPage';
import { CleanArchitectureConfig } from '@/application';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Initialize Clean Architecture
    CleanArchitectureConfig.initialize();
  }, []);

  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}