// Application Services - Cross-cutting concerns and orchestration
import { User, Customer, Task } from '../../domain/entities';
import { IUserRepository, ICustomerRepository, ITaskRepository } from '../../domain/repositories';

export class NotificationService {
  async sendTaskAssignmentNotification(task: Task, assigneeEmail: string): Promise<void> {
    // Email notification logic
    console.log(`Sending task assignment notification to ${assigneeEmail} for task: ${task.title}`);
    // In real implementation, this would integrate with email service
  }

  async sendTaskCompletionNotification(task: Task, customerEmail: string): Promise<void> {
    console.log(`Sending task completion notification to ${customerEmail} for task: ${task.title}`);
  }
}

export class AuditService {
  async logUserAction(userId: string, action: string, details: Record<string, unknown>): Promise<void> {
    console.log(`Audit log: User ${userId} performed ${action}`, details);
    // In real implementation, this would write to audit log
  }

  async logTaskStatusChange(taskId: string, oldStatus: string, newStatus: string, userId: string): Promise<void> {
    console.log(`Task ${taskId} status changed from ${oldStatus} to ${newStatus} by user ${userId}`);
  }
}

export class ValidationService {
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  }

  validateTaskData(taskData: Partial<Task>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!taskData.title || taskData.title.trim().length === 0) {
      errors.push('Task title is required');
    }

    if (taskData.title && taskData.title.length > 200) {
      errors.push('Task title must be less than 200 characters');
    }

    if (taskData.dueDate && taskData.dueDate < new Date()) {
      errors.push('Due date cannot be in the past');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateCustomerData(customerData: Partial<Customer>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!customerData.email || !this.validateEmail(customerData.email)) {
      errors.push('Valid email is required');
    }

    if (!customerData.name || customerData.name.trim().length === 0) {
      errors.push('Customer name is required');
    }

    if (customerData.phone && !this.validatePhone(customerData.phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export class DashboardService {
  constructor(
    private customerRepository: ICustomerRepository,
    private taskRepository: ITaskRepository
  ) {}

  async getRecentTasks(limit: number = 10): Promise<Task[]> {
    const allTasks = await this.taskRepository.findAll();
    return allTasks
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getTaskCompletionTrend(days: number = 30): Promise<{ date: string; completed: number; total: number }[]> {
    const tasks = await this.taskRepository.findAll();
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const trend: { date: string; completed: number; total: number }[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => 
        task.createdAt.toISOString().split('T')[0] === dateStr
      );
      
      const completedTasks = dayTasks.filter(task => task.status === 'COMPLETED');
      
      trend.push({
        date: dateStr,
        completed: completedTasks.length,
        total: dayTasks.length,
      });
    }

    return trend;
  }
}
