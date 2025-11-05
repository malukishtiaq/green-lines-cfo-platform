import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDashboardData() {
  console.log('🧹 Cleaning dashboard-related data...');

  try {
    // Delete in correct order (respecting foreign key constraints)
    
    // 1. Delete ServicePlans (has foreign key to Customer)
    const deletedPlans = await prisma.servicePlan.deleteMany({});
    console.log(`✅ Deleted ${deletedPlans.count} service plans`);

    // 2. Delete Customers
    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log(`✅ Deleted ${deletedCustomers.count} customers`);

    // 3. Delete Partners
    const deletedPartners = await prisma.partner.deleteMany({});
    console.log(`✅ Deleted ${deletedPartners.count} partners`);

    console.log('✨ Dashboard data cleaned successfully!');
    console.log('📝 Now run: npm run db:seed');
  } catch (error) {
    console.error('❌ Error cleaning data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDashboardData();

