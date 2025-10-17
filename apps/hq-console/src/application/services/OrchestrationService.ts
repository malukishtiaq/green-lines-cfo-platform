// Application Services - Use Case Orchestration
import { Customer, ServicePlan, Task, TaskStatus, Priority } from '../../domain/entities';
import { ICustomerRepository, IServicePlanRepository, ITaskRepository } from '../../domain/repositories';
import { ValidationService, CalculationService, BusinessRuleService } from '../../domain/services';
import { EmailService, PaymentService, NotificationService, AuditService } from '../../infrastructure/services';

export class TransactionService {
  constructor(
    private customerRepository: ICustomerRepository,
    private servicePlanRepository: IServicePlanRepository,
    private taskRepository: ITaskRepository,
    private paymentService: PaymentService,
    private emailService: EmailService,
    private auditService: AuditService
  ) {}

  // Complex business transaction - Create customer with service plan
  async createCustomerWithServicePlan(
    customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
    servicePlanData: Omit<ServicePlan, 'id' | 'createdAt' | 'updatedAt' | 'customerId'>
  ): Promise<{ customer: Customer; servicePlan: ServicePlan }> {
    try {
      console.log('🔄 Starting customer onboarding transaction...');

      // Validate customer data
      if (!ValidationService.isValidEmail(customerData.email)) {
        throw new Error('Invalid email address');
      }

      if (customerData.phone && !ValidationService.isValidPhoneNumber(customerData.phone)) {
        throw new Error('Invalid phone number');
      }

      // Create customer
      const customer = await this.customerRepository.create(customerData);
      console.log(`✅ Customer created: ${customer.id}`);

      // Calculate service plan price
      const calculatedPrice = CalculationService.calculateServicePlanPrice(
        servicePlanData.price || 0,
        servicePlanData.duration || 12,
        Object.keys(servicePlanData.features || {})
      );

      // Create service plan
      const servicePlan = await this.servicePlanRepository.create({
        ...servicePlanData,
        customerId: customer.id,
        price: calculatedPrice,
      });
      console.log(`✅ Service plan created: ${servicePlan.id}`);

      // Create initial tasks
      const initialTasks = await this.createInitialTasks(customer.id, servicePlan.id);
      console.log(`✅ Initial tasks created: ${initialTasks.length}`);

      // Process payment if required
      if (servicePlan.price && servicePlan.price > 0) {
        await this.paymentService.processPayment({
          customerId: customer.id,
          amount: servicePlan.price,
          servicePlanId: servicePlan.id,
        });
        console.log(`✅ Payment processed: $${servicePlan.price}`);
      }

      // Send welcome email
      await this.emailService.sendWelcomeEmail(customer.email, {
        customerName: customer.name || 'Valued Customer',
        servicePlanName: servicePlan.name,
      });

      // Log audit event
      await this.auditService.logEvent({
        userId: 'system',
        action: 'CUSTOMER_ONBOARDED',
        entityType: 'Customer',
        entityId: customer.id,
        details: { servicePlanId: servicePlan.id },
      });

      console.log('🎉 Customer onboarding transaction completed successfully!');
      return { customer, servicePlan };
    } catch (error) {
      console.error('❌ Customer onboarding transaction failed:', error);
      throw error;
    }
  }

  private async createInitialTasks(customerId: string, servicePlanId: string): Promise<Task[]> {
    const initialTasks = [
      {
        title: 'Initial Setup',
        description: 'Set up customer account and service plan configuration',
        customerId,
        servicePlanId,
        priority: Priority.HIGH,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
      },
      {
        title: 'Welcome Call',
        description: 'Schedule and conduct welcome call with customer',
        customerId,
        servicePlanId,
        priority: Priority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
      },
      {
        title: 'Document Collection',
        description: 'Collect necessary documents from customer',
        customerId,
        servicePlanId,
        priority: Priority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      },
    ];

    return Promise.all(
      initialTasks.map(task => this.taskRepository.create(task))
    );
  }
}

export class IntegrationService {
  constructor(
    private emailService: EmailService,
    private notificationService: NotificationService,
    private auditService: AuditService,
    private taskRepository: ITaskRepository,
    private customerRepository: ICustomerRepository
  ) {}

  // Orchestrate task completion workflow
  async completeTask(task: Task, completedBy: string): Promise<void> {
    try {
      console.log(`🔄 Completing task: ${task.title}`);

      // Validate task can be completed
      if (!ValidationService.canCompleteTask(task, completedBy)) {
        throw new Error('Task cannot be completed by this user');
      }

      // Update task status
      const updatedTask = await this.taskRepository.update(task.id, {
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
        completedBy,
      });
      console.log(`✅ Task completed: ${task.id}`);

      // Notify customer
      const customer = await this.customerRepository.findById(task.customerId);
      if (customer) {
        await this.emailService.sendTaskCompletionEmail(customer.email, {
          customerName: customer.name || 'Valued Customer',
          taskTitle: task.title,
          completedBy,
        });
      }

      // Log audit event
      await this.auditService.logEvent({
        userId: completedBy,
        action: 'TASK_COMPLETED',
        entityType: 'Task',
        entityId: task.id,
        details: { customerId: task.customerId },
      });

      // Check if all tasks for service plan are completed
      const remainingTasks = await this.taskRepository.findByServicePlan(task.servicePlanId);
      const pendingTasks = remainingTasks.filter(t => t.status === TaskStatus.PENDING);
      
      if (pendingTasks.length === 0 && customer) {
        // All tasks completed, notify customer
        await this.emailService.sendServiceCompletionEmail(customer.email, {
          customerName: customer.name || 'Valued Customer',
          servicePlanName: task.servicePlanId,
        });

        // Notify admin
        await this.notificationService.notifyAdmin({
          type: 'SERVICE_PLAN_COMPLETED',
          message: `Service plan ${task.servicePlanId} completed for customer ${customer.name}`,
          data: { customerId: customer.id, servicePlanId: task.servicePlanId },
        });
      }

      console.log('🎉 Task completion workflow completed successfully!');
    } catch (error) {
      console.error('❌ Task completion workflow failed:', error);
      throw error;
    }
  }

  // Orchestrate customer onboarding
  async onboardCustomer(customer: Customer, servicePlan: ServicePlan): Promise<void> {
    try {
      console.log(`🔄 Onboarding customer: ${customer.name}`);

      // Send welcome email
      await this.emailService.sendWelcomeEmail(customer.email, {
        customerName: customer.name || 'Valued Customer',
        servicePlanName: servicePlan.name,
      });

      // Send SMS notification if phone provided
      if (customer.phone) {
        await this.notificationService.sendSMS(customer.phone, 
          `Welcome to Green Lines CFO! Your service plan ${servicePlan.name} is now active.`
        );
      }

      // Notify admin
      await this.notificationService.notifyAdmin({
        type: 'CUSTOMER_ONBOARDED',
        message: `New customer ${customer.name} has been onboarded`,
        data: { customerId: customer.id, servicePlanId: servicePlan.id },
      });

      // Log audit event
      await this.auditService.logEvent({
        userId: 'system',
        action: 'CUSTOMER_ONBOARDED',
        entityType: 'Customer',
        entityId: customer.id,
        details: { servicePlanId: servicePlan.id },
      });

      console.log('🎉 Customer onboarding completed successfully!');
    } catch (error) {
      console.error('❌ Customer onboarding failed:', error);
      throw error;
    }
  }
}

export class OrchestrationService {
  constructor(
    private transactionService: TransactionService,
    private integrationService: IntegrationService,
    private auditService: AuditService
  ) {}

  // High-level business process orchestration
  async processCustomerOnboarding(
    customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
    servicePlanData: Omit<ServicePlan, 'id' | 'createdAt' | 'updatedAt' | 'customerId'>
  ): Promise<{ customer: Customer; servicePlan: ServicePlan }> {
    try {
      console.log('🚀 Starting customer onboarding process...');

      // Step 1: Create customer and service plan
      const { customer, servicePlan } = await this.transactionService.createCustomerWithServicePlan(
        customerData,
        servicePlanData
      );

      // Step 2: Onboard customer
      await this.integrationService.onboardCustomer(customer, servicePlan);

      // Step 3: Log process completion
      await this.auditService.logEvent({
        userId: 'system',
        action: 'ONBOARDING_PROCESS_COMPLETED',
        entityType: 'Customer',
        entityId: customer.id,
        details: { servicePlanId: servicePlan.id },
      });

      console.log('🎉 Customer onboarding process completed successfully!');
      return { customer, servicePlan };
    } catch (error) {
      console.error('❌ Customer onboarding process failed:', error);
      throw error;
    }
  }

  // Process task assignment and notification
  async assignTaskToAgent(
    task: Task,
    agentId: string,
    assignedBy: string
  ): Promise<void> {
    try {
      console.log(`🔄 Assigning task ${task.title} to agent ${agentId}`);

      // Update task assignment
      const updatedTask = await this.taskRepository.update(task.id, {
        assignments: [
          ...(task.assignments || []),
          {
            userId: agentId,
            assignedAt: new Date(),
            assignedBy,
          },
        ],
        status: TaskStatus.IN_PROGRESS,
      });

      // Notify agent
      await this.notificationService.sendPushNotification(
        agentId,
        'New Task Assigned',
        `You have been assigned a new task: ${task.title}`
      );

      // Log audit event
      await this.auditService.logEvent({
        userId: assignedBy,
        action: 'TASK_ASSIGNED',
        entityType: 'Task',
        entityId: task.id,
        details: { assignedTo: agentId },
      });

      console.log('✅ Task assignment completed successfully!');
    } catch (error) {
      console.error('❌ Task assignment failed:', error);
      throw error;
    }
  }
}
