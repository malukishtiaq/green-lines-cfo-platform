// Example: Complete Use Case with Services
// This shows how to use all services together in a business use case

import { Customer, ServicePlan, Task, TaskStatus, Priority } from '../../domain/entities';
import { ICustomerRepository, IServicePlanRepository, ITaskRepository } from '../../domain/repositories';
import { ServiceFactory } from '../index';

export class CreateCustomerWithServicePlanUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private servicePlanRepository: IServicePlanRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(
    customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
    servicePlanData: Omit<ServicePlan, 'id' | 'createdAt' | 'updatedAt' | 'customerId'>
  ): Promise<{ customer: Customer; servicePlan: ServicePlan; tasks: Task[] }> {
    try {
      console.log('🚀 Starting customer onboarding use case...');

      // 1. Domain Service - Validation
      const validationService = ServiceFactory.getValidationService();
      
      if (!validationService.isValidEmail(customerData.email)) {
        throw new Error('Invalid email address');
      }

      if (customerData.phone && !validationService.isValidPhoneNumber(customerData.phone)) {
        throw new Error('Invalid phone number');
      }

      if (servicePlanData.price && !validationService.isValidAmount(servicePlanData.price)) {
        throw new Error('Invalid service plan amount');
      }

      // 2. Domain Service - Calculation
      const calculationService = ServiceFactory.getCalculationService();
      
      const calculatedPrice = calculationService.calculateServicePlanPrice(
        servicePlanData.price || 0,
        servicePlanData.duration || 12,
        Object.keys(servicePlanData.features || {})
      );

      // 3. Application Service - Transaction Management
      const transactionService = ServiceFactory.getTransactionService();
      
      const { customer, servicePlan } = await transactionService.createCustomerWithServicePlan(
        customerData,
        { ...servicePlanData, price: calculatedPrice }
      );

      // 4. Application Service - Integration
      const integrationService = ServiceFactory.getIntegrationService();
      
      await integrationService.onboardCustomer(customer, servicePlan);

      // 5. Get created tasks
      const tasks = await this.taskRepository.findByServicePlan(servicePlan.id);

      // 6. Infrastructure Service - Audit Logging
      const auditService = ServiceFactory.getAuditService();
      
      await auditService.logEvent({
        userId: 'system',
        action: 'CUSTOMER_ONBOARDED_VIA_USE_CASE',
        entityType: 'Customer',
        entityId: customer.id,
        details: { 
          servicePlanId: servicePlan.id,
          taskCount: tasks.length,
          calculatedPrice,
        },
      });

      console.log('✅ Customer onboarding use case completed successfully!');
      return { customer, servicePlan, tasks };
    } catch (error) {
      console.error('❌ Customer onboarding use case failed:', error);
      throw error;
    }
  }
}

// Example: Task Management Use Case with Services
export class CompleteTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private customerRepository: ICustomerRepository
  ) {}

  async execute(taskId: string, completedBy: string): Promise<Task> {
    try {
      console.log(`🔄 Completing task ${taskId} by ${completedBy}`);

      // 1. Get task
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // 2. Domain Service - Validation
      const validationService = ServiceFactory.getValidationService();
      
      if (!validationService.canCompleteTask(task, completedBy)) {
        throw new Error('Task cannot be completed by this user');
      }

      // 3. Application Service - Integration (handles the complete workflow)
      const integrationService = ServiceFactory.getIntegrationService();
      
      await integrationService.completeTask(task, completedBy);

      // 4. Get updated task
      const updatedTask = await this.taskRepository.findById(taskId);
      if (!updatedTask) {
        throw new Error('Task not found after completion');
      }

      console.log('✅ Task completion use case completed successfully!');
      return updatedTask;
    } catch (error) {
      console.error('❌ Task completion use case failed:', error);
      throw error;
    }
  }
}

// Example: Service Plan Management Use Case with Services
export class CreateServicePlanUseCase {
  constructor(
    private servicePlanRepository: IServicePlanRepository,
    private customerRepository: ICustomerRepository
  ) {}

  async execute(
    servicePlanData: Omit<ServicePlan, 'id' | 'createdAt' | 'updatedAt' | 'customerId'>,
    customerId: string
  ): Promise<ServicePlan> {
    try {
      console.log(`🔄 Creating service plan for customer ${customerId}`);

      // 1. Get customer
      const customer = await this.customerRepository.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // 2. Domain Service - Validation
      const validationService = ServiceFactory.getValidationService();
      
      if (servicePlanData.price && !validationService.isValidAmount(servicePlanData.price)) {
        throw new Error('Invalid service plan amount');
      }

      // 3. Domain Service - Calculation
      const calculationService = ServiceFactory.getCalculationService();
      
      const calculatedPrice = calculationService.calculateServicePlanPrice(
        servicePlanData.price || 0,
        servicePlanData.duration || 12,
        Object.keys(servicePlanData.features || {})
      );

      // 4. Domain Service - Business Rules
      const businessRuleService = ServiceFactory.getBusinessRuleService();
      
      const qualifiesForPremium = businessRuleService.qualifiesForPremiumSupport(
        customer,
        { ...servicePlanData, customerId }
      );

      // 5. Create service plan
      const servicePlan = await this.servicePlanRepository.create({
        ...servicePlanData,
        customerId,
        price: calculatedPrice,
        features: {
          ...servicePlanData.features,
          premium_support: qualifiesForPremium,
        },
      });

      // 6. Infrastructure Service - Email Notification
      const emailService = ServiceFactory.getEmailService();
      
      await emailService.sendWelcomeEmail(customer.email, {
        customerName: customer.name || 'Valued Customer',
        servicePlanName: servicePlan.name,
      });

      // 7. Infrastructure Service - Audit Logging
      const auditService = ServiceFactory.getAuditService();
      
      await auditService.logEvent({
        userId: 'system',
        action: 'SERVICE_PLAN_CREATED',
        entityType: 'ServicePlan',
        entityId: servicePlan.id,
        details: { 
          customerId,
          calculatedPrice,
          qualifiesForPremium,
        },
      });

      console.log('✅ Service plan creation use case completed successfully!');
      return servicePlan;
    } catch (error) {
      console.error('❌ Service plan creation use case failed:', error);
      throw error;
    }
  }
}

// Example: Dashboard Analytics Use Case with Services
export class GetDashboardAnalyticsUseCase {
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
    revenue: number;
    averageTaskDuration: number;
  }> {
    try {
      console.log('📊 Generating dashboard analytics...');

      // 1. Get all data
      const customers = await this.customerRepository.findAll();
      const tasks = await this.taskRepository.findAll();
      const servicePlans = await this.servicePlanRepository.findAll();

      // 2. Domain Service - Calculations
      const calculationService = ServiceFactory.getCalculationService();
      
      const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
      const pendingTasks = tasks.filter(task => task.status === TaskStatus.PENDING);
      
      const taskCompletionRate = calculationService.calculateCompletionRate(
        completedTasks.length,
        tasks.length
      );

      // 3. Calculate revenue
      const revenue = servicePlans.reduce((total, plan) => {
        return total + (plan.price || 0);
      }, 0);

      // 4. Calculate average task duration (mock data)
      const averageTaskDuration = 5.2; // days

      // 5. Calculate customer satisfaction (mock data)
      const customerSatisfaction = 4.6; // out of 5

      // 6. Infrastructure Service - Audit Logging
      const auditService = ServiceFactory.getAuditService();
      
      await auditService.logEvent({
        userId: 'system',
        action: 'DASHBOARD_ANALYTICS_GENERATED',
        entityType: 'Dashboard',
        entityId: 'analytics',
        details: { 
          totalCustomers: customers.length,
          totalTasks: tasks.length,
          totalServicePlans: servicePlans.length,
        },
      });

      const analytics = {
        totalCustomers: customers.length,
        activeServicePlans: servicePlans.filter(plan => plan.status === 'ACTIVE').length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        taskCompletionRate,
        customerSatisfaction,
        revenue,
        averageTaskDuration,
      };

      console.log('✅ Dashboard analytics generated successfully!');
      return analytics;
    } catch (error) {
      console.error('❌ Dashboard analytics generation failed:', error);
      throw error;
    }
  }
}
