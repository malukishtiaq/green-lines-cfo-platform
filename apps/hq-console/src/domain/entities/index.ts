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

export interface Partner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  country: string;
  domain: string; // area of expertise e.g., Odoo, Stock Count
  role: PartnerRole;
  notes?: string;
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

export enum PartnerRole {
  ERP_CONSULTANT = 'ERP_CONSULTANT',
  TECHNICAL = 'TECHNICAL',
  ACCOUNTS = 'ACCOUNTS',
  STOCK_COUNT = 'STOCK_COUNT',
  IMPLEMENTATION = 'IMPLEMENTATION',
  TRAINING = 'TRAINING',
  OTHER = 'OTHER',
}

// Contracts Domain
export enum ContractType {
  SERVICE_AGREEMENT = 'SERVICE_AGREEMENT',
  NDA = 'NDA',
  MSA = 'MSA',
  SOW = 'SOW',
  PROPOSAL = 'PROPOSAL',
  CUSTOM = 'CUSTOM',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  SIGNED = 'SIGNED',
  FAILED = 'FAILED',
}

export enum Brand {
  GREENLINES = 'GREENLINES',
  GLERP = 'GLERP',
  OTHER = 'OTHER',
}

export enum AIProvider {
  OPENAI = 'OPENAI',
  GEMINI = 'GEMINI',
  ANTHROPIC = 'ANTHROPIC',
  CUSTOM = 'CUSTOM',
}

export interface CompanyProfile {
  id: string;
  name: string;
  brand: Brand;
  legalName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  signerName?: string;
  signerTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  language: string; // 'en' | 'ar'
  industry?: string;
  brand?: Brand;
  defaultContent: string;
  variables?: string[] | Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  type: ContractType;
  status: ContractStatus;
  language: string; // 'en' | 'ar'
  industry?: string;
  variables?: Record<string, unknown>;
  generatedContent?: string;
  pdfPath?: string;
  aiProvider?: AIProvider;
  sentAt?: Date;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  templateId?: string;
  senderCompanyId: string;
  customerId?: string;
  recipientEmail: string;
  recipientName?: string;
  createdById: string;
}