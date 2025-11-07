// ERP Integration Types
export enum ERPType {
  ODOO = 'ODOO',
  SALESFORCE = 'SALESFORCE',
  SAP = 'SAP',
  ZOHO = 'ZOHO',
  QUICKBOOKS = 'QUICKBOOKS',
  ORACLE = 'ORACLE',
  NONE = 'NONE',
}

export enum ERPStatus {
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  DISCONNECTED = 'DISCONNECTED',
}

export interface ERPCredentials {
  // Common fields
  type: ERPType;
  companyId?: string;
  
  // Odoo specific
  odooUrl?: string;
  odooDatabase?: string;
  odooUsername?: string;
  odooPassword?: string;
  odooApiKey?: string;
  
  // Salesforce specific
  salesforceInstanceUrl?: string;
  salesforceClientId?: string;
  salesforceClientSecret?: string;
  salesforceUsername?: string;
  salesforcePassword?: string;
  salesforceSecurityToken?: string;
  salesforceAccessToken?: string;
  salesforceRefreshToken?: string;
  
  // SAP specific
  sapUrl?: string;
  sapClient?: string;
  sapUsername?: string;
  sapPassword?: string;
  
  // Generic OAuth
  oauthAccessToken?: string;
  oauthRefreshToken?: string;
  oauthTokenExpiry?: Date;
}

export interface ERPConnection {
  id: string;
  customerId: string;
  type: ERPType;
  status: ERPStatus;
  credentials: ERPCredentials;
  lastSyncDate?: Date;
  lastSyncStatus?: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  lastSyncError?: string;
  mappingHealth: number; // 0-100
  dataDomains: string[]; // ['AR', 'AP', 'GL', 'Sales', 'Inventory', 'Payroll']
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPSyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSkipped: number;
  errors: string[];
  warnings: string[];
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
}

export interface ERPDataMapping {
  domain: string; // 'AR', 'AP', 'GL', etc.
  erpField: string;
  platformField: string;
  transformation?: string; // Optional transformation logic
  required: boolean;
}

// Financial data structures from ERP
export interface ERPCustomer {
  erpId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
  creditLimit?: number;
  balance?: number;
}

export interface ERPInvoice {
  erpId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: Date;
  dueDate: Date;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  items: ERPInvoiceItem[];
}

export interface ERPInvoiceItem {
  erpId: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalAmount: number;
}

export interface ERPPayment {
  erpId: string;
  invoiceId: string;
  date: Date;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference?: string;
}

export interface ERPAccountTransaction {
  erpId: string;
  transactionDate: Date;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
  description?: string;
  reference?: string;
}

export interface ERPSalesOrder {
  erpId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: Date;
  deliveryDate?: Date;
  status: 'DRAFT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  items: ERPInvoiceItem[];
}

