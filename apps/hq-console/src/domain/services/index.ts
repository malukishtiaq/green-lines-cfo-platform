// Domain Services - Pure Business Logic
import { Customer, CustomerStatus, ServicePlan, ServiceStatus, Task, TaskStatus, Priority } from '../entities';

export class ValidationService {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength validation
  static isStrongPassword(password: string): boolean {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
  }

  // Phone number validation
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  // Business rule validation
  static canCreateTask(customer: Customer, servicePlan: ServicePlan): boolean {
    return customer.status === CustomerStatus.ACTIVE && 
           servicePlan.status === ServiceStatus.ACTIVE;
  }

  // Financial validation
  static isValidAmount(amount: number): boolean {
    return amount > 0 && amount <= 1000000; // Max 1M
  }

  // Task validation
  static canCompleteTask(task: Task, userId: string): boolean {
    return task.status === TaskStatus.IN_PROGRESS && 
           task.assignments?.some(assignment => assignment.userId === userId);
  }

  // Service plan validation
  static canModifyServicePlan(servicePlan: ServicePlan): boolean {
    return servicePlan.status === ServiceStatus.ACTIVE;
  }
}

export class CalculationService {
  // Calculate service plan pricing
  static calculateServicePlanPrice(
    basePrice: number,
    duration: number,
    features: string[]
  ): number {
    let totalPrice = basePrice;
    
    // Duration multiplier
    if (duration > 12) {
      totalPrice *= 0.9; // 10% discount for yearly
    } else if (duration > 6) {
      totalPrice *= 0.95; // 5% discount for 6+ months
    }
    
    // Feature pricing
    const featurePricing: Record<string, number> = {
      'premium_support': 50,
      'advanced_analytics': 100,
      'custom_integrations': 200,
      'priority_support': 75,
      'dedicated_manager': 150,
    };
    
    features.forEach(feature => {
      totalPrice += featurePricing[feature] || 0;
    });
    
    return Math.round(totalPrice * 100) / 100; // Round to 2 decimals
  }

  // Calculate task completion rate
  static calculateCompletionRate(
    completedTasks: number,
    totalTasks: number
  ): number {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  // Calculate customer satisfaction score
  static calculateSatisfactionScore(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  // Calculate workload for agent
  static calculateAgentWorkload(assignedTasks: Task[]): {
    totalTasks: number;
    highPriorityTasks: number;
    overdueTasks: number;
    workloadScore: number;
  } {
    const now = new Date();
    const totalTasks = assignedTasks.length;
    const highPriorityTasks = assignedTasks.filter(
      task => task.priority === Priority.HIGH || task.priority === Priority.URGENT
    ).length;
    const overdueTasks = assignedTasks.filter(
      task => task.dueDate && task.dueDate < now && task.status !== TaskStatus.COMPLETED
    ).length;

    // Calculate workload score (0-100)
    let workloadScore = 0;
    workloadScore += totalTasks * 2; // Base score
    workloadScore += highPriorityTasks * 5; // High priority penalty
    workloadScore += overdueTasks * 10; // Overdue penalty

    return {
      totalTasks,
      highPriorityTasks,
      overdueTasks,
      workloadScore: Math.min(workloadScore, 100),
    };
  }

  // Calculate service plan ROI
  static calculateServicePlanROI(
    servicePlan: ServicePlan,
    customerLifetimeValue: number,
    acquisitionCost: number
  ): number {
    if (!servicePlan.price) return 0;
    
    const monthlyRevenue = servicePlan.price;
    const duration = servicePlan.duration || 12;
    const totalRevenue = monthlyRevenue * duration;
    
    return Math.round(((totalRevenue - acquisitionCost) / acquisitionCost) * 100);
  }
}

export class BusinessRuleService {
  // Determine task priority based on customer tier
  static determineTaskPriority(
    customerTier: string,
    taskType: string,
    urgency: 'low' | 'medium' | 'high'
  ): Priority {
    const priorityMatrix: Record<string, Record<string, Priority>> = {
      'premium': {
        'low': Priority.MEDIUM,
        'medium': Priority.HIGH,
        'high': Priority.URGENT,
      },
      'standard': {
        'low': Priority.LOW,
        'medium': Priority.MEDIUM,
        'high': Priority.HIGH,
      },
      'basic': {
        'low': Priority.LOW,
        'medium': Priority.LOW,
        'high': Priority.MEDIUM,
      },
    };

    return priorityMatrix[customerTier]?.[urgency] || Priority.MEDIUM;
  }

  // Determine if customer qualifies for premium support
  static qualifiesForPremiumSupport(customer: Customer, servicePlan: ServicePlan): boolean {
    return servicePlan.type === 'PREMIUM' || 
           (customer.createdAt && 
            new Date().getTime() - customer.createdAt.getTime() > 365 * 24 * 60 * 60 * 1000); // 1 year
  }

  // Determine task assignment based on workload
  static shouldAssignTaskToAgent(
    agentWorkload: number,
    taskPriority: Priority,
    agentSpecialization: string[]
  ): boolean {
    // Don't assign if agent is overloaded
    if (agentWorkload > 80) return false;
    
    // Always assign urgent tasks
    if (taskPriority === Priority.URGENT) return true;
    
    // Don't assign high priority tasks to overloaded agents
    if (taskPriority === Priority.HIGH && agentWorkload > 60) return false;
    
    return true;
  }
}
