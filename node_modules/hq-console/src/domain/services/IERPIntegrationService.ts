import {
  ERPType,
  ERPCredentials,
  ERPConnection,
  ERPSyncResult,
  ERPCustomer,
  ERPInvoice,
  ERPPayment,
  ERPAccountTransaction,
  ERPSalesOrder,
} from '@/domain/entities/ERPIntegration';

/**
 * Base interface for ERP integration services
 * Each ERP system should implement this interface
 */
export interface IERPIntegrationService {
  /**
   * Get the ERP type this service handles
   */
  getType(): ERPType;

  /**
   * Test connection with provided credentials
   */
  testConnection(credentials: ERPCredentials): Promise<{
    success: boolean;
    message: string;
    serverInfo?: any;
  }>;

  /**
   * Establish connection and authenticate
   */
  connect(credentials: ERPCredentials): Promise<ERPConnection>;

  /**
   * Disconnect and cleanup
   */
  disconnect(connectionId: string): Promise<void>;

  /**
   * Sync data from ERP to platform
   */
  syncData(
    connection: ERPConnection,
    domains: string[]
  ): Promise<ERPSyncResult>;

  /**
   * Get customers from ERP
   */
  getCustomers(connection: ERPConnection): Promise<ERPCustomer[]>;

  /**
   * Get invoices from ERP
   */
  getInvoices(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPInvoice[]>;

  /**
   * Get payments from ERP
   */
  getPayments(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPPayment[]>;

  /**
   * Get account transactions (GL)
   */
  getAccountTransactions(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPAccountTransaction[]>;

  /**
   * Get sales orders
   */
  getSalesOrders(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPSalesOrder[]>;

  /**
   * Get chart of accounts
   */
  getChartOfAccounts(connection: ERPConnection): Promise<any[]>;

  /**
   * Refresh OAuth token (if applicable)
   */
  refreshToken?(connection: ERPConnection): Promise<ERPCredentials>;

  /**
   * Validate field mapping
   */
  validateMapping(
    connection: ERPConnection,
    mappings: any[]
  ): Promise<{ valid: boolean; errors: string[] }>;
}

