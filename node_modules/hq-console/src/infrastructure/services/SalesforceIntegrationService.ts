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
 * Salesforce ERP Integration Service
 * 
 * Connects to Salesforce using OAuth 2.0 and REST API
 * Documentation: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/
 */
export class SalesforceIntegrationService implements IERPIntegrationService {
  private axiosInstance: AxiosInstance;
  private readonly SALESFORCE_API_VERSION = 'v58.0';

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getType(): ERPType {
    return ERPType.SALESFORCE;
  }

  /**
   * Test Salesforce connection
   */
  async testConnection(credentials: ERPCredentials): Promise<{
    success: boolean;
    message: string;
    serverInfo?: any;
  }> {
    try {
      const {
        salesforceInstanceUrl,
        salesforceUsername,
        salesforcePassword,
        salesforceSecurityToken,
        salesforceClientId,
        salesforceClientSecret,
        salesforceAccessToken,
      } = credentials;

      // If we have an access token, test it directly
      if (salesforceAccessToken && salesforceInstanceUrl) {
        const isValid = await this.validateAccessToken(
          salesforceInstanceUrl,
          salesforceAccessToken
        );

        if (isValid) {
          return {
            success: true,
            message: 'Successfully connected to Salesforce',
            serverInfo: { instanceUrl: salesforceInstanceUrl },
          };
        }
      }

      // Otherwise, try to authenticate with username/password
      if (
        salesforceUsername &&
        salesforcePassword &&
        salesforceClientId &&
        salesforceClientSecret
      ) {
        const authResult = await this.authenticatePasswordFlow(
          salesforceClientId,
          salesforceClientSecret,
          salesforceUsername,
          salesforcePassword,
          salesforceSecurityToken || ''
        );

        return {
          success: true,
          message: 'Successfully authenticated with Salesforce',
          serverInfo: {
            instanceUrl: authResult.instance_url,
            accessToken: authResult.access_token,
          },
        };
      }

      return {
        success: false,
        message: 'Missing required Salesforce credentials',
      };
    } catch (error: any) {
      console.error('Salesforce connection test failed:', error);
      return {
        success: false,
        message: error.message || 'Connection failed',
      };
    }
  }

  /**
   * Validate Salesforce access token
   */
  private async validateAccessToken(
    instanceUrl: string,
    accessToken: string
  ): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get(
        `${instanceUrl}/services/data/${this.SALESFORCE_API_VERSION}/sobjects/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Authenticate with Salesforce using username/password flow
   */
  private async authenticatePasswordFlow(
    clientId: string,
    clientSecret: string,
    username: string,
    password: string,
    securityToken: string
  ): Promise<{
    access_token: string;
    instance_url: string;
    refresh_token?: string;
  }> {
    try {
      const response = await this.axiosInstance.post(
        'https://login.salesforce.com/services/oauth2/token',
        null,
        {
          params: {
            grant_type: 'password',
            client_id: clientId,
            client_secret: clientSecret,
            username: username,
            password: password + securityToken, // Password + Security Token
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Salesforce authentication error:', error);
      throw new Error(
        `Salesforce authentication failed: ${error.response?.data?.error_description || error.message}`
      );
    }
  }

  /**
   * Connect to Salesforce
   */
  async connect(credentials: ERPCredentials): Promise<ERPConnection> {
    const {
      salesforceClientId,
      salesforceClientSecret,
      salesforceUsername,
      salesforcePassword,
      salesforceSecurityToken,
    } = credentials;

    if (
      !salesforceClientId ||
      !salesforceClientSecret ||
      !salesforceUsername ||
      !salesforcePassword
    ) {
      throw new Error('Missing required Salesforce credentials');
    }

    const authResult = await this.authenticatePasswordFlow(
      salesforceClientId,
      salesforceClientSecret,
      salesforceUsername,
      salesforcePassword,
      salesforceSecurityToken || ''
    );

    // Update credentials with tokens
    credentials.salesforceAccessToken = authResult.access_token;
    credentials.salesforceInstanceUrl = authResult.instance_url;
    credentials.salesforceRefreshToken = authResult.refresh_token;

    return {
      id: `salesforce_${Date.now()}`,
      customerId: credentials.companyId || '',
      type: ERPType.SALESFORCE,
      status: ERPStatus.CONNECTED,
      credentials,
      lastSyncDate: new Date(),
      lastSyncStatus: 'SUCCESS',
      mappingHealth: 100,
      dataDomains: ['CRM', 'Sales', 'Accounts', 'Opportunities'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Disconnect from Salesforce
   */
  async disconnect(connectionId: string): Promise<void> {
    console.log(`Disconnected from Salesforce connection: ${connectionId}`);
  }

  /**
   * Sync data from Salesforce
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
      for (const domain of domains) {
        switch (domain) {
          case 'CRM':
          case 'Accounts':
            const customers = await this.getCustomers(connection);
            recordsProcessed += customers.length;
            break;
          case 'Sales':
          case 'Opportunities':
            const salesOrders = await this.getSalesOrders(connection);
            recordsProcessed += salesOrders.length;
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
   * Get customers from Salesforce (Account object)
   */
  async getCustomers(connection: ERPConnection): Promise<ERPCustomer[]> {
    try {
      const { salesforceInstanceUrl, salesforceAccessToken } = connection.credentials;

      if (!salesforceInstanceUrl || !salesforceAccessToken) {
        throw new Error('Missing Salesforce connection details');
      }

      // Query Salesforce Accounts
      const query = `SELECT Id, Name, Email__c, Phone, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry FROM Account LIMIT 1000`;

      const response = await this.axiosInstance.get(
        `${salesforceInstanceUrl}/services/data/${this.SALESFORCE_API_VERSION}/query`,
        {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${salesforceAccessToken}`,
          },
        }
      );

      if (response.data.records) {
        return response.data.records.map((record: any) => ({
          erpId: record.Id,
          name: record.Name,
          email: record.Email__c || undefined,
          phone: record.Phone || undefined,
          address: [
            record.BillingStreet,
            record.BillingCity,
            record.BillingState,
            record.BillingPostalCode,
            record.BillingCountry,
          ]
            .filter(Boolean)
            .join(', '),
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching Salesforce customers:', error);
      throw new Error(`Failed to fetch customers from Salesforce: ${error.message}`);
    }
  }

  /**
   * Get invoices from Salesforce
   * Note: Salesforce doesn't have built-in invoicing. This would be custom objects.
   */
  async getInvoices(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPInvoice[]> {
    // TODO: Implement based on custom invoice object
    console.warn('Salesforce invoices require custom object configuration');
    return [];
  }

  /**
   * Get payments from Salesforce
   */
  async getPayments(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPPayment[]> {
    // TODO: Implement based on custom payment object
    console.warn('Salesforce payments require custom object configuration');
    return [];
  }

  /**
   * Get account transactions from Salesforce
   */
  async getAccountTransactions(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPAccountTransaction[]> {
    // Salesforce is CRM, not accounting system
    return [];
  }

  /**
   * Get sales orders/opportunities from Salesforce
   */
  async getSalesOrders(
    connection: ERPConnection,
    startDate?: Date,
    endDate?: Date
  ): Promise<ERPSalesOrder[]> {
    try {
      const { salesforceInstanceUrl, salesforceAccessToken } = connection.credentials;

      if (!salesforceInstanceUrl || !salesforceAccessToken) {
        throw new Error('Missing Salesforce connection details');
      }

      // Query Opportunities
      let query = `SELECT Id, Name, AccountId, Account.Name, CloseDate, Amount, StageName, CreatedDate FROM Opportunity`;

      if (startDate || endDate) {
        const conditions: string[] = [];
        if (startDate) {
          conditions.push(
            `CloseDate >= ${startDate.toISOString().split('T')[0]}`
          );
        }
        if (endDate) {
          conditions.push(`CloseDate <= ${endDate.toISOString().split('T')[0]}`);
        }
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` LIMIT 1000`;

      const response = await this.axiosInstance.get(
        `${salesforceInstanceUrl}/services/data/${this.SALESFORCE_API_VERSION}/query`,
        {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${salesforceAccessToken}`,
          },
        }
      );

      if (response.data.records) {
        return response.data.records.map((record: any) => ({
          erpId: record.Id,
          orderNumber: record.Name,
          customerId: record.AccountId,
          customerName: record.Account?.Name || '',
          date: new Date(record.CreatedDate),
          deliveryDate: new Date(record.CloseDate),
          status: this.mapSalesforceOpportunityStatus(record.StageName),
          totalAmount: record.Amount || 0,
          currency: 'USD', // TODO: Get from opportunity
          items: [],
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching Salesforce opportunities:', error);
      throw new Error(
        `Failed to fetch opportunities from Salesforce: ${error.message}`
      );
    }
  }

  /**
   * Get chart of accounts (N/A for Salesforce)
   */
  async getChartOfAccounts(connection: ERPConnection): Promise<any[]> {
    return [];
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(connection: ERPConnection): Promise<ERPCredentials> {
    const {
      salesforceClientId,
      salesforceClientSecret,
      salesforceRefreshToken,
    } = connection.credentials;

    if (!salesforceClientId || !salesforceClientSecret || !salesforceRefreshToken) {
      throw new Error('Missing credentials for token refresh');
    }

    try {
      const response = await this.axiosInstance.post(
        'https://login.salesforce.com/services/oauth2/token',
        null,
        {
          params: {
            grant_type: 'refresh_token',
            client_id: salesforceClientId,
            client_secret: salesforceClientSecret,
            refresh_token: salesforceRefreshToken,
          },
        }
      );

      connection.credentials.salesforceAccessToken = response.data.access_token;
      connection.credentials.salesforceInstanceUrl = response.data.instance_url;

      return connection.credentials;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      throw new Error(`Failed to refresh Salesforce token: ${error.message}`);
    }
  }

  /**
   * Validate field mapping
   */
  async validateMapping(
    connection: ERPConnection,
    mappings: any[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!mappings || mappings.length === 0) {
      errors.push('No mappings provided');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Map Salesforce opportunity stage to order status
   */
  private mapSalesforceOpportunityStatus(
    stage: string
  ): 'DRAFT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED' {
    const lowerStage = stage.toLowerCase();
    
    if (lowerStage.includes('closed won') || lowerStage.includes('won')) {
      return 'CONFIRMED';
    }
    if (lowerStage.includes('closed lost') || lowerStage.includes('lost')) {
      return 'CANCELLED';
    }
    if (lowerStage.includes('delivered') || lowerStage.includes('complete')) {
      return 'DELIVERED';
    }
    
    return 'DRAFT';
  }
}

