import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@greenlines.com' },
    update: {},
    create: {
      email: 'admin@greenlines.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create demo customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'contact@abccompany.com' },
      update: {},
      create: {
        name: 'ABC Company',
        email: 'contact@abccompany.com',
        phone: '+971 50 123 4567',
        company: 'ABC Company LLC',
        address: 'Business Bay, Dubai',
        city: 'Dubai',
        country: 'UAE',
        industry: 'Technology',
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Long-term client with premium CFO services',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'info@xyzcorp.com' },
      update: {},
      create: {
        name: 'XYZ Corporation',
        email: 'info@xyzcorp.com',
        phone: '+971 4 567 8901',
        company: 'XYZ Corporation',
        address: 'DIFC, Dubai',
        city: 'Dubai',
        country: 'UAE',
        industry: 'Finance',
        size: 'LARGE',
        status: 'ACTIVE',
        notes: 'Enterprise client requiring comprehensive financial management',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'hello@defstartup.com' },
      update: {},
      create: {
        name: 'DEF Startup',
        email: 'hello@defstartup.com',
        phone: '+971 50 987 6543',
        company: 'DEF Startup',
        address: 'Silicon Oasis, Dubai',
        city: 'Dubai',
        country: 'UAE',
        industry: 'Startup',
        size: 'STARTUP',
        status: 'PROSPECT',
        notes: 'New startup looking for basic CFO services',
      },
    }),
  ]);

  console.log('✅ Demo customers created:', customers.length);

  // Create service plans
  const servicePlans = await Promise.all([
    prisma.servicePlan.create({
      data: {
        name: 'Basic CFO Package',
        description: 'Essential financial management services for small businesses',
        type: 'BASIC_CFO',
        status: 'ACTIVE',
        price: 5000,
        currency: 'AED',
        duration: 12,
        features: {
          monthlyFinancialReports: true,
          taxPreparation: true,
          basicConsulting: true,
          emailSupport: true,
        },
        customerId: customers[0].id,
      },
    }),
    prisma.servicePlan.create({
      data: {
        name: 'Premium CFO Package',
        description: 'Comprehensive financial management with advanced analytics',
        type: 'PREMIUM_CFO',
        status: 'ACTIVE',
        price: 12000,
        currency: 'AED',
        duration: 12,
        features: {
          monthlyFinancialReports: true,
          taxPreparation: true,
          advancedConsulting: true,
          prioritySupport: true,
          businessIntelligence: true,
          cashFlowForecasting: true,
        },
        customerId: customers[1].id,
      },
    }),
    prisma.servicePlan.create({
      data: {
        name: 'Startup Package',
        description: 'Tailored financial services for growing startups',
        type: 'CONSULTING',
        status: 'ACTIVE',
        price: 3000,
        currency: 'AED',
        duration: 6,
        features: {
          quarterlyReports: true,
          basicConsulting: true,
          emailSupport: true,
          startupGuidance: true,
        },
        customerId: customers[2].id,
      },
    }),
  ]);

  console.log('✅ Service plans created:', servicePlans.length);

  // Create demo tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Q4 Financial Review',
        description: 'Comprehensive review of Q4 financial performance and year-end reporting',
        type: 'FINANCIAL_REVIEW',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date('2025-10-20'),
        estimatedHours: 8,
        customerId: customers[0].id,
        servicePlanId: servicePlans[0].id,
        createdById: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Tax Filing Preparation',
        description: 'Prepare and file annual tax returns for XYZ Corporation',
        type: 'TAX_PREPARATION',
        priority: 'URGENT',
        status: 'COMPLETED',
        dueDate: new Date('2025-10-18'),
        completedAt: new Date('2025-10-17'),
        estimatedHours: 12,
        actualHours: 10,
        customerId: customers[1].id,
        servicePlanId: servicePlans[1].id,
        createdById: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Budget Planning Session',
        description: 'Conduct budget planning session for DEF Startup',
        type: 'BUDGET_PLANNING',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: new Date('2025-10-25'),
        estimatedHours: 4,
        customerId: customers[2].id,
        servicePlanId: servicePlans[2].id,
        createdById: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Demo tasks created:', tasks.length);

  // Create task assignments
  await Promise.all([
    prisma.taskAssignment.create({
      data: {
        taskId: tasks[0].id,
        userId: adminUser.id,
        status: 'IN_PROGRESS',
        notes: 'Assigned to admin for Q4 review',
      },
    }),
    prisma.taskAssignment.create({
      data: {
        taskId: tasks[1].id,
        userId: adminUser.id,
        status: 'COMPLETED',
        notes: 'Tax filing completed successfully',
      },
    }),
    prisma.taskAssignment.create({
      data: {
        taskId: tasks[2].id,
        userId: adminUser.id,
        status: 'ASSIGNED',
        notes: 'Scheduled for next week',
      },
    }),
  ]);

  console.log('✅ Task assignments created');

  // Create demo communications
  await Promise.all([
    prisma.communication.create({
      data: {
        type: 'EMAIL',
        subject: 'Q4 Financial Review Discussion',
        content: 'We need to schedule a meeting to discuss the Q4 financial review findings.',
        direction: 'OUTBOUND',
        customerId: customers[0].id,
      },
    }),
    prisma.communication.create({
      data: {
        type: 'PHONE',
        subject: 'Tax Filing Update',
        content: 'Tax filing has been completed and submitted successfully.',
        direction: 'OUTBOUND',
        customerId: customers[1].id,
      },
    }),
    prisma.communication.create({
      data: {
        type: 'MEETING',
        subject: 'Budget Planning Consultation',
        content: 'Initial consultation meeting scheduled for budget planning.',
        direction: 'INBOUND',
        customerId: customers[2].id,
      },
    }),
  ]);

  console.log('✅ Demo communications created');

  // Create demo partners
  const partners = await Promise.all([
    prisma.partner.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@techpartners.ae',
        phone: '+971 50 123 4567',
        country: 'UAE',
        city: 'Dubai',
        address: 'Dubai Internet City, Dubai',
        latitude: 25.0919,
        longitude: 55.1659,
        domain: 'Network Infrastructure',
        role: 'TECHNICAL',
        specialties: ['Network Infrastructure', 'Security Systems', 'WiFi Deployment'],
        rating: 4.8,
        activeEngagements: 3,
        availability: 'MODERATE',
        remoteOk: false,
        notes: 'Specialized in network infrastructure and security systems',
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Ahmed Hassan',
        email: 'ahmed@serverexperts.ae',
        phone: '+971 50 234 5678',
        country: 'UAE',
        city: 'Dubai',
        address: 'Al Barsha, Dubai',
        latitude: 25.1124,
        longitude: 55.1966,
        domain: 'Server Infrastructure',
        role: 'TECHNICAL',
        specialties: ['Server Setup', 'Cloud Configuration', 'Backup Systems'],
        rating: 4.6,
        activeEngagements: 1,
        availability: 'AVAILABLE',
        remoteOk: true,
        notes: 'Expert in server technologies and cloud infrastructure',
      },
    }),
    prisma.partner.create({
      data: {
        name: 'XYZ Consulting',
        email: 'contact@xyzconsulting.om',
        phone: '+968 90 123 456',
        country: 'Oman',
        city: 'Muscat',
        address: 'Al Khuwair, Muscat',
        latitude: 23.5883,
        longitude: 58.3829,
        domain: 'Odoo ERP',
        role: 'ERP_CONSULTANT',
        specialties: ['Odoo Implementation', 'ERP Integration', 'Business Process'],
        rating: 4.7,
        activeEngagements: 2,
        availability: 'MODERATE',
        remoteOk: true,
        notes: 'Specialized in Odoo implementations',
      },
    }),
    prisma.partner.create({
      data: {
        name: 'ABC Tech Egypt',
        email: 'info@abctech.eg',
        phone: '+20 100 555 1234',
        country: 'Egypt',
        city: 'Cairo',
        address: 'Nasr City, Cairo',
        latitude: 30.0626,
        longitude: 31.3458,
        domain: 'Stock Count',
        role: 'STOCK_COUNT',
        specialties: ['Inventory Management', 'Stock Count', 'Asset Tracking'],
        rating: 4.5,
        activeEngagements: 2,
        availability: 'AVAILABLE',
        remoteOk: false,
        notes: 'On-site inventory stock count services',
      },
    }),
    prisma.partner.create({
      data: {
        name: 'David Chen',
        email: 'david@enterprisetech.ae',
        phone: '+971 50 345 6789',
        country: 'UAE',
        city: 'Dubai',
        address: 'Jumeirah Lake Towers, Dubai',
        latitude: 25.0706,
        longitude: 55.1410,
        domain: 'Enterprise Systems',
        role: 'IMPLEMENTATION',
        specialties: ['Enterprise Systems', 'VoIP', 'Digital Signage', 'IoT Integration'],
        rating: 4.9,
        activeEngagements: 5,
        availability: 'BUSY',
        remoteOk: true,
        notes: 'Enterprise systems specialist with high demand',
      },
    }),
  ]);

  console.log('✅ Demo partners created:', partners.length);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
