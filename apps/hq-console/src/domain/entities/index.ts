// Domain Entities - Core business objects
export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country: string;
  industry?: string;
  size?: CompanySize;
  status: CustomerStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  customerId: string;
  servicePlanId?: string;
  createdById: string;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicePlan {
  id: string;
  name: string;
  description?: string;
  type: ServiceType;
  status: ServiceStatus;
  price?: number | null;
  currency: string;
  duration?: number;
  features?: Record<string, unknown>;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER',
}

export enum CompanySize {
  STARTUP = 'STARTUP',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PROSPECT = 'PROSPECT',
}

export enum TaskType {
  FINANCIAL_REVIEW = 'FINANCIAL_REVIEW',
  TAX_PREPARATION = 'TAX_PREPARATION',
  BUDGET_PLANNING = 'BUDGET_PLANNING',
  AUDIT_SUPPORT = 'AUDIT_SUPPORT',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  REPORTING = 'REPORTING',
  CONSULTATION = 'CONSULTATION',
  OTHER = 'OTHER',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum ServiceType {
  BASIC_CFO = 'BASIC_CFO',
  PREMIUM_CFO = 'PREMIUM_CFO',
  ENTERPRISE_CFO = 'ENTERPRISE_CFO',
  CONSULTING = 'CONSULTING',
  AUDIT = 'AUDIT',
  TAX_FILING = 'TAX_FILING',
  CUSTOM = 'CUSTOM',
}

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
}
