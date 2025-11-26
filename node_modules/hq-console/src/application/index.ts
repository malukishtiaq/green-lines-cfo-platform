// Dependency Injection Container - Clean Architecture Setup
import { RepositoryFactory } from '../infrastructure/database';
import { 
  GetDashboardStatsUseCase,
  GetCustomersUseCase,
  GetTasksUseCase,
  CreateCustomerUseCase,
  CreateTaskUseCase,
  UpdateTaskStatusUseCase,
  AuthenticateUserUseCase
} from '../application/use-cases';
import { 
  NotificationService, 
  AuditService, 
  ValidationService, 
  DashboardService 
} from '../application/services';
import { TransactionService, IntegrationService, OrchestrationService } from './services/OrchestrationService';
import { EmailService, PaymentService, FileService } from '../infrastructure/services';
import { ValidationService as DomainValidationService, CalculationService, BusinessRuleService } from '../domain/services';

// Use Case Factory
export class UseCaseFactory {
  static getDashboardStatsUseCase() {
    return new GetDashboardStatsUseCase(
      RepositoryFactory.getCustomerRepository(),
      RepositoryFactory.getTaskRepository(),
      RepositoryFactory.getServicePlanRepository()
    );
  }

  static getCustomersUseCase() {
    return new GetCustomersUseCase(RepositoryFactory.getCustomerRepository());
  }

  static getTasksUseCase() {
    return new GetTasksUseCase(RepositoryFactory.getTaskRepository());
  }

  static getCreateCustomerUseCase() {
    return new CreateCustomerUseCase(RepositoryFactory.getCustomerRepository());
  }

  static getCreateTaskUseCase() {
    return new CreateTaskUseCase(
      RepositoryFactory.getTaskRepository(),
      RepositoryFactory.getCustomerRepository()
    );
  }

  static getUpdateTaskStatusUseCase() {
    return new UpdateTaskStatusUseCase(RepositoryFactory.getTaskRepository());
  }

  static getAuthenticateUserUseCase() {
    return new AuthenticateUserUseCase(RepositoryFactory.getUserRepository());
  }
}

// Service Factory - Enhanced with all services
export class ServiceFactory {
  // Infrastructure Services
  private static emailService: EmailService;
  private static paymentService: PaymentService;
  private static notificationService: NotificationService;
  private static auditService: AuditService;
  private static fileService: FileService;
  private static dashboardService: DashboardService;

  // Application Services
  private static transactionService: TransactionService;
  private static integrationService: IntegrationService;
  private static orchestrationService: OrchestrationService;

  // Infrastructure Services
  static getEmailService(): EmailService {
    if (!this.emailService) {
      this.emailService = new EmailService();
    }
    return this.emailService;
  }

  static getPaymentService(): PaymentService {
    if (!this.paymentService) {
      this.paymentService = new PaymentService();
    }
    return this.paymentService;
  }

  static getNotificationService(): NotificationService {
    if (!this.notificationService) {
      this.notificationService = new NotificationService();
    }
    return this.notificationService;
  }

  static getAuditService(): AuditService {
    if (!this.auditService) {
      this.auditService = new AuditService();
    }
    return this.auditService;
  }

  static getFileService(): FileService {
    if (!this.fileService) {
      this.fileService = new FileService();
    }
    return this.fileService;
  }

  static getDashboardService(): DashboardService {
    if (!this.dashboardService) {
      this.dashboardService = new DashboardService(
        RepositoryFactory.getCustomerRepository(),
        RepositoryFactory.getTaskRepository()
      );
    }
    return this.dashboardService;
  }

  // Application Services
  static getTransactionService(): TransactionService {
    if (!this.transactionService) {
      this.transactionService = new TransactionService(
        RepositoryFactory.getCustomerRepository(),
        RepositoryFactory.getServicePlanRepository(),
        RepositoryFactory.getTaskRepository(),
        this.getPaymentService(),
        this.getEmailService(),
        this.getAuditService()
      );
    }
    return this.transactionService;
  }

  static getIntegrationService(): IntegrationService {
    if (!this.integrationService) {
      this.integrationService = new IntegrationService(
        this.getEmailService(),
        this.getNotificationService(),
        this.getAuditService(),
        RepositoryFactory.getTaskRepository(),
        RepositoryFactory.getCustomerRepository()
      );
    }
    return this.integrationService;
  }

  static getOrchestrationService(): OrchestrationService {
    if (!this.orchestrationService) {
      this.orchestrationService = new OrchestrationService(
        this.getTransactionService(),
        this.getIntegrationService(),
        this.getAuditService()
      );
    }
    return this.orchestrationService;
  }

  // Domain Services (static methods, no instantiation needed)
  static getValidationService() {
    return DomainValidationService;
  }

  static getCalculationService() {
    return CalculationService;
  }

  static getBusinessRuleService() {
    return BusinessRuleService;
  }
}

// Clean Architecture Configuration
export class CleanArchitectureConfig {
  static initialize() {
    console.log('🏗️ Clean Architecture initialized');
    console.log('📁 Domain Layer: Entities & Repository Interfaces');
    console.log('🔧 Application Layer: Use Cases & Services');
    console.log('🗄️ Infrastructure Layer: Database & External APIs');
    console.log('🎨 Presentation Layer: UI Components & Hooks');
  }
}
