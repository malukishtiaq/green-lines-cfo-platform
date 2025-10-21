// Application Use Cases - Business logic implementation
import { User, Customer, Task, ServicePlan, TaskStatus, Priority, Partner, Contract, ContractType, ContractStatus } from '../../domain/entities';
import { IUserRepository, ICustomerRepository, ITaskRepository, IServicePlanRepository, IPartnerRepository, IContractRepository, IContractTemplateRepository, ICompanyProfileRepository } from '../../domain/repositories';
import { AIContentService, PDFService, ContractEmailService } from '../../infrastructure/services';

// Dashboard Use Cases
export class GetDashboardStatsUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private taskRepository: ITaskRepository,
    private servicePlanRepository: IServicePlanRepository
  ) {}

  async execute(): Promise<{
    totalCustomers: number;
    activeServicePlans: number;
    completedTasks: number;
    pendingTasks: number;
    taskCompletionRate: number;
    customerSatisfaction: number;
  }> {
    const [customers, tasks, servicePlans] = await Promise.all([
      this.customerRepository.findAll(),
      this.taskRepository.findAll(),
      this.servicePlanRepository.findAll(),
    ]);

    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const pendingTasks = tasks.filter(task => task.status === TaskStatus.PENDING).length;
    const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return {
      totalCustomers: customers.length,
      activeServicePlans: servicePlans.filter(plan => plan.status === 'ACTIVE').length,
      completedTasks,
      pendingTasks,
      taskCompletionRate: Math.round(taskCompletionRate),
      customerSatisfaction: 92, // Mock data for now
    };
  }
}

// Customer Use Cases
export class CreateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    // Business logic validation
    if (!customerData.email || !customerData.name) {
      throw new Error('Email and name are required');
    }

    // Check if customer already exists
    const existingCustomer = await this.customerRepository.findByEmail(customerData.email);
    if (existingCustomer) {
      throw new Error('Customer with this email already exists');
    }

    return this.customerRepository.create(customerData);
  }
}

export class GetCustomersUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(status?: string): Promise<Customer[]> {
    if (status) {
      return this.customerRepository.findByStatus(status);
    }
    return this.customerRepository.findAll();
  }
}

// Task Use Cases
export class CreateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private customerRepository: ICustomerRepository
  ) {}

  async execute(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    // Validate customer exists
    const customer = await this.customerRepository.findById(taskData.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Business logic validation
    if (!taskData.title) {
      throw new Error('Task title is required');
    }

    return this.taskRepository.create(taskData);
  }
}

export class UpdateTaskStatusUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, status: TaskStatus, updatedById: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const updateData: Partial<Task> = {
      status,
      updatedById,
    };

    // If completing task, set completion date
    if (status === TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    return this.taskRepository.update(taskId, updateData);
  }
}

export class GetTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(filters?: {
    customerId?: string;
    status?: string;
    assigneeId?: string;
  }): Promise<Task[]> {
    if (filters?.customerId) {
      return this.taskRepository.findByCustomerId(filters.customerId);
    }
    if (filters?.status) {
      return this.taskRepository.findByStatus(filters.status);
    }
    if (filters?.assigneeId) {
      return this.taskRepository.findByAssigneeId(filters.assigneeId);
    }
    return this.taskRepository.findAll();
  }
}

// User Use Cases
export class AuthenticateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    // Password validation would be handled by the infrastructure layer
    // This is just the business logic
    return user;
  }
}

// Partner Use Cases
export class CreatePartnerUseCase {
  constructor(private partnerRepository: IPartnerRepository) {}

  async execute(partnerData: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Partner> {
    if (!partnerData.name || !partnerData.country || !partnerData.domain || !partnerData.role) {
      throw new Error('Name, country, domain, and role are required');
    }
    return this.partnerRepository.create(partnerData);
  }
}

export class GetPartnersUseCase {
  constructor(private partnerRepository: IPartnerRepository) {}

  async execute(filters?: { country?: string; domain?: string; role?: string }): Promise<Partner[]> {
    if (filters?.country) return this.partnerRepository.findByCountry(filters.country);
    if (filters?.domain) return this.partnerRepository.findByDomain(filters.domain);
    if (filters?.role) return this.partnerRepository.findByRole(filters.role);
    return this.partnerRepository.findAll();
  }
}

export class UpdatePartnerUseCase {
  constructor(private partnerRepository: IPartnerRepository) {}

  async execute(id: string, data: Partial<Partner>): Promise<Partner> {
    return this.partnerRepository.update(id, data);
  }
}

export class DeletePartnerUseCase {
  constructor(private partnerRepository: IPartnerRepository) {}

  async execute(id: string): Promise<void> {
    return this.partnerRepository.delete(id);
  }
}

// Contracts Use Cases
export class GenerateContractUseCase {
  constructor(
    private contractRepo: IContractRepository,
    private templateRepo: IContractTemplateRepository,
    private companyRepo: ICompanyProfileRepository,
    private aiService: AIContentService,
    private pdfService: PDFService
  ) {}

  async execute(input: {
    templateId: string;
    senderCompanyId: string;
    recipientEmail: string;
    recipientName?: string;
    customerId?: string;
    type: ContractType;
    language: 'en' | 'ar';
    industry?: string;
    variables: Record<string, unknown>;
    aiProvider: 'OPENAI' | 'GEMINI' | 'ANTHROPIC' | 'CUSTOM';
    createdById: string;
  }): Promise<Contract> {
    const [template, company] = await Promise.all([
      this.templateRepo.findById(input.templateId),
      this.companyRepo.findById(input.senderCompanyId),
    ]);
    if (!template) throw new Error('Template not found');
    if (!company) throw new Error('Company profile not found');

    const content = await this.aiService.generateContractContent({
      provider: input.aiProvider,
      template: template.defaultContent,
      variables: input.variables,
      language: input.language,
      industry: input.industry,
    });

    const pdfBytes = await this.pdfService.renderHtmlToPdf(content);
    const pdfPath = await this.pdfService.savePdf(pdfBytes, `${input.type.toLowerCase()}_${Date.now()}.pdf`);

    const contract = await this.contractRepo.create({
      id: '' as any, // ignored by repo implementation
      type: input.type,
      status: ContractStatus.GENERATED,
      language: input.language,
      industry: input.industry,
      variables: input.variables,
      generatedContent: content,
      pdfPath,
      aiProvider: input.aiProvider as any,
      sentAt: undefined,
      signedAt: undefined,
      templateId: input.templateId,
      senderCompanyId: input.senderCompanyId,
      customerId: input.customerId,
      recipientEmail: input.recipientEmail,
      recipientName: input.recipientName,
      createdById: input.createdById,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    } as any);

    return contract;
  }
}

export class SendContractUseCase {
  constructor(
    private contractRepo: IContractRepository,
    private emailService: ContractEmailService
  ) {}

  async execute(contractId: string, emailData?: { subject?: string; body?: string }): Promise<Contract> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new Error('Contract not found');
    if (!contract.pdfPath) throw new Error('Contract PDF not generated');

    const pdfUrl = contract.pdfPath || '';
    await this.emailService.sendContractEmail(contract.recipientEmail, {
      recipientName: contract.recipientName || 'Customer',
      contractType: String(contract.type),
      pdfUrl,
    });

    const updated = await this.contractRepo.update(contract.id, {
      status: ContractStatus.SENT,
      sentAt: new Date(),
    });
    return updated;
  }
}
