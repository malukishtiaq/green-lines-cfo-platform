import {
  ERPType,
  ERPCredentials,
  ERPConnection,
  ERPStatus,
} from '@/domain/entities/ERPIntegration';
import { ERPIntegrationFactory } from '@/infrastructure/services/ERPIntegrationFactory';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import { prisma } from '@/lib/prisma';

/**
 * Use Case: Connect to ERP
 * 
 * Establishes a connection to a customer's ERP system and saves it to database.
 * Credentials are encrypted before storage.
 */
export class ConnectERPUseCase {
  async execute(
    customerId: string,
    erpType: ERPType,
    credentials: ERPCredentials
  ): Promise<{
    success: boolean;
    connection?: any;
    message: string;
  }> {
    try {
      // 1. Validate customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return {
          success: false,
          message: 'Customer not found',
        };
      }

      // 2. Check if connection already exists for this customer and ERP type
      const existingConnection = await prisma.eRPConnection.findFirst({
        where: {
          customerId,
          erpType: erpType.toString(),
        },
      });

      if (existingConnection) {
        return {
          success: false,
          message: `Connection already exists for ${erpType}. Please update the existing connection instead.`,
        };
      }

      // 3. Validate ERP type is supported
      if (!ERPIntegrationFactory.isSupported(erpType)) {
        return {
          success: false,
          message: `ERP type ${erpType} is not supported`,
        };
      }

      // 4. Get appropriate ERP service
      const erpService = ERPIntegrationFactory.getService(erpType);

      // 5. Test connection first
      const testResult = await erpService.testConnection(credentials);
      if (!testResult.success) {
        return {
          success: false,
          message: `Connection test failed: ${testResult.message}`,
        };
      }

      // 6. Encrypt credentials
      const encryptedCredentials = EncryptionService.encrypt(credentials);

      // 7. Save to database
      const connection = await prisma.eRPConnection.create({
        data: {
          customerId,
          erpType: erpType.toString(),
          status: ERPStatus.CONNECTED,
          credentialsEncrypted: encryptedCredentials,
          lastSyncDate: new Date(),
          lastSyncStatus: 'SUCCESS',
          mappingHealth: 100,
          dataDomains: [], // Will be populated after first sync
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        connection: {
          id: connection.id,
          customerId: connection.customerId,
          customerName: connection.customer.name,
          erpType: connection.erpType,
          status: connection.status,
          createdAt: connection.createdAt,
        },
        message: 'Successfully connected to ERP',
      };
    } catch (error: any) {
      console.error('Error connecting to ERP:', error);
      return {
        success: false,
        message: error.message || 'Failed to connect to ERP',
      };
    }
  }
}

