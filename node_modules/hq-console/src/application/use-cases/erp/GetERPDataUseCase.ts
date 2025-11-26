import {
  ERPType,
  ERPCustomer,
  ERPInvoice,
  ERPPayment,
} from '@/domain/entities/ERPIntegration';
import { ERPIntegrationFactory } from '@/infrastructure/services/ERPIntegrationFactory';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import { prisma } from '@/lib/prisma';

/**
 * Use Case: Get ERP Data
 * 
 * Retrieves synced data from customer's ERP.
 * This can be used to display ERP data in HQ Console dashboards.
 */
export class GetERPDataUseCase {
  async execute(
    connectionId: string,
    dataType: 'customers' | 'invoices' | 'payments' | 'transactions' | 'salesOrders',
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    success: boolean;
    data?: any[];
    message: string;
  }> {
    try {
      // 1. Get connection from database
      const dbConnection = await prisma.eRPConnection.findUnique({
        where: { id: connectionId },
      });

      if (!dbConnection) {
        return {
          success: false,
          message: 'ERP connection not found',
        };
      }

      // 2. Check if connection is active
      if (dbConnection.status !== 'CONNECTED') {
        return {
          success: false,
          message: `Cannot fetch data: Connection status is ${dbConnection.status}`,
        };
      }

      // 3. Decrypt credentials
      const credentials = EncryptionService.decrypt(
        dbConnection.credentialsEncrypted
      );

      // 4. Get appropriate ERP service
      const erpType = dbConnection.erpType as ERPType;
      const erpService = ERPIntegrationFactory.getService(erpType);

      // 5. Create connection object for service
      const connection = {
        id: dbConnection.id,
        customerId: dbConnection.customerId,
        type: erpType,
        status: dbConnection.status as any,
        credentials,
        lastSyncDate: dbConnection.lastSyncDate || undefined,
        lastSyncStatus: (dbConnection.lastSyncStatus as any) || undefined,
        mappingHealth: dbConnection.mappingHealth,
        dataDomains: dbConnection.dataDomains,
        createdAt: dbConnection.createdAt,
        updatedAt: dbConnection.updatedAt,
      };

      // 6. Fetch data based on type
      let data: any[];

      switch (dataType) {
        case 'customers':
          data = await erpService.getCustomers(connection);
          break;

        case 'invoices':
          data = await erpService.getInvoices(connection, startDate, endDate);
          break;

        case 'payments':
          data = await erpService.getPayments(connection, startDate, endDate);
          break;

        case 'transactions':
          data = await erpService.getAccountTransactions(
            connection,
            startDate,
            endDate
          );
          break;

        case 'salesOrders':
          data = await erpService.getSalesOrders(connection, startDate, endDate);
          break;

        default:
          return {
            success: false,
            message: `Unsupported data type: ${dataType}`,
          };
      }

      return {
        success: true,
        data,
        message: `Retrieved ${data.length} ${dataType}`,
      };
    } catch (error: any) {
      console.error(`Error fetching ERP ${dataType}:`, error);
      return {
        success: false,
        message: error.message || `Failed to fetch ${dataType}`,
      };
    }
  }
}

