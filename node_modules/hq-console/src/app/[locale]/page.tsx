import DashboardLayout from '@/components/DashboardLayout';
import DashboardPage from '@/presentation/components/DashboardPage';
import { CleanArchitectureConfig } from '@/application';

// Initialize Clean Architecture
CleanArchitectureConfig.initialize();

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}