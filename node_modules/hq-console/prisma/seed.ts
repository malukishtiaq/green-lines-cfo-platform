import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate dates in the past
function getDateMonthsAgo(monthsAgo: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date;
}

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // Clear existing data
  await prisma.servicePlan.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.user.deleteMany({});

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

  // Create Partners (20 partners)
  const partners = await Promise.all([
    // GCC Partners
    prisma.partner.create({
      data: {
        name: 'Dubai Finance Consulting',
        email: 'contact@dubaifinance.com',
        phone: '+971 4 123 4567',
        country: 'UAE',
        city: 'Dubai',
        domain: 'CFO Services',
        role: 'ACCOUNTS',
        remoteOk: true,
        rating: 4.8,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Saudi Business Advisors',
        email: 'info@saudibiz.com',
        phone: '+966 11 456 7890',
        country: 'Saudi Arabia',
        city: 'Riyadh',
        domain: 'Financial Advisory',
        role: 'ACCOUNTS',
        remoteOk: true,
        rating: 4.5,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Kuwait CFO Services',
        email: 'contact@kuwaitcfo.com',
        phone: '+965 2245 6789',
        country: 'Kuwait',
        city: 'Kuwait City',
        domain: 'CFO Services',
        role: 'ACCOUNTS',
        remoteOk: false,
        rating: 4.3,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Qatar Finance Group',
        email: 'info@qatarfg.com',
        phone: '+974 4444 5555',
        country: 'Qatar',
        city: 'Doha',
        domain: 'Financial Consulting',
        role: 'ERP_CONSULTANT',
        remoteOk: true,
        rating: 4.6,
      },
    }),
    // MENA Partners
    prisma.partner.create({
      data: {
        name: 'Cairo Business Solutions',
        email: 'contact@cairobiz.com',
        phone: '+20 2 3456 7890',
        country: 'Egypt',
        city: 'Cairo',
        domain: 'Business Consulting',
        role: 'ERP_CONSULTANT',
        remoteOk: true,
        rating: 4.2,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Jordan Finance Partners',
        email: 'info@jordanfp.com',
        phone: '+962 6 543 2109',
        country: 'Jordan',
        city: 'Amman',
        domain: 'CFO Services',
        role: 'ACCOUNTS',
        remoteOk: false,
        rating: 4.0,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Lebanon Consulting Group',
        email: 'contact@lebcg.com',
        phone: '+961 1 765 432',
        country: 'Lebanon',
        city: 'Beirut',
        domain: 'Management Consulting',
        role: 'ERP_CONSULTANT',
        remoteOk: true,
        rating: 3.9,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Morocco Business Hub',
        email: 'info@morocbiz.com',
        phone: '+212 5 2234 5678',
        country: 'Morocco',
        city: 'Casablanca',
        domain: 'Business Advisory',
        role: 'ERP_CONSULTANT',
        remoteOk: true,
        rating: 4.1,
      },
    }),
    // APAC Partners
    prisma.partner.create({
      data: {
        name: 'Mumbai Finance Advisors',
        email: 'contact@mumbaifa.com',
        phone: '+91 22 1234 5678',
        country: 'India',
        city: 'Mumbai',
        domain: 'CFO Services',
        role: 'ACCOUNTS',
        remoteOk: true,
        rating: 4.7,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Singapore CFO Network',
        email: 'info@sgcfo.com',
        phone: '+65 6789 0123',
        country: 'Singapore',
        city: 'Singapore',
        domain: 'CFO Services',
        role: 'ACCOUNTS',
        remoteOk: true,
        rating: 4.9,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Manila Business Partners',
        email: 'contact@manilabp.com',
        phone: '+63 2 8765 4321',
        country: 'Philippines',
        city: 'Manila',
        domain: 'Business Consulting',
        role: 'ERP_CONSULTANT',
        remoteOk: false,
        rating: 4.0,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Bangkok Finance Group',
        email: 'info@bangkokfg.com',
        phone: '+66 2 345 6789',
        country: 'Thailand',
        city: 'Bangkok',
        domain: 'Financial Advisory',
        role: 'ACCOUNTS',
        remoteOk: true,
        rating: 4.3,
      },
    }),
    // EU Partners
    prisma.partner.create({
      data: {
        name: 'London CFO Services',
        email: 'contact@londoncfo.com',
        phone: '+44 20 7123 4567',
        country: 'United Kingdom',
        city: 'London',
        domain: 'CFO Services',
        role: 'ACCOUNTS',
        remoteOk: true,
        rating: 4.8,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Berlin Business Consultants',
        email: 'info@berlinbc.com',
        phone: '+49 30 1234 5678',
        country: 'Germany',
        city: 'Berlin',
        domain: 'Business Consulting',
        role: 'ERP_CONSULTANT',
        remoteOk: true,
        rating: 4.6,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Paris Finance Partners',
        email: 'contact@parisfp.com',
        phone: '+33 1 4567 8901',
        country: 'France',
        city: 'Paris',
        domain: 'CFO Services',
        role: 'ACCOUNTS',
        remoteOk: true,
        rating: 4.5,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Amsterdam Business Hub',
        email: 'info@amsterdambh.com',
        phone: '+31 20 765 4321',
        country: 'Netherlands',
        city: 'Amsterdam',
        domain: 'Business Advisory',
        role: 'ERP_CONSULTANT',
        remoteOk: false,
        rating: 4.2,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Madrid CFO Network',
        email: 'contact@madridcfo.com',
        phone: '+34 91 234 5678',
        country: 'Spain',
        city: 'Madrid',
        domain: 'CFO Services',
        role: 'ACCOUNTS',
        remoteOk: true,
        rating: 4.4,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Milan Finance Group',
        email: 'info@milanfg.com',
        phone: '+39 02 3456 7890',
        country: 'Italy',
        city: 'Milan',
        domain: 'Financial Consulting',
        role: 'ERP_CONSULTANT',
        remoteOk: false,
        rating: 4.1,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Stockholm Business Partners',
        email: 'contact@stockholmbp.com',
        phone: '+46 8 765 4321',
        country: 'Sweden',
        city: 'Stockholm',
        domain: 'Business Consulting',
        role: 'ERP_CONSULTANT',
        remoteOk: true,
        rating: 4.3,
      },
    }),
    prisma.partner.create({
      data: {
        name: 'Vienna Consulting Services',
        email: 'info@viennacs.com',
        phone: '+43 1 234 5678',
        country: 'Austria',
        city: 'Vienna',
        domain: 'Management Consulting',
        role: 'ERP_CONSULTANT',
        remoteOk: false,
        rating: 4.0,
      },
    }),
  ]);

  console.log(`✅ Created ${partners.length} partners`);

  // Create Customers with varied distribution across regions and time
  const customerData = [
    // GCC Region - 15 customers
    { name: 'Dubai Tech Innovations', email: 'contact@dubaitech.com', country: 'UAE', city: 'Dubai', industry: 'Technology', monthsAgo: 11 },
    { name: 'Abu Dhabi Holdings', email: 'info@abudhabihold.com', country: 'UAE', city: 'Abu Dhabi', industry: 'Finance', monthsAgo: 10 },
    { name: 'Sharjah Manufacturing', email: 'contact@sharjahmfg.com', country: 'UAE', city: 'Sharjah', industry: 'Manufacturing', monthsAgo: 9 },
    { name: 'Dubai Retail Group', email: 'info@dubairetail.com', country: 'UAE', city: 'Dubai', industry: 'Retail', monthsAgo: 8 },
    { name: 'Riyadh Enterprises', email: 'contact@riyadhent.com', country: 'Saudi Arabia', city: 'Riyadh', industry: 'Construction', monthsAgo: 7 },
    { name: 'Jeddah Trading Co', email: 'info@jeddahtrade.com', country: 'Saudi Arabia', city: 'Jeddah', industry: 'Retail', monthsAgo: 6 },
    { name: 'Dammam Industries', email: 'contact@dammamind.com', country: 'Saudi Arabia', city: 'Dammam', industry: 'Manufacturing', monthsAgo: 5 },
    { name: 'Kuwait Investment Corp', email: 'info@kuwaitinv.com', country: 'Kuwait', city: 'Kuwait City', industry: 'Finance', monthsAgo: 4 },
    { name: 'Kuwait Tech Solutions', email: 'contact@kuwaittech.com', country: 'Kuwait', city: 'Kuwait City', industry: 'Technology', monthsAgo: 3 },
    { name: 'Doha Ventures', email: 'info@dohavent.com', country: 'Qatar', city: 'Doha', industry: 'Finance', monthsAgo: 2 },
    { name: 'Qatar Real Estate', email: 'contact@qatarreal.com', country: 'Qatar', city: 'Doha', industry: 'Real Estate', monthsAgo: 1 },
    { name: 'Manama Business Hub', email: 'info@manamabiz.com', country: 'Bahrain', city: 'Manama', industry: 'Finance', monthsAgo: 0 },
    { name: 'Bahrain Tech Park', email: 'contact@bahraintech.com', country: 'Bahrain', city: 'Manama', industry: 'Technology', monthsAgo: 11 },
    { name: 'Muscat Trading', email: 'info@muscattrade.com', country: 'Oman', city: 'Muscat', industry: 'Retail', monthsAgo: 10 },
    { name: 'Oman Manufacturing', email: 'contact@omanmfg.com', country: 'Oman', city: 'Muscat', industry: 'Manufacturing', monthsAgo: 9 },
    
    // MENA Region - 12 customers
    { name: 'Cairo Tech Solutions', email: 'contact@cairotech.com', country: 'Egypt', city: 'Cairo', industry: 'Technology', monthsAgo: 8 },
    { name: 'Alexandria Trading', email: 'info@alextrade.com', country: 'Egypt', city: 'Alexandria', industry: 'Retail', monthsAgo: 7 },
    { name: 'Giza Enterprises', email: 'contact@gizaent.com', country: 'Egypt', city: 'Giza', industry: 'Construction', monthsAgo: 6 },
    { name: 'Amman Business Group', email: 'info@ammanbiz.com', country: 'Jordan', city: 'Amman', industry: 'Finance', monthsAgo: 5 },
    { name: 'Jordan Tech Hub', email: 'contact@jordantech.com', country: 'Jordan', city: 'Amman', industry: 'Technology', monthsAgo: 4 },
    { name: 'Beirut Holdings', email: 'info@beiruthold.com', country: 'Lebanon', city: 'Beirut', industry: 'Finance', monthsAgo: 3 },
    { name: 'Lebanon Manufacturing', email: 'contact@lebanonmfg.com', country: 'Lebanon', city: 'Beirut', industry: 'Manufacturing', monthsAgo: 2 },
    { name: 'Casablanca Ventures', email: 'info@casavent.com', country: 'Morocco', city: 'Casablanca', industry: 'Real Estate', monthsAgo: 1 },
    { name: 'Rabat Tech Solutions', email: 'contact@rabattech.com', country: 'Morocco', city: 'Rabat', industry: 'Technology', monthsAgo: 0 },
    { name: 'Tunis Trading Co', email: 'info@tunistrade.com', country: 'Tunisia', city: 'Tunis', industry: 'Retail', monthsAgo: 11 },
    { name: 'Algiers Business Hub', email: 'contact@algiersbiz.com', country: 'Algeria', city: 'Algiers', industry: 'Construction', monthsAgo: 10 },
    { name: 'Baghdad Enterprises', email: 'info@baghdadent.com', country: 'Iraq', city: 'Baghdad', industry: 'Manufacturing', monthsAgo: 9 },
    
    // APAC Region - 13 customers
    { name: 'Mumbai Tech Innovations', email: 'contact@mumbaitech.com', country: 'India', city: 'Mumbai', industry: 'Technology', monthsAgo: 8 },
    { name: 'Delhi Trading Corp', email: 'info@delhitrade.com', country: 'India', city: 'Delhi', industry: 'Retail', monthsAgo: 7 },
    { name: 'Bangalore Software', email: 'contact@bangaloresoft.com', country: 'India', city: 'Bangalore', industry: 'Technology', monthsAgo: 6 },
    { name: 'Karachi Industries', email: 'info@karachiind.com', country: 'Pakistan', city: 'Karachi', industry: 'Manufacturing', monthsAgo: 5 },
    { name: 'Dhaka Ventures', email: 'contact@dhakavent.com', country: 'Bangladesh', city: 'Dhaka', industry: 'Finance', monthsAgo: 4 },
    { name: 'Manila Tech Hub', email: 'info@manilatech.com', country: 'Philippines', city: 'Manila', industry: 'Technology', monthsAgo: 3 },
    { name: 'Singapore Holdings', email: 'contact@sghold.com', country: 'Singapore', city: 'Singapore', industry: 'Finance', monthsAgo: 2 },
    { name: 'Kuala Lumpur Trading', email: 'info@kltrade.com', country: 'Malaysia', city: 'Kuala Lumpur', industry: 'Retail', monthsAgo: 1 },
    { name: 'Jakarta Business Group', email: 'contact@jakartabiz.com', country: 'Indonesia', city: 'Jakarta', industry: 'Construction', monthsAgo: 0 },
    { name: 'Bangkok Tech Solutions', email: 'info@bangkoktech.com', country: 'Thailand', city: 'Bangkok', industry: 'Technology', monthsAgo: 11 },
    { name: 'Ho Chi Minh Enterprises', email: 'contact@hcment.com', country: 'Vietnam', city: 'Ho Chi Minh City', industry: 'Manufacturing', monthsAgo: 10 },
    { name: 'Shanghai Trading Co', email: 'info@shanghaitrade.com', country: 'China', city: 'Shanghai', industry: 'Retail', monthsAgo: 9 },
    { name: 'Tokyo Ventures', email: 'contact@tokyovent.com', country: 'Japan', city: 'Tokyo', industry: 'Finance', monthsAgo: 8 },
    
    // EU Region - 10 customers
    { name: 'London Tech Innovations', email: 'contact@londontech.com', country: 'United Kingdom', city: 'London', industry: 'Technology', monthsAgo: 7 },
    { name: 'Manchester Trading', email: 'info@manchtrade.com', country: 'United Kingdom', city: 'Manchester', industry: 'Retail', monthsAgo: 6 },
    { name: 'Berlin Software Hub', email: 'contact@berlinsoft.com', country: 'Germany', city: 'Berlin', industry: 'Technology', monthsAgo: 5 },
    { name: 'Munich Industries', email: 'info@munichind.com', country: 'Germany', city: 'Munich', industry: 'Manufacturing', monthsAgo: 4 },
    { name: 'Paris Business Group', email: 'contact@parisbiz.com', country: 'France', city: 'Paris', industry: 'Finance', monthsAgo: 3 },
    { name: 'Rome Trading Co', email: 'info@rometrade.com', country: 'Italy', city: 'Rome', industry: 'Retail', monthsAgo: 2 },
    { name: 'Madrid Ventures', email: 'contact@madridvent.com', country: 'Spain', city: 'Madrid', industry: 'Real Estate', monthsAgo: 1 },
    { name: 'Amsterdam Tech Hub', email: 'info@amsterdamtech.com', country: 'Netherlands', city: 'Amsterdam', industry: 'Technology', monthsAgo: 0 },
    { name: 'Warsaw Enterprises', email: 'contact@warsawent.com', country: 'Poland', city: 'Warsaw', industry: 'Construction', monthsAgo: 11 },
    { name: 'Brussels Holdings', email: 'info@brusselshold.com', country: 'Belgium', city: 'Brussels', industry: 'Finance', monthsAgo: 10 },
  ];

  const customers = [];
  for (const data of customerData) {
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: '+1234567890',
        company: data.name,
        address: `123 Business Street`,
        city: data.city,
        country: data.country,
        industry: data.industry,
        size: 'MEDIUM',
        status: 'ACTIVE',
        notes: `Customer from ${data.city}, ${data.country}`,
      },
    });
    customers.push({ ...customer, monthsAgo: data.monthsAgo });
  }

  console.log(`✅ Created ${customers.length} customers across all regions`);

  // Create Service Plans with realistic distribution
  let totalPlansCreated = 0;
  const serviceTypes = ['BASIC_CFO', 'PREMIUM_CFO', 'ENTERPRISE_CFO', 'CONSULTING'];
  
  for (const customer of customers) {
    // Determine number of plans based on how long ago the customer was created
    let numPlans = 1; // At least 1 plan
    if (customer.monthsAgo > 6) numPlans = 2; // Older customers get 2 plans
    if (customer.monthsAgo > 9) numPlans = 3; // Very old customers get 3 plans
    
    for (let i = 0; i < numPlans; i++) {
      const monthOffset = i * Math.floor(customer.monthsAgo / numPlans);
      const createdDate = getDateMonthsAgo(monthOffset);
      
      // Determine status based on plan age
      let status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' = 'ACTIVE';
      if (monthOffset > 8) {
        status = 'COMPLETED'; // Plans older than 8 months are completed
      } else if (monthOffset < 1) {
        status = 'INACTIVE'; // Recent plans are still inactive
      }
      
      // Select service type based on company industry
      let serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      
      await prisma.servicePlan.create({
        data: {
          name: `${customer.company} - ${status === 'COMPLETED' ? 'Completed' : status === 'INACTIVE' ? 'New' : 'Active'} Plan ${i + 1}`,
          description: `CFO service plan for ${customer.company}`,
          type: serviceType as any,
          status: status as any,
          price: 50000 + Math.floor(Math.random() * 150000),
          currency: 'USD',
          duration: 12, // 12 months
          customerId: customer.id,
          createdAt: createdDate,
          updatedAt: createdDate,
        },
      });
      totalPlansCreated++;
    }
  }

  console.log(`✅ Created ${totalPlansCreated} service plans`);
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Admin users: 1`);
  console.log(`   - Partners: ${partners.length}`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`     • GCC: 15`);
  console.log(`     • MENA: 12`);
  console.log(`     • APAC: 13`);
  console.log(`     • EU: 10`);
  console.log(`   - Service Plans: ${totalPlansCreated}`);
  console.log('');
  console.log('✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
