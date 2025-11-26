// Infrastructure Layer - Database implementations
import { PrismaClient } from '@prisma/client';
import { User, Customer, Task, ServicePlan, CustomerStatus, ServiceType, TaskStatus, Partner, PartnerRole, Contract, ContractTemplate, CompanyProfile } from '../../domain/entities';
import { IUserRepository, ICustomerRepository, ITaskRepository, IServicePlanRepository, IPartnerRepository, IContractRepository, IContractTemplateRepository, ICompanyProfileRepository } from '../../domain/repositories';

// Prisma Client Singleton
export class PrismaService {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient();
    }
    return PrismaService.instance;
  }
}

// User Repository Implementation
export class PrismaUserRepository implements IUserRepository {
  private prisma = PrismaService.getInstance();

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user as User | null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users as User[];
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await this.prisma.user.create({ 
      data: {
        email: userData.email,
        name: userData.name,
        password: userData.password || '', // Default empty password
        role: userData.role,
        avatar: userData.avatar,
        isActive: userData.isActive,
      }
    });
    return user as User;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: userData,
    });
    return user as User;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

// Customer Repository Implementation
export class PrismaCustomerRepository implements ICustomerRepository {
  private prisma = PrismaService.getInstance();

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    return customer as Customer | null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({ where: { email } });
    return customer as Customer | null;
  }

  async findAll(): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany();
    return customers as Customer[];
  }

  async findByStatus(status: string): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany({
      where: { status: status as CustomerStatus },
    });
    return customers as Customer[];
  }

  async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const customer = await this.prisma.customer.create({ 
      data: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        company: customerData.company,
        address: customerData.address,
        city: customerData.city,
        country: customerData.country,
        industry: customerData.industry,
        size: customerData.size,
        status: customerData.status,
        notes: customerData.notes,
      }
    });
    return customer as Customer;
  }

  async update(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const customer = await this.prisma.customer.update({
      where: { id },
      data: customerData,
    });
    return customer as Customer;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({ where: { id } });
  }
}

// Task Repository Implementation
export class PrismaTaskRepository implements ITaskRepository {
  private prisma = PrismaService.getInstance();

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    return task as Task | null;
  }

  async findAll(): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      include: {
        customer: true,
        servicePlan: true,
        createdBy: true,
        updatedBy: true,
      },
    });
    return tasks as Task[];
  }

  async findByCustomerId(customerId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { customerId },
      include: {
        customer: true,
        servicePlan: true,
        createdBy: true,
        updatedBy: true,
      },
    });
    return tasks as Task[];
  }

  async findByStatus(status: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { status: status as TaskStatus },
      include: {
        customer: true,
        servicePlan: true,
        createdBy: true,
        updatedBy: true,
      },
    });
    return tasks as Task[];
  }

  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        assignments: {
          some: {
            userId: assigneeId,
          },
        },
      },
      include: {
        customer: true,
        servicePlan: true,
        createdBy: true,
        updatedBy: true,
      },
    });
    return tasks as Task[];
  }

  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task = await this.prisma.task.create({ 
      data: {
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        completedAt: taskData.completedAt,
        estimatedHours: taskData.estimatedHours,
        actualHours: taskData.actualHours,
        customerId: taskData.customerId,
        servicePlanId: taskData.servicePlanId,
        createdById: taskData.createdById,
        updatedById: taskData.updatedById,
      }
    });
    return task as Task;
  }

  async update(id: string, taskData: Partial<Task>): Promise<Task> {
    const task = await this.prisma.task.update({
      where: { id },
      data: taskData,
    });
    return task as Task;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}

// Service Plan Repository Implementation
export class PrismaServicePlanRepository implements IServicePlanRepository {
  private prisma = PrismaService.getInstance();

  async findById(id: string): Promise<ServicePlan | null> {
    const servicePlan = await this.prisma.servicePlan.findUnique({ where: { id } });
    return servicePlan as ServicePlan | null;
  }

  async findAll(): Promise<ServicePlan[]> {
    const servicePlans = await this.prisma.servicePlan.findMany();
    return servicePlans as ServicePlan[];
  }

  async findByCustomerId(customerId: string): Promise<ServicePlan[]> {
    const servicePlans = await this.prisma.servicePlan.findMany({
      where: { customerId },
    });
    return servicePlans as ServicePlan[];
  }

  async findByType(type: string): Promise<ServicePlan[]> {
    const servicePlans = await this.prisma.servicePlan.findMany({
      where: { type: type as ServiceType },
    });
    return servicePlans as ServicePlan[];
  }

  async create(servicePlanData: Omit<ServicePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServicePlan> {
    const servicePlan = await this.prisma.servicePlan.create({ 
      data: {
        name: servicePlanData.name,
        description: servicePlanData.description,
        type: servicePlanData.type,
        status: servicePlanData.status,
        price: servicePlanData.price,
        currency: servicePlanData.currency,
        duration: servicePlanData.duration,
        features: servicePlanData.features as any,
        customerId: servicePlanData.customerId,
      }
    });
    return servicePlan as ServicePlan;
  }

  async update(id: string, servicePlanData: Partial<ServicePlan>): Promise<ServicePlan> {
    const servicePlan = await this.prisma.servicePlan.update({
      where: { id },
      data: servicePlanData,
    });
    return servicePlan as ServicePlan;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.servicePlan.delete({ where: { id } });
  }
}

// Partner Repository Implementation
export class PrismaPartnerRepository implements IPartnerRepository {
  private prisma = PrismaService.getInstance();

  async findById(id: string): Promise<Partner | null> {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    return partner as Partner | null;
  }

  async findAll(): Promise<Partner[]> {
    const partners = await this.prisma.partner.findMany();
    return partners as Partner[];
  }

  async findByCountry(country: string): Promise<Partner[]> {
    const partners = await this.prisma.partner.findMany({ where: { country } });
    return partners as Partner[];
  }

  async findByDomain(domain: string): Promise<Partner[]> {
    const partners = await this.prisma.partner.findMany({ where: { domain } });
    return partners as Partner[];
  }

  async findByRole(role: string): Promise<Partner[]> {
    const partners = await this.prisma.partner.findMany({ where: { role: role as unknown as PartnerRole } });
    return partners as Partner[];
  }

  async create(partnerData: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Partner> {
    const partner = await this.prisma.partner.create({
      data: {
        name: partnerData.name,
        email: partnerData.email,
        phone: partnerData.phone,
        country: partnerData.country,
        city: partnerData.city,
        address: partnerData.address,
        latitude: partnerData.latitude,
        longitude: partnerData.longitude,
        domain: partnerData.domain,
        role: partnerData.role as unknown as PartnerRole,
        specialties: partnerData.specialties as any,
        rating: partnerData.rating,
        activeEngagements: partnerData.activeEngagements || 0,
        availability: partnerData.availability as any,
        remoteOk: partnerData.remoteOk || false,
        notes: partnerData.notes,
      },
    });
    return partner as Partner;
  }

  async update(id: string, partnerData: Partial<Partner>): Promise<Partner> {
    const partner = await this.prisma.partner.update({
      where: { id },
      data: partnerData as any,
    });
    return partner as Partner;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.partner.delete({ where: { id } });
  }
}

// Company Profile Repository Implementation
export class PrismaCompanyProfileRepository implements ICompanyProfileRepository {
  private prisma = PrismaService.getInstance();

  async findById(id: string): Promise<CompanyProfile | null> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { id } });
    return profile as CompanyProfile | null;
  }

  async findAll(): Promise<CompanyProfile[]> {
    const profiles = await this.prisma.companyProfile.findMany();
    return profiles as CompanyProfile[];
  }

  async findByBrand(brand: string): Promise<CompanyProfile[]> {
    const profiles = await this.prisma.companyProfile.findMany({ where: { brand: brand as any } });
    return profiles as CompanyProfile[];
  }

  async create(profileData: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyProfile> {
    const profile = await this.prisma.companyProfile.create({
      data: profileData as any,
    });
    return profile as CompanyProfile;
  }

  async update(id: string, profileData: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const profile = await this.prisma.companyProfile.update({
      where: { id },
      data: profileData as any,
    });
    return profile as CompanyProfile;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.companyProfile.delete({ where: { id } });
  }
}

// Contract Template Repository Implementation
export class PrismaContractTemplateRepository implements IContractTemplateRepository {
  private prisma = PrismaService.getInstance();

  async findById(id: string): Promise<ContractTemplate | null> {
    const template = await this.prisma.contractTemplate.findUnique({ where: { id } });
    return template as ContractTemplate | null;
  }

  async findAll(): Promise<ContractTemplate[]> {
    const templates = await this.prisma.contractTemplate.findMany();
    return templates as ContractTemplate[];
  }

  async findActiveByType(type: string): Promise<ContractTemplate[]> {
    const templates = await this.prisma.contractTemplate.findMany({
      where: { type: type as any, isActive: true },
    });
    return templates as ContractTemplate[];
  }

  async create(templateData: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate> {
    const template = await this.prisma.contractTemplate.create({
      data: {
        name: templateData.name,
        type: templateData.type as any,
        language: templateData.language,
        industry: templateData.industry,
        brand: templateData.brand as any,
        defaultContent: templateData.defaultContent,
        variables: templateData.variables as any,
        isActive: templateData.isActive,
      },
    });
    return template as ContractTemplate;
  }

  async update(id: string, templateData: Partial<ContractTemplate>): Promise<ContractTemplate> {
    const template = await this.prisma.contractTemplate.update({
      where: { id },
      data: templateData as any,
    });
    return template as ContractTemplate;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contractTemplate.delete({ where: { id } });
  }
}

// Contract Repository Implementation
export class PrismaContractRepository implements IContractRepository {
  private prisma = PrismaService.getInstance();

  async findById(id: string): Promise<Contract | null> {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    return contract as Contract | null;
  }

  async findAll(): Promise<Contract[]> {
    const contracts = await this.prisma.contract.findMany();
    return contracts as Contract[];
  }

  async findByStatus(status: string): Promise<Contract[]> {
    const contracts = await this.prisma.contract.findMany({ where: { status: status as any } });
    return contracts as Contract[];
  }

  async create(contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const contract = await this.prisma.contract.create({
      data: {
        type: contractData.type as any,
        status: contractData.status as any,
        language: contractData.language,
        industry: contractData.industry,
        variables: contractData.variables as any,
        generatedContent: contractData.generatedContent,
        pdfPath: contractData.pdfPath,
        aiProvider: contractData.aiProvider as any,
        sentAt: contractData.sentAt,
        signedAt: contractData.signedAt,
        templateId: contractData.templateId,
        senderCompanyId: contractData.senderCompanyId,
        customerId: contractData.customerId,
        recipientEmail: contractData.recipientEmail,
        recipientName: contractData.recipientName,
        createdById: contractData.createdById,
      },
    });
    return contract as Contract;
  }

  async update(id: string, contractData: Partial<Contract>): Promise<Contract> {
    const contract = await this.prisma.contract.update({
      where: { id },
      data: contractData as any,
    });
    return contract as Contract;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contract.delete({ where: { id } });
  }
}
