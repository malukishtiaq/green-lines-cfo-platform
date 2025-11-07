'use client';

import { useParams } from 'next/navigation';
import { PlanMonitorPage } from '@/presentation/components/PlanMonitorPage';

export default function PlanMonitor() {
  const params = useParams();
  const planId = params.id as string;

  return <PlanMonitorPage planId={planId} />;
}

