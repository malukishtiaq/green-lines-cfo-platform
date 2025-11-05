// Application Layer - Access Control Service
import { UserRole, Permission, AccessControl } from '../../domain/entities/AccessControl';

export class AccessControlService {
  private static rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.OWNER]: [
      // Owner has all permissions
      Permission.CREATE_USERS,
      Permission.READ_USERS,
      Permission.UPDATE_USERS,
      Permission.DELETE_USERS,
      Permission.CREATE_CUSTOMERS,
      Permission.READ_CUSTOMERS,
      Permission.UPDATE_CUSTOMERS,
      Permission.DELETE_CUSTOMERS,
      Permission.CREATE_TASKS,
      Permission.READ_TASKS,
      Permission.UPDATE_TASKS,
      Permission.DELETE_TASKS,
      Permission.ASSIGN_TASKS,
      Permission.CREATE_SERVICE_PLANS,
      Permission.READ_SERVICE_PLANS,
      Permission.UPDATE_SERVICE_PLANS,
      Permission.DELETE_SERVICE_PLANS,
      Permission.CREATE_PARTNERS,
      Permission.READ_PARTNERS,
      Permission.UPDATE_PARTNERS,
      Permission.DELETE_PARTNERS,
      Permission.READ_SETTINGS,
      Permission.UPDATE_SETTINGS,
      Permission.READ_REPORTS,
      Permission.EXPORT_REPORTS,
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.READ_PAYMENTS,
      Permission.UPDATE_PAYMENTS,
      Permission.PROCESS_PAYMENTS,
    ],
    [UserRole.CEO]: [
      // CEO can see everything but can't delete users or change settings
      Permission.READ_USERS,
      Permission.UPDATE_USERS,
      Permission.CREATE_CUSTOMERS,
      Permission.READ_CUSTOMERS,
      Permission.UPDATE_CUSTOMERS,
      Permission.DELETE_CUSTOMERS,
      Permission.CREATE_TASKS,
      Permission.READ_TASKS,
      Permission.UPDATE_TASKS,
      Permission.DELETE_TASKS,
      Permission.ASSIGN_TASKS,
      Permission.CREATE_SERVICE_PLANS,
      Permission.READ_SERVICE_PLANS,
      Permission.READ_PARTNERS,
      Permission.UPDATE_SERVICE_PLANS,
      Permission.DELETE_SERVICE_PLANS,
      Permission.READ_SETTINGS,
      Permission.READ_REPORTS,
      Permission.EXPORT_REPORTS,
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.READ_PAYMENTS,
      Permission.UPDATE_PAYMENTS,
      Permission.PROCESS_PAYMENTS,
    ],
    [UserRole.ADMIN]: [
      // Admin can manage most things but not settings or user creation
      Permission.READ_USERS,
      Permission.UPDATE_USERS,
      Permission.CREATE_CUSTOMERS,
      Permission.READ_CUSTOMERS,
      Permission.UPDATE_CUSTOMERS,
      Permission.DELETE_CUSTOMERS,
      Permission.CREATE_TASKS,
      Permission.READ_TASKS,
      Permission.UPDATE_TASKS,
      Permission.DELETE_TASKS,
      Permission.ASSIGN_TASKS,
      Permission.CREATE_SERVICE_PLANS,
      Permission.READ_SERVICE_PLANS,
      Permission.UPDATE_SERVICE_PLANS,
      Permission.DELETE_SERVICE_PLANS,
      Permission.CREATE_PARTNERS,
      Permission.READ_PARTNERS,
      Permission.UPDATE_PARTNERS,
      Permission.DELETE_PARTNERS,
      Permission.READ_REPORTS,
      Permission.EXPORT_REPORTS,
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.READ_PAYMENTS,
      Permission.UPDATE_PAYMENTS,
    ],
    [UserRole.HR]: [
      // HR can manage users and profiles
      Permission.READ_USERS,
      Permission.UPDATE_USERS,
      Permission.READ_CUSTOMERS,
      Permission.READ_TASKS,
      Permission.READ_SERVICE_PLANS,
      Permission.READ_PARTNERS,
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
    ],
    [UserRole.ACCOUNTANT]: [
      // Accountant can manage payments and financial data
      Permission.READ_CUSTOMERS,
      Permission.READ_TASKS,
      Permission.READ_SERVICE_PLANS,
      Permission.READ_PARTNERS,
      Permission.READ_REPORTS,
      Permission.EXPORT_REPORTS,
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.READ_PAYMENTS,
      Permission.UPDATE_PAYMENTS,
      Permission.PROCESS_PAYMENTS,
    ],
    [UserRole.MODERATOR]: [
      // Moderator can manage tasks and customers but not settings
      Permission.READ_CUSTOMERS,
      Permission.UPDATE_CUSTOMERS,
      Permission.CREATE_TASKS,
      Permission.READ_TASKS,
      Permission.UPDATE_TASKS,
      Permission.ASSIGN_TASKS,
      Permission.READ_SERVICE_PLANS,
      Permission.READ_PARTNERS,
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
    ],
    [UserRole.AGENT]: [
      // Agent can manage assigned tasks
      Permission.READ_CUSTOMERS,
      Permission.READ_TASKS,
      Permission.UPDATE_TASKS,
      Permission.READ_SERVICE_PLANS,
      Permission.READ_PARTNERS,
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
    ],
    [UserRole.CUSTOMER]: [
      // Customer can only view their own data
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
    ],
  };

  public static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = this.rolePermissions[userRole];
    return rolePermissions.includes(permission);
  }

  public static hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  public static hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  public static canAccessPage(userRole: UserRole, page: string): boolean {
    const pagePermissions: Record<string, Permission[]> = {
      'dashboard': [Permission.READ_TASKS],
      'customers': [Permission.READ_CUSTOMERS],
      'partners': [Permission.READ_PARTNERS],
      'service-plans': [Permission.READ_SERVICE_PLANS],
      'tasks': [Permission.READ_TASKS],
      'settings': [Permission.READ_SETTINGS],
      'users': [Permission.READ_USERS],
      'reports': [Permission.READ_REPORTS],
      'payments': [Permission.READ_PAYMENTS],
      'profile': [Permission.READ_PROFILE],
    };

    const requiredPermissions = pagePermissions[page];
    if (!requiredPermissions) {
      return false; // Unknown page
    }

    return this.hasAnyPermission(userRole, requiredPermissions);
  }

  public static canPerformAction(userRole: UserRole, action: string): boolean {
    const actionPermissions: Record<string, Permission[]> = {
      'create-user': [Permission.CREATE_USERS],
      'delete-user': [Permission.DELETE_USERS],
      'update-user': [Permission.UPDATE_USERS],
      'create-customer': [Permission.CREATE_CUSTOMERS],
      'delete-customer': [Permission.DELETE_CUSTOMERS],
      'update-customer': [Permission.UPDATE_CUSTOMERS],
      'create-task': [Permission.CREATE_TASKS],
      'delete-task': [Permission.DELETE_TASKS],
      'update-task': [Permission.UPDATE_TASKS],
      'assign-task': [Permission.ASSIGN_TASKS],
      'create-service-plan': [Permission.CREATE_SERVICE_PLANS],
      'delete-service-plan': [Permission.DELETE_SERVICE_PLANS],
      'update-service-plan': [Permission.UPDATE_SERVICE_PLANS],
      'update-settings': [Permission.UPDATE_SETTINGS],
      'export-report': [Permission.EXPORT_REPORTS],
      'process-payment': [Permission.PROCESS_PAYMENTS],
    };

    const requiredPermissions = actionPermissions[action];
    if (!requiredPermissions) {
      return false; // Unknown action
    }

    return this.hasAnyPermission(userRole, requiredPermissions);
  }

  public static getUserAccessControl(userRole: UserRole): AccessControl {
    return {
      role: userRole,
      permissions: this.rolePermissions[userRole],
      restrictions: {
        canCreateUsers: this.hasPermission(userRole, Permission.CREATE_USERS),
        canDeleteUsers: this.hasPermission(userRole, Permission.DELETE_USERS),
        canAccessSettings: this.hasPermission(userRole, Permission.READ_SETTINGS),
        canViewAllCustomers: this.hasPermission(userRole, Permission.READ_CUSTOMERS),
        canViewAllTasks: this.hasPermission(userRole, Permission.READ_TASKS),
        canViewReports: this.hasPermission(userRole, Permission.READ_REPORTS),
        canProcessPayments: this.hasPermission(userRole, Permission.PROCESS_PAYMENTS),
      },
    };
  }
}
