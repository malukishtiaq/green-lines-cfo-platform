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
  ERPStatus,
} from '@/domain/entities/ERPIntegration';
import { IERPIntegrationService } from '@/domain/services/IERPIntegrationService';
import axios, { AxiosInstance } from 'axios';

/**
 * Odoo ERP Integration Service
 * 
 * Connects to Odoo ERP using XML-RPC or REST API
 * Documentation: https://www.odoo.com/documentation/16.0/developer/reference/external_api.html
 */
export class OdooIntegrationService implements IERPIntegrationService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getType(): ERPType {
    return ERPType.ODOO;
  }

  /**
   * Test Odoo connection
   */
  async testConnection(credentials: ERPCredentials): Promise<{
    success: boolean;
    message: string;
    serverInfo?: any;
  }> {
    try {
      const { odooUrl, odooDatabase, odooUsername, odooPassword } = credentials;

      if (!odooUrl || !odooDatabase || !odooUsername || !odooPassword) {
        return {
          success: false,
          message: 'Missing required Odoo credentials',
        };
      }

      // Authenticate with Odoo
      const authResponse = await this.authenticate(
        odooUrl,
        odooDatabase,
        odooUsername,
        odooPassword
      );

      if (authResponse.uid) {
        return {
          success: true,
          message: 'Successfully connected to Odoo',
          serverInfo: {
            uid: authResponse.uid,
            serverVersion: authResponse.serverVersion,
            database: odooDatabase,
          },
        };
      }

      return {
        success: false,
        message: 'Authentication failed',
      };
    } catch (error: any) {
      console.error('Odoo connection test failed:', error);
      return {
        success: false,
        message: error.message || 'Connection failed',
      };
    }
  }

  /**
   * Authenticate with Odoo and get UID
   */
  private async authenticate(
    url: string,
    database: string,
    username: string,
    password: string
  ): Promise<{ uid: number; serverVersion?: string }> {
    try {
      // Clean the URL - remove any query parameters
      const baseUrl = url.split('?')[0].replace(/\/$/, '');
      
      // Odoo JSON-RPC authentication endpoint
      const authUrl = `${baseUrl}/web/session/authenticate`;
      
      console.log('Attempting Odoo authentication:', {
        url: authUrl,
        database,
        username,
      });
      
      const response = await this.axiosInstance.post(authUrl, {
        jsonrpc: '2.0',
        params: {
          db: database,
          login: username,
          password: password,
        },
      });

      console.log('Odoo auth response:', response.data);

      // Check for result
      if (response.data.result) {
        if (response.data.result.uid) {
          return {
            uid: response.data.result.uid,
            serverVersion: response.data.result.server_version,
          };
        }
        
        // Sometimes Odoo returns error in result
        if (response.data.result.error) {
          throw new Error(response.data.result.error.data?.message || 'Authentication failed');
        }
      }

      // Check for error in response
      if (response.data.error) {
        const errorMsg = response.data.error.data?.message || response.data.error.message || 'Authentication failed';
        throw new Error(errorMsg);
      }

      throw new Error('Authentication failed - invalid credentials or database');
    } catch (error: any) {
      console.error('Odoo authentication error:', error);
      
      // Better error messages
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('Odoo server not found. Please check the URL.');
        } else if (error.response.status === 500) {
          throw new Error('Odoo server error. Please check the database name.');
        }
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Odoo server. Please check the URL.');
      }
      
      if (error.code === 'ETIMEDOUT') {
        throw new Error('Connection timeout. Please check your network and Odoo server.');
      }
      
      throw new Error(error.message || 'Odoo authentication failed');
    }
  }

  /**
   * Connect to Odoo
   */
  async connect(credentials: ERPCredentials): Promise<ERPConnection> {
    const { odooUrl, odooDatabase, odooUsername, odooPassword } = credentials;

    if (!odooUrl || !odooDatabase || !odooUsername || !odooPassword) {
      throw new Error('Missing required Odoo credentials');
    }

    const authResult = await this.authenticate(
      odooUrl,
      odooDatabase,
      odooUsername,
      odooPassword
    );

    return {
      id: `odoo_${Date.now()}`,
      customerId: credentials.companyId || '',
      type: ERPType.ODOO,
      status: ERPStatus.CONNECTED,
      credentials,
      lastSyncDate: new Date(),
      lastSyncStatus: 'SUCCESS',
      mappingHealth: 100,
      dataDomains: ['AR', 'AP', 'GL', 'Sales', 'Inventory'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Disconnect from Odoo
   */
  async disconnect(connectionId: string): Promise<void> {
    // Odoo doesn't require explicit disconnect
    console.log(`Disconnected from Odoo connection: ${connectionId}`);
  }

  /**
   * Sync data from Odoo
   */
  async syncData(
    connection: ERPConnection,
    domains: string[]
  ): Promise<ERPSyncResult> {
    const startTime = new Date();
    let recordsProcessed = 0;
    let recordsSkipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Sync each domain
      for (const domain of domains) {
        switch (domain) {
          case 'AR':
            const customers = await this.getCustomers(connection);
            recordsProcessed += customers.length;
            break;
          case 'Sales':
            const invoices = await this.getInvoices(connection);
            recordsProcessed += invoices.length;
            break;
          case 'AP':
            const payments = await this.getPayments(connection);
            recordsProcessed += payments.length;
            break;
          case 'GL':
            const transactions = await this.getAccountTransactions(connection);
            recordsProcessed += transactions.length;
            break;
          default:
            warnings.push(`Domain ${domain} not supported yet`);
        }
      }

      const endTime = new Date();
      return {
        success: true,
        recordsProcessed,
        recordsSkipped,
        errors,
        warnings,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
      };
    } catch (error: any) {
      const endTime = new Date();
      errors.push(error.message);
      return {
        success: false,
        recordsProcessed,
        recordsSkipped,
        errors,
        warnings,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
      };
    }
  }

  /**
   * Get customers from Odoo (res.partner model)
   */
  async getCustomers(connection: ERPConnection): Promise<ERPCustomer[]> {
    try {
      const { odooUrl, odooDatabase, odooUsername, odooPassword } = connection.credentials;
      
      // Call Odoo API to get partners (customers)
      const searchUrl = `${odooUrl}/web/dataset/search_read`;
      
      const response = await this.axiosInstance.post(searchUrl, {
        jsonrpc: '2.0',
        params: {
          model: 'res.partner',
          domain: [['customer_rank', '>', 0]], // Only customers
          fields: ['name', 'email', 'phone', 'street', 'vat', 'credit_limit'],
          limit: 1000,
        },
      });

      if (response.data.result && response.data.result.records) {
        return response.data.result.records.map((record: any) => ({
          erpId: record.id.toString(),
          name: record.name,
          email: record.email || undefined,
          phone: record.phone || undefined,
          address: record.street || undefined,
          vatNumber: record.vat || undefined,
          creditLimit: record.credit_limit || 0,
          balance: 0, // Will be calculated from invoices
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching Odoo customers:', error);
      throw new Error(`Failed to fetch customers from Odoo: ${error.message}`);
    }
  }

  /**
   * Get invoices from Odoo (account.move model)
   */
  async getInvoices(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPInvoice[]> {
    try {
      const { odooUrl } = connection.credentials;
      const searchUrl = `${odooUrl}/web/dataset/search_read`;

      const domain: any[] = [
        ['move_type', '=', 'out_invoice'], // Only customer invoices
      ];

      if (startDate) {
        domain.push(['invoice_date', '>=', startDate.toISOString().split('T')[0]]);
      }
      if (endDate) {
        domain.push(['invoice_date', '<=', endDate.toISOString().split('T')[0]]);
      }

      const response = await this.axiosInstance.post(searchUrl, {
        jsonrpc: '2.0',
        params: {
          model: 'account.move',
          domain,
          fields: [
            'name',
            'partner_id',
            'invoice_date',
            'invoice_date_due',
            'amount_total',
            'currency_id',
            'state',
            'invoice_line_ids',
          ],
          limit: 1000,
        },
      });

      if (response.data.result && response.data.result.records) {
        return response.data.result.records.map((record: any) => ({
          erpId: record.id.toString(),
          invoiceNumber: record.name,
          customerId: record.partner_id[0]?.toString() || '',
          customerName: record.partner_id[1] || '',
          date: new Date(record.invoice_date),
          dueDate: new Date(record.invoice_date_due),
          amount: record.amount_total,
          currency: record.currency_id[1] || 'USD',
          status: this.mapOdooInvoiceStatus(record.state),
          items: [], // TODO: Fetch invoice lines separately
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching Odoo invoices:', error);
      throw new Error(`Failed to fetch invoices from Odoo: ${error.message}`);
    }
  }

  /**
   * Get payments from Odoo (account.payment model)
   */
  async getPayments(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPPayment[]> {
    try {
      const { odooUrl } = connection.credentials;
      const searchUrl = `${odooUrl}/web/dataset/search_read`;

      const domain: any[] = [['payment_type', '=', 'inbound']];

      if (startDate) {
        domain.push(['date', '>=', startDate.toISOString().split('T')[0]]);
      }
      if (endDate) {
        domain.push(['date', '<=', endDate.toISOString().split('T')[0]]);
      }

      const response = await this.axiosInstance.post(searchUrl, {
        jsonrpc: '2.0',
        params: {
          model: 'account.payment',
          domain,
          fields: ['name', 'date', 'amount', 'currency_id', 'payment_method_id', 'ref'],
          limit: 1000,
        },
      });

      if (response.data.result && response.data.result.records) {
        return response.data.result.records.map((record: any) => ({
          erpId: record.id.toString(),
          invoiceId: '', // TODO: Link to invoice
          date: new Date(record.date),
          amount: record.amount,
          currency: record.currency_id[1] || 'USD',
          paymentMethod: record.payment_method_id[1] || 'Unknown',
          reference: record.ref || record.name,
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching Odoo payments:', error);
      throw new Error(`Failed to fetch payments from Odoo: ${error.message}`);
    }
  }

  /**
   * Get account transactions from Odoo
   */
  async getAccountTransactions(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPAccountTransaction[]> {
    // TODO: Implement GL transactions sync
    return [];
  }

  /**
   * Get sales orders from Odoo (sale.order model)
   */
  async getSalesOrders(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPSalesOrder[]> {
    // TODO: Implement sales orders sync
    return [];
  }

  /**
   * Get chart of accounts from Odoo
   */
  async getChartOfAccounts(connection: ERPConnection): Promise<any[]> {
    // TODO: Implement COA sync
    return [];
  }

  /**
   * Validate field mapping
   */
  async validateMapping(
    connection: ERPConnection,
    mappings: any[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Basic validation
    if (!mappings || mappings.length === 0) {
      errors.push('No mappings provided');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Map Odoo invoice status to platform status
   */
  private mapOdooInvoiceStatus(
    odooStatus: string
  ): 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' {
    switch (odooStatus) {
      case 'draft':
        return 'DRAFT';
      case 'posted':
        return 'SENT';
      case 'payment':
      case 'paid':
        return 'PAID';
      case 'cancel':
        return 'CANCELLED';
      default:
        return 'DRAFT';
    }
  }
}

