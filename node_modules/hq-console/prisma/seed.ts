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

  // Create demo customers from different regions
  const customers = await Promise.all([
    // ========== GCC REGION ==========
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
        industry: 'Retail',
        size: 'STARTUP',
        status: 'PROSPECT',
        notes: 'New startup looking for basic CFO services',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'info@saudiarabiaco.com' },
      update: {},
      create: {
        name: 'Saudi Arabia Holdings',
        email: 'info@saudiarabiaco.com',
        phone: '+966 11 123 4567',
        company: 'Saudi Arabia Holdings Ltd',
        address: 'King Fahd Road, Riyadh',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        industry: 'Real Estate',
        size: 'LARGE',
        status: 'ACTIVE',
        notes: 'Major real estate portfolio management',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'contact@kuwaitfin.com' },
      update: {},
      create: {
        name: 'Kuwait Finance Co',
        email: 'contact@kuwaitfin.com',
        phone: '+965 2222 3333',
        company: 'Kuwait Finance Company',
        address: 'Kuwait City',
        city: 'Kuwait City',
        country: 'Kuwait',
        industry: 'Finance',
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Financial services provider',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'hello@qatartech.com' },
      update: {},
      create: {
        name: 'Qatar Tech Solutions',
        email: 'hello@qatartech.com',
        phone: '+974 4444 5555',
        company: 'Qatar Tech Solutions LLC',
        address: 'West Bay, Doha',
        city: 'Doha',
        country: 'Qatar',
        industry: 'Technology',
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Tech consulting services',
      },
    }),

    // ========== MENA REGION ==========
    prisma.customer.upsert({
      where: { email: 'info@egyptgroup.com' },
      update: {},
      create: {
        name: 'Egypt Industrial Group',
        email: 'info@egyptgroup.com',
        phone: '+20 2 1234 5678',
        company: 'Egypt Industrial Group',
        address: 'Nasr City, Cairo',
        city: 'Cairo',
        country: 'Egypt',
        industry: 'Manufacturing',
        size: 'LARGE',
        status: 'ACTIVE',
        notes: 'Major manufacturing operations',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'contact@jordantrade.com' },
      update: {},
      create: {
        name: 'Jordan Trade Partners',
        email: 'contact@jordantrade.com',
        phone: '+962 6 111 2222',
        company: 'Jordan Trade Partners Ltd',
        address: 'Abdali, Amman',
        city: 'Amman',
        country: 'Jordan',
        industry: 'Retail',
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Import/export business',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'hello@lebanonbank.com' },
      update: {},
      create: {
        name: 'Lebanon Commercial Bank',
        email: 'hello@lebanonbank.com',
        phone: '+961 1 333 4444',
        company: 'Lebanon Commercial Bank SAL',
        address: 'Beirut Central District',
        city: 'Beirut',
        country: 'Lebanon',
        industry: 'Finance',
        size: 'LARGE',
        status: 'ACTIVE',
        notes: 'Regional banking operations',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'info@moroccotextile.com' },
      update: {},
      create: {
        name: 'Morocco Textile Industries',
        email: 'info@moroccotextile.com',
        phone: '+212 522 111 222',
        company: 'Morocco Textile Industries SARL',
        address: 'Casablanca Free Zone',
        city: 'Casablanca',
        country: 'Morocco',
        industry: 'Manufacturing',
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Textile manufacturing and export',
      },
    }),

    // ========== APAC REGION ==========
    prisma.customer.upsert({
      where: { email: 'contact@indiatech.com' },
      update: {},
      create: {
        name: 'India Tech Solutions',
        email: 'contact@indiatech.com',
        phone: '+91 11 2345 6789',
        company: 'India Tech Solutions Pvt Ltd',
        address: 'Cyber City, Gurugram',
        city: 'Gurugram',
        country: 'India',
        industry: 'Technology',
        size: 'LARGE',
        status: 'ACTIVE',
        notes: 'Software development services',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'info@pakistanmanufacturing.com' },
      update: {},
      create: {
        name: 'Pakistan Manufacturing Ltd',
        email: 'info@pakistanmanufacturing.com',
        phone: '+92 21 1234 5678',
        company: 'Pakistan Manufacturing Limited',
        address: 'SITE Area, Karachi',
        city: 'Karachi',
        country: 'Pakistan',
        industry: 'Manufacturing',
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Industrial manufacturing',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'hello@singaporefinance.com' },
      update: {},
      create: {
        name: 'Singapore Finance Hub',
        email: 'hello@singaporefinance.com',
        phone: '+65 6789 0123',
        company: 'Singapore Finance Hub Pte Ltd',
        address: 'Marina Bay Financial Centre',
        city: 'Singapore',
        country: 'Singapore',
        industry: 'Finance',
        size: 'LARGE',
        status: 'ACTIVE',
        notes: 'Regional financial services hub',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'contact@malaysialogistics.com' },
      update: {},
      create: {
        name: 'Malaysia Logistics Group',
        email: 'contact@malaysialogistics.com',
        phone: '+60 3 1234 5678',
        company: 'Malaysia Logistics Group Sdn Bhd',
        address: 'Port Klang',
        city: 'Kuala Lumpur',
        country: 'Malaysia',
        industry: 'Logistics',
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Supply chain and logistics services',
      },
    }),

    // ========== EU REGION ==========
    prisma.customer.upsert({
      where: { email: 'info@ukfinancial.com' },
      update: {},
      create: {
        name: 'UK Financial Services',
        email: 'info@ukfinancial.com',
        phone: '+44 20 7123 4567',
        company: 'UK Financial Services Ltd',
        address: 'Canary Wharf, London',
        city: 'London',
        country: 'United Kingdom',
        industry: 'Finance',
        size: 'LARGE',
        status: 'ACTIVE',
        notes: 'Investment management services',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'contact@germanengineering.com' },
      update: {},
      create: {
        name: 'German Engineering GmbH',
        email: 'contact@germanengineering.com',
        phone: '+49 89 1234 5678',
        company: 'German Engineering GmbH',
        address: 'Munich Business District',
        city: 'Munich',
        country: 'Germany',
        industry: 'Manufacturing',
        size: 'LARGE',
        status: 'ACTIVE',
        notes: 'Advanced engineering solutions',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'hello@frenchfashion.com' },
      update: {},
      create: {
        name: 'French Fashion House',
        email: 'hello@frenchfashion.com',
        phone: '+33 1 4567 8900',
        company: 'French Fashion House SAS',
        address: 'Champs-Élysées, Paris',
        city: 'Paris',
        country: 'France',
        industry: 'Retail',
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Luxury fashion and accessories',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'info@netherlandslogistics.com' },
      update: {},
      create: {
        name: 'Netherlands Logistics BV',
        email: 'info@netherlandslogistics.com',
        phone: '+31 20 1234 567',
        company: 'Netherlands Logistics BV',
        address: 'Port of Rotterdam',
        city: 'Rotterdam',
        country: 'Netherlands',
        industry: 'Logistics',
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'International shipping and logistics',
      },
    }),
  ]);

  console.log('✅ Demo customers created from all regions (GCC, MENA, APAC, EU):', customers.length);

  // Create service plans
  const servicePlans = await Promise.all([
    prisma.servicePlan.create({
      data: {
        name: 'Basic CFO Package',
        description: 'Essential financial management services',
        type: 'BASIC_CFO',
        status: 'ACTIVE',
        price: 15000,
        currency: 'SAR',
        duration: 12,
        features: {
          monthlyReports: true,
          taxPreparation: true,
          consultation: true,
        },
        customerId: customers[0].id,
      },
    }),
    prisma.servicePlan.create({
      data: {
        name: 'Premium CFO Package',
        description: 'Comprehensive financial management',
        type: 'PREMIUM_CFO',
        status: 'ACTIVE',
        price: 35000,
        currency: 'SAR',
        duration: 12,
        features: {
          monthlyReports: true,
          taxPreparation: true,
          consultation: true,
          strategy: true,
        },
        customerId: customers[1].id,
      },
    }),
    prisma.servicePlan.create({
      data: {
        name: 'Enterprise CFO',
        description: 'Full-service financial leadership',
        type: 'ENTERPRISE_CFO',
        status: 'ACTIVE',
        price: 75000,
        currency: 'SAR',
        duration: 12,
        features: {
          dedicated: true,
          fullService: true,
        },
        customerId: customers[1].id,
      },
    }),
  ]);

  console.log('✅ Service plans created:', servicePlans.length);

  // Create Tasks with Budgets (Following the new flow)
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Financial System Implementation',
        description: 'Complete financial management system setup for ABC Company',
        type: 'BUDGET_PLANNING',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        budget: 100000, // SAR 100,000 agreed with customer
        actualCost: 25000, // SAR 25,000 spent so far
        dueDate: new Date('2025-12-31'),
        estimatedHours: 200,
        actualHours: 50,
        customerId: customers[0].id,
        servicePlanId: servicePlans[0].id,
        createdById: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Tax Compliance & Filing',
        description: 'Annual tax preparation and compliance for XYZ Corp',
        type: 'TAX_PREPARATION',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        budget: 50000, // SAR 50,000
        actualCost: 15000, // SAR 15,000 spent
        dueDate: new Date('2025-11-30'),
        estimatedHours: 100,
        actualHours: 30,
        customerId: customers[1].id,
        servicePlanId: servicePlans[1].id,
        createdById: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Q4 Financial Review',
        description: 'Quarterly financial review and reporting',
        type: 'FINANCIAL_REVIEW',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        budget: 25000, // SAR 25,000
        actualCost: 23000, // SAR 23,000 actual (under budget!)
        dueDate: new Date('2025-10-15'),
        completedAt: new Date('2025-10-14'),
        estimatedHours: 40,
        actualHours: 38,
        customerId: customers[1].id,
        servicePlanId: servicePlans[2].id,
        createdById: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Startup Financial Setup',
        description: 'Initial financial system setup for DEF Startup',
        type: 'BUDGET_PLANNING',
        priority: 'MEDIUM',
        status: 'PENDING',
        budget: 30000, // SAR 30,000
        actualCost: 0, // Not started yet
        dueDate: new Date('2026-01-31'),
        estimatedHours: 60,
        customerId: customers[2].id,
        createdById: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Tasks created with budgets:', tasks.length);

  // Create Plans linked to Tasks
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: 'Financial System Implementation Plan',
        description: 'Step-by-step plan for ABC Company financial system',
        customerId: customers[0].id,
        taskId: tasks[0].id, // Linked to Task!
        industry: 'Technology',
        companySize: 'MEDIUM',
        durationType: 'WEEKS',
        durationWeeks: 24,
        startDate: new Date('2025-10-01'),
        workingDays: 5,
        address: 'Business Bay, Dubai',
        siteType: 'Office',
        status: 'ACTIVE',
        currentStage: 2,
        totalStages: 7,
        totalBudget: 100000, // Same as task budget
        currency: 'SAR',
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Tax Compliance Plan',
        description: 'Tax preparation and filing plan for XYZ Corp',
        customerId: customers[1].id,
        taskId: tasks[1].id, // Linked to Task!
        industry: 'Finance',
        companySize: 'LARGE',
        durationType: 'WEEKS',
        durationWeeks: 12,
        startDate: new Date('2025-10-15'),
        workingDays: 5,
        status: 'ACTIVE',
        currentStage: 2,
        totalStages: 4,
        totalBudget: 50000,
        currency: 'SAR',
      },
    }),
  ]);

  console.log('✅ Plans created (linked to tasks):', plans.length);

  // Create Milestones with Budget Allocation and Status
  const milestones = await Promise.all([
    // Plan 1 Milestones (Financial System Implementation)
    prisma.milestone.create({
      data: {
        planId: plans[0].id,
        sequence: 1,
        name: 'Requirements Analysis',
        description: 'Gather requirements and assess current state',
        durationWeeks: 2,
        budgetAllocation: 10, // 10% = SAR 10,000
        deliverables: 'Requirements document, Gap analysis',
        isCriticalPath: true,
        status: 'COMPLETED',
        startDate: new Date('2025-10-01'),
        completedDate: new Date('2025-10-14'),
        actualCost: 9500, // Actual cost
      },
    }),
    prisma.milestone.create({
      data: {
        planId: plans[0].id,
        sequence: 2,
        name: 'System Design',
        description: 'Design financial system architecture',
        durationWeeks: 4,
        budgetAllocation: 15, // 15% = SAR 15,000
        deliverables: 'System design, Process flows',
        isCriticalPath: true,
        status: 'IN_PROGRESS',
        startDate: new Date('2025-10-15'),
        actualCost: 12000, // Partial cost so far
      },
    }),
    prisma.milestone.create({
      data: {
        planId: plans[0].id,
        sequence: 3,
        name: 'Implementation',
        description: 'Build and configure the system',
        durationWeeks: 8,
        budgetAllocation: 40, // 40% = SAR 40,000
        deliverables: 'Configured system, Integration',
        isCriticalPath: true,
        status: 'PENDING',
      },
    }),
    prisma.milestone.create({
      data: {
        planId: plans[0].id,
        sequence: 4,
        name: 'Testing & Training',
        description: 'UAT and staff training',
        durationWeeks: 6,
        budgetAllocation: 20, // 20% = SAR 20,000
        deliverables: 'Test reports, Training materials',
        isCriticalPath: false,
        status: 'PENDING',
      },
    }),
    prisma.milestone.create({
      data: {
        planId: plans[0].id,
        sequence: 5,
        name: 'Go-Live & Support',
        description: 'Launch and initial support',
        durationWeeks: 4,
        budgetAllocation: 15, // 15% = SAR 15,000
        deliverables: 'Live system, Support documentation',
        isCriticalPath: true,
        status: 'PENDING',
      },
    }),
    // Plan 2 Milestones (Tax Compliance)
    prisma.milestone.create({
      data: {
        planId: plans[1].id,
        sequence: 1,
        name: 'Document Collection',
        description: 'Gather all tax documents',
        durationWeeks: 2,
        budgetAllocation: 20, // 20% = SAR 10,000
        deliverables: 'Complete document set',
        isCriticalPath: true,
        status: 'COMPLETED',
        startDate: new Date('2025-10-15'),
        completedDate: new Date('2025-10-28'),
        actualCost: 9800,
      },
    }),
    prisma.milestone.create({
      data: {
        planId: plans[1].id,
        sequence: 2,
        name: 'Tax Calculation',
        description: 'Calculate tax obligations',
        durationWeeks: 4,
        budgetAllocation: 35, // 35% = SAR 17,500
        deliverables: 'Tax calculations, Worksheets',
        isCriticalPath: true,
        status: 'IN_PROGRESS',
        startDate: new Date('2025-10-29'),
        actualCost: 8000, // Partial
      },
    }),
    prisma.milestone.create({
      data: {
        planId: plans[1].id,
        sequence: 3,
        name: 'Filing Preparation',
        description: 'Prepare tax returns',
        durationWeeks: 3,
        budgetAllocation: 25, // 25% = SAR 12,500
        deliverables: 'Draft returns',
        isCriticalPath: true,
        status: 'PENDING',
      },
    }),
    prisma.milestone.create({
      data: {
        planId: plans[1].id,
        sequence: 4,
        name: 'Submission & Follow-up',
        description: 'Submit and track status',
        durationWeeks: 3,
        budgetAllocation: 20, // 20% = SAR 10,000
        deliverables: 'Filed returns, Confirmation',
        isCriticalPath: true,
        status: 'PENDING',
      },
    }),
  ]);

  console.log('✅ Milestones created with status tracking:', milestones.length);

  // Create task assignments
  await Promise.all(
    tasks.slice(0, 3).map((task) =>
      prisma.taskAssignment.create({
        data: {
          taskId: task.id,
          userId: adminUser.id,
          status: 'ASSIGNED',
          notes: 'Primary assignee',
        },
      })
    )
  );

  console.log('✅ Task assignments created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
