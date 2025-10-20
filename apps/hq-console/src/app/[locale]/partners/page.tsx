import DashboardLayout from '@/components/DashboardLayout';
import PartnersPage from '@/presentation/components/PartnersPage';
import { CleanArchitectureConfig } from '@/application';

// Initialize Clean Architecture
CleanArchitectureConfig.initialize();

export default function Partners() {
  return (
    <DashboardLayout>
      <PartnersPage />
    </DashboardLayout>
  );
}


