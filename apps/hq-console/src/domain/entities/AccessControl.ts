// Domain Layer - Access Control Entities
export enum UserRole {
  OWNER = 'OWNER',
  CEO = 'CEO',
  ADMIN = 'ADMIN',
  HR = 'HR',
  ACCOUNTANT = 'ACCOUNTANT',
  MODERATOR = 'MODERATOR',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER',
}

export enum Permission {
  // User Management
  CREATE_USERS = 'CREATE_USERS',
  READ_USERS = 'READ_USERS',
  UPDATE_USERS = 'UPDATE_USERS',
  DELETE_USERS = 'DELETE_USERS',
  
  // Customer Management
  CREATE_CUSTOMERS = 'CREATE_CUSTOMERS',
  READ_CUSTOMERS = 'READ_CUSTOMERS',
  UPDATE_CUSTOMERS = 'UPDATE_CUSTOMERS',
  DELETE_CUSTOMERS = 'DELETE_CUSTOMERS',
  
  // Task Management
  CREATE_TASKS = 'CREATE_TASKS',
  READ_TASKS = 'READ_TASKS',
  UPDATE_TASKS = 'UPDATE_TASKS',
  DELETE_TASKS = 'DELETE_TASKS',
  ASSIGN_TASKS = 'ASSIGN_TASKS',
  
  // Service Plans
  CREATE_SERVICE_PLANS = 'CREATE_SERVICE_PLANS',
  READ_SERVICE_PLANS = 'READ_SERVICE_PLANS',
  UPDATE_SERVICE_PLANS = 'UPDATE_SERVICE_PLANS',
  DELETE_SERVICE_PLANS = 'DELETE_SERVICE_PLANS',
  
  // Settings
  READ_SETTINGS = 'READ_SETTINGS',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  
  // Reports
  READ_REPORTS = 'READ_REPORTS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',
  
  // Profile
  READ_PROFILE = 'READ_PROFILE',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  
  // Payments
  READ_PAYMENTS = 'READ_PAYMENTS',
  UPDATE_PAYMENTS = 'UPDATE_PAYMENTS',
  PROCESS_PAYMENTS = 'PROCESS_PAYMENTS',
}

export interface AccessControl {
  role: UserRole;
  permissions: Permission[];
  restrictions?: {
    canCreateUsers?: boolean;
    canDeleteUsers?: boolean;
    canAccessSettings?: boolean;
    canViewAllCustomers?: boolean;
    canViewAllTasks?: boolean;
    canViewReports?: boolean;
    canProcessPayments?: boolean;
  };
}
