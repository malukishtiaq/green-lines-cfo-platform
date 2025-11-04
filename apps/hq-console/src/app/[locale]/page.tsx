import DashboardLayout from '@/components/DashboardLayout';
import DashboardPageEnhanced from '@/presentation/components/DashboardPageEnhanced';
import { CleanArchitectureConfig } from '@/application';

// Initialize Clean Architecture
CleanArchitectureConfig.initialize();

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardPageEnhanced />
    </DashboardLayout>
  );
}