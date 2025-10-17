// Application Use Cases - Business logic implementation
import { User, Customer, Task, ServicePlan, TaskStatus, Priority } from '../../domain/entities';
import { IUserRepository, ICustomerRepository, ITaskRepository, IServicePlanRepository } from '../../domain/repositories';

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
