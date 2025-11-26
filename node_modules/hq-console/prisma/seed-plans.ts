import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed data with realistic business scenarios
const planTemplates = [
  {
    name: "Q1 2025 Financial Restructuring - Tech Startup",
    description: "Comprehensive financial restructuring and CFO advisory services for a growing tech startup preparing for Series A funding",
    objectives: "Improve cash flow management, implement financial controls, prepare investor-ready financial statements, optimize burn rate",
    industry: "Technology",
    companySize: "SMALL",
    planType: "RIGHT_TRACK",
    package: "PREMIUM",
    addOns: ["ADVANCED_REPORTING", "API_ACCESS", "TRAINING_PACKAGE"],
    price: 28500,
    durationWeeks: 12,
    erpType: "QUICKBOOKS",
  },
  {
    name: "Q4 2024 Manufacturing Cost Optimization",
    description: "Cost reduction and operational efficiency improvement program for manufacturing company",
    objectives: "Reduce production costs by 15%, implement ABC costing, optimize inventory management, improve gross margins",
    industry: "Manufacturing",
    companySize: "MEDIUM",
    planType: "PERFORMANCE_MONITORING",
    package: "STANDARD",
    addOns: ["ADVANCED_REPORTING", "DEDICATED_SUPPORT"],
    price: 15000,
    durationWeeks: 16,
    erpType: "SAP",
  },
  {
    name: "Retail Chain Financial Dashboard Implementation",
    description: "Real-time financial dashboard and KPI tracking system for multi-location retail chain",
    objectives: "Implement real-time financial tracking, automate reporting, track store-level profitability, reduce reporting time by 70%",
    industry: "Retail",
    companySize: "LARGE",
    planType: "RIGHT_TRACK",
    package: "PREMIUM",
    addOns: ["ADVANCED_REPORTING", "API_ACCESS", "EXTRA_USERS", "DEDICATED_SUPPORT"],
    price: 32000,
    durationWeeks: 20,
    erpType: "ORACLE",
  },
  {
    name: "Healthcare Clinic Financial Compliance Review",
    description: "Financial compliance audit and process improvement for healthcare services provider",
    objectives: "Ensure regulatory compliance, improve billing accuracy, optimize revenue cycle, reduce claim rejections by 40%",
    industry: "Healthcare",
    companySize: "SMALL",
    planType: "RIGHT_TRACK",
    package: "STANDARD",
    addOns: ["ADVANCED_REPORTING"],
    price: 12000,
    durationWeeks: 10,
    erpType: "ODOO",
  },
  {
    name: "E-commerce Platform Financial Integration",
    description: "Integration of financial systems for rapidly growing e-commerce platform",
    objectives: "Integrate payment gateways, automate reconciliation, implement multi-currency support, real-time financial tracking",
    industry: "E-commerce",
    companySize: "MEDIUM",
    planType: "PERFORMANCE_MONITORING",
    package: "PREMIUM",
    addOns: ["API_ACCESS", "TRAINING_PACKAGE", "DEDICATED_SUPPORT"],
    price: 25000,
    durationWeeks: 14,
    erpType: "NETSUITE",
  },
  {
    name: "Construction Company Project Costing System",
    description: "Implementation of project-based costing and financial tracking system",
    objectives: "Implement project costing, track WIP, improve job profitability analysis, reduce cost overruns by 25%",
    industry: "Construction",
    companySize: "MEDIUM",
    planType: "RIGHT_TRACK",
    package: "STANDARD",
    addOns: ["ADVANCED_REPORTING", "TRAINING_PACKAGE"],
    price: 18000,
    durationWeeks: 15,
    erpType: "PROCORE",
  },
  {
    name: "Restaurant Group Financial Consolidation",
    description: "Multi-location financial consolidation and performance tracking for restaurant group",
    objectives: "Consolidate financial data from 8 locations, implement food cost tracking, optimize menu pricing, improve margins",
    industry: "Food & Beverage",
    companySize: "SMALL",
    planType: "PERFORMANCE_MONITORING",
    package: "STANDARD",
    addOns: ["ADVANCED_REPORTING"],
    price: 14000,
    durationWeeks: 12,
    erpType: "TOAST",
  },
  {
    name: "Professional Services Firm Financial Automation",
    description: "Automation of billing, time tracking, and financial reporting for consulting firm",
    objectives: "Automate time & billing, improve cash collection, implement project profitability tracking, reduce admin time by 50%",
    industry: "Professional Services",
    companySize: "SMALL",
    planType: "RIGHT_TRACK",
    package: "PREMIUM",
    addOns: ["API_ACCESS", "ADVANCED_REPORTING", "TRAINING_PACKAGE"],
    price: 22000,
    durationWeeks: 10,
    erpType: "XERO",
  },
  {
    name: "Manufacturing Scale-Up Financial Planning",
    description: "Financial planning and analysis for manufacturing company scaling operations",
    objectives: "Create 3-year financial model, implement rolling forecasts, improve working capital management, prepare for expansion",
    industry: "Manufacturing",
    companySize: "MEDIUM",
    planType: "RIGHT_TRACK",
    package: "PREMIUM",
    addOns: ["ADVANCED_REPORTING", "DEDICATED_SUPPORT", "TRAINING_PACKAGE"],
    price: 30000,
    durationWeeks: 18,
    erpType: "SAP",
  },
  {
    name: "SaaS Startup Financial Metrics Dashboard",
    description: "Implementation of SaaS-specific financial metrics and investor reporting",
    objectives: "Track MRR, CAC, LTV, churn rate, implement cohort analysis, create investor-ready metrics dashboard",
    industry: "Technology",
    companySize: "SMALL",
    planType: "PERFORMANCE_MONITORING",
    package: "PREMIUM",
    addOns: ["API_ACCESS", "ADVANCED_REPORTING", "EXTRA_USERS"],
    price: 24000,
    durationWeeks: 12,
    erpType: "QUICKBOOKS",
  },
];

// KPI templates based on industry
const kpiTemplates = {
  Technology: [
    { code: "FIN.BURN_RATE", name: "Monthly Burn Rate", target: 50000, thresholdGreen: 40000, thresholdAmber: 50000, thresholdRed: 60000, weight: 25 },
    { code: "FIN.RUNWAY", name: "Cash Runway (months)", target: 18, thresholdGreen: 15, thresholdAmber: 12, thresholdRed: 9, weight: 30 },
    { code: "REV.MRR", name: "Monthly Recurring Revenue", target: 100000, thresholdGreen: 90000, thresholdAmber: 75000, thresholdRed: 60000, weight: 25 },
    { code: "FIN.GROSS_MARGIN", name: "Gross Margin %", target: 75, thresholdGreen: 70, thresholdAmber: 65, thresholdRed: 60, weight: 20 },
  ],
  Manufacturing: [
    { code: "FIN.OP_MARGIN", name: "Operating Margin %", target: 15, thresholdGreen: 12, thresholdAmber: 10, thresholdRed: 8, weight: 30 },
    { code: "OPS.INVENTORY_TURNS", name: "Inventory Turnover", target: 8, thresholdGreen: 7, thresholdAmber: 6, thresholdRed: 5, weight: 25 },
    { code: "FIN.ROA", name: "Return on Assets %", target: 12, thresholdGreen: 10, thresholdAmber: 8, thresholdRed: 6, weight: 25 },
    { code: "WC.DPO", name: "Days Payables Outstanding", target: 45, thresholdGreen: 40, thresholdAmber: 35, thresholdRed: 30, weight: 20 },
  ],
  Retail: [
    { code: "FIN.GROSS_MARGIN", name: "Gross Margin %", target: 40, thresholdGreen: 38, thresholdAmber: 35, thresholdRed: 32, weight: 30 },
    { code: "OPS.INVENTORY_TURNS", name: "Inventory Turnover", target: 6, thresholdGreen: 5, thresholdAmber: 4, thresholdRed: 3, weight: 25 },
    { code: "REV.SAME_STORE_SALES", name: "Same Store Sales Growth %", target: 5, thresholdGreen: 4, thresholdAmber: 2, thresholdRed: 0, weight: 25 },
    { code: "FIN.EBITDA", name: "EBITDA Margin %", target: 12, thresholdGreen: 10, thresholdAmber: 8, thresholdRed: 6, weight: 20 },
  ],
  default: [
    { code: "FIN.OP_MARGIN", name: "Operating Margin %", target: 20, thresholdGreen: 18, thresholdAmber: 15, thresholdRed: 12, weight: 35 },
    { code: "FIN.CURRENT_RATIO", name: "Current Ratio", target: 2.0, thresholdGreen: 1.8, thresholdAmber: 1.5, thresholdRed: 1.2, weight: 30 },
    { code: "WC.DSO", name: "Days Sales Outstanding", target: 30, thresholdGreen: 35, thresholdAmber: 40, thresholdRed: 45, weight: 35 },
  ],
};

// Milestone templates based on plan type
const milestoneTemplates = {
  standard: [
    { name: "Discovery & Assessment", durationWeeks: 2, budgetPercent: 15, deliverables: "Current state analysis, stakeholder interviews, data collection", criticalPath: true },
    { name: "Process Design & Planning", durationWeeks: 3, budgetPercent: 20, deliverables: "Process documentation, implementation plan, resource allocation", criticalPath: true },
    { name: "Implementation Phase 1", durationWeeks: 4, budgetPercent: 30, deliverables: "System configuration, initial setup, data migration", criticalPath: true },
    { name: "Testing & Refinement", durationWeeks: 2, budgetPercent: 15, deliverables: "User acceptance testing, issue resolution, fine-tuning", criticalPath: false },
    { name: "Training & Go-Live", durationWeeks: 2, budgetPercent: 10, deliverables: "User training, documentation, go-live support", criticalPath: false },
    { name: "Post-Implementation Support", durationWeeks: 3, budgetPercent: 10, deliverables: "Ongoing support, performance monitoring, optimization", criticalPath: false },
  ],
  extended: [
    { name: "Initial Assessment", durationWeeks: 3, budgetPercent: 12, deliverables: "Comprehensive financial review, process audit, gap analysis", criticalPath: true },
    { name: "Strategy Development", durationWeeks: 3, budgetPercent: 15, deliverables: "Strategic recommendations, roadmap creation, stakeholder alignment", criticalPath: true },
    { name: "Phase 1 Implementation", durationWeeks: 4, budgetPercent: 22, deliverables: "Core system setup, initial integrations, foundational processes", criticalPath: true },
    { name: "Phase 2 Implementation", durationWeeks: 4, budgetPercent: 22, deliverables: "Advanced features, custom reporting, workflow automation", criticalPath: true },
    { name: "Testing & Validation", durationWeeks: 2, budgetPercent: 12, deliverables: "Full system testing, data validation, performance testing", criticalPath: false },
    { name: "Training & Rollout", durationWeeks: 2, budgetPercent: 9, deliverables: "Comprehensive training program, phased rollout, change management", criticalPath: false },
    { name: "Optimization & Support", durationWeeks: 4, budgetPercent: 8, deliverables: "Performance optimization, continuous improvement, knowledge transfer", criticalPath: false },
  ],
};

async function main() {
  console.log('🌱 Starting to seed service plans...\n');

  // Get all customers
  const customers = await prisma.customer.findMany();
  if (customers.length === 0) {
    console.error('❌ No customers found. Please seed customers first.');
    return;
  }

  // Get all partners  
  const partners = await prisma.partner.findMany();
  if (partners.length === 0) {
    console.error('❌ No partners found. Please seed partners first.');
    return;
  }

  // Delete existing service plans to start fresh
  await prisma.servicePlan.deleteMany();
  console.log('🗑️  Cleared existing service plans\n');

  const now = new Date();
  
  // Create multiple plans per template to show trend better
  // We'll create 2-3 plans per template, spread across different months
  let planCounter = 0;
  
  for (let i = 0; i < planTemplates.length; i++) {
    const template = planTemplates[i];
    
    // Create 2-3 plans per template
    const plansToCreate = i % 3 === 0 ? 3 : 2;
    
    for (let j = 0; j < plansToCreate; j++) {
      const customer = customers[planCounter % customers.length];
      const partner = partners[planCounter % partners.length];
      
      // Spread plans across 10 months
      // Earlier templates go to earlier months
      const monthsAgo = 10 - Math.floor(planCounter / 2.5);
      const createdDate = new Date(now);
      createdDate.setMonth(createdDate.getMonth() - monthsAgo);
      createdDate.setDate(1 + Math.floor(Math.random() * 20)); // Random day in first 20 days of month
      
      planCounter++;
    
      // Prepare features JSON (same structure as PlanBuilder)
      const planPeriod = {
        durationType: 'FIXED',
        startDate: createdDate.toISOString(),
        endDate: new Date(createdDate.getTime() + template.durationWeeks * 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const session = {
        frequency: 'WEEKLY',
        meetingHoursPerMonth: 8,
        presentMode: 'ONLINE',
      };

      // Get KPIs for this industry
      const industryKPIs = kpiTemplates[template.industry as keyof typeof kpiTemplates] || kpiTemplates.default;
      
      // Get milestones based on duration
      const milestones = template.durationWeeks >= 16 ? milestoneTemplates.extended : milestoneTemplates.standard;

      const features = {
        planType: template.planType,
        branchQty: 1,
        objectives: template.objectives,
        industry: template.industry,
        companySize: template.companySize,
        package: template.package,
        addOns: template.addOns,
        planPeriod,
        session,
        durationType: 'FIXED',
        startDate: createdDate.toISOString(),
        workingDays: 5,
        address: customer.address || '',
        siteType: 'CLIENT_OFFICE',
        accessRequirements: '',
        totalBudget: 100,
        paymentTerms: 'Net 30 days. 50% upfront, remainder on completion.',
        refundPolicy: '30 days written notice required for unused services.',
        upfrontPaymentPct: 25,
        platformCommissionPct: 15,
        partnerCommissionPct: 20,
        payoutDelayDays: 30,
        currentStage: 8,
        totalStages: 8,
        users: [
          {
            id: `user-${planCounter}-1`,
            name: `${customer.name} - CFO`,
            phone: customer.phone || '+971501234567',
          },
        ],
        milestones: milestones.map((m, idx) => ({
          sequence: idx + 1,
          name: m.name,
          description: m.deliverables,
          durationWeeks: m.durationWeeks,
          budgetPercent: m.budgetPercent,
          deliverables: m.deliverables,
          dependencies: idx > 0 ? milestones[idx - 1].name : '',
          criticalPath: m.criticalPath,
        })),
        kpis: industryKPIs.map(k => ({
          kpiCode: k.code,
          kpiName: k.name,
          targetValue: k.target,
          weight: k.weight,
          thresholdGreen: k.thresholdGreen,
          thresholdAmber: k.thresholdAmber,
          thresholdRed: k.thresholdRed,
          calculationSource: 'MANUAL',
          effectiveFrom: createdDate.toISOString(),
          effectiveTo: null,
        })),
        assignments: [
          {
            type: 'SETUP',
            partnerId: partner.id,
            assignmentOwner: 'HQ',
            slaHours: 48,
            priority: 'HIGH',
            dueDate: new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: 'Initial setup and configuration',
          },
          {
            type: 'IMPLEMENTATION',
            partnerId: partner.id,
            assignmentOwner: 'PARTNER',
            slaHours: 72,
            priority: 'MEDIUM',
            dueDate: new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: 'Core implementation phase',
          },
        ],
      };

      const governancePolicy = {
        approvalMode: 'MODE_A',
        notificationChannels: ['EMAIL', 'SMS'],
        reportCadence: 'WEEKLY',
        steeringMeetingCadence: 'Weekly steering call every Monday',
        issueResponseSLA: 24,
        decisionLogRequired: true,
        escalationWorkflow: true,
        escalationContacts: `${customer.name} - CEO, CFO`,
        governanceNotes: 'Standard governance framework with weekly check-ins',
      };

      const erpConnection = {
        type: template.erpType,
        status: 'CONNECTED',
        mappingHealth: 85 + Math.floor(Math.random() * 10),
        lastSync: new Date().toISOString(),
      };

      // Determine status based on plan age (older plans more likely to be completed)
      // Recent plans (last 3 months): mostly ACTIVE
      // Middle plans (4-7 months): mix of ACTIVE and COMPLETED
      // Older plans (8-10 months): mostly COMPLETED
      let status: 'ACTIVE' | 'COMPLETED' | 'INACTIVE';
      if (monthsAgo <= 3) {
        // Recent plans: 80% ACTIVE, 10% COMPLETED, 10% INACTIVE
        const rand = Math.random();
        status = rand < 0.8 ? 'ACTIVE' : rand < 0.9 ? 'COMPLETED' : 'INACTIVE';
      } else if (monthsAgo <= 7) {
        // Middle-age plans: 40% ACTIVE, 50% COMPLETED, 10% INACTIVE
        const rand = Math.random();
        status = rand < 0.4 ? 'ACTIVE' : rand < 0.9 ? 'COMPLETED' : 'INACTIVE';
      } else {
        // Older plans: 20% ACTIVE, 70% COMPLETED, 10% INACTIVE
        const rand = Math.random();
        status = rand < 0.2 ? 'ACTIVE' : rand < 0.9 ? 'COMPLETED' : 'INACTIVE';
      }

      // Create the plan
      const plan = await prisma.servicePlan.create({
        data: {
          customerId: customer.id,
          name: `${template.name} - ${j + 1}`,
          description: template.description,
          type: 'CONSULTING',
          status,
          price: template.price.toString(),
          currency: 'AED',
          duration: template.durationWeeks,
          features: JSON.stringify(features),
          governancePolicy: JSON.stringify(governancePolicy),
          erpConnection: JSON.stringify(erpConnection),
          dataDomains: ['AR (Accounts Receivable)', 'AP (Accounts Payable)', 'GL (General Ledger)'],
          createdAt: createdDate,
          updatedAt: createdDate,
        },
      });

      console.log(`✅ Created plan ${planCounter}/${plansToCreate * planTemplates.length}: "${plan.name}"`);
      console.log(`   📅 Date: ${createdDate.toLocaleDateString()}`);
      console.log(`   👤 Customer: ${customer.name}`);
      console.log(`   💰 Price: ${template.price} AED`);
      console.log(`   📊 Status: ${status}`);
      console.log(`   🎯 KPIs: ${industryKPIs.length}`);
      console.log(`   🏁 Milestones: ${milestones.length}\n`);
    }
  }

  console.log('✨ Successfully seeded service plans with realistic data!\n');
  console.log('📊 Summary:');
  const totalPlans = await prisma.servicePlan.count();
  const activePlans = await prisma.servicePlan.count({ where: { status: 'ACTIVE' } });
  const completedPlans = await prisma.servicePlan.count({ where: { status: 'COMPLETED' } });
  const inactivePlans = await prisma.servicePlan.count({ where: { status: 'INACTIVE' } });
  console.log(`   Total Plans: ${totalPlans}`);
  console.log(`   Active Plans: ${activePlans}`);
  console.log(`   Completed Plans: ${completedPlans}`);
  console.log(`   Inactive Plans: ${inactivePlans}`);
  console.log('\n🎉 Seeding complete! Check your dashboard to see the trends.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

