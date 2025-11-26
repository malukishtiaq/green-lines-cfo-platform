import {
  ERPStatus,
  ERPType,
  ERPCredentials,
} from '@/domain/entities/ERPIntegration';
import { ERPIntegrationFactory } from '@/infrastructure/services/ERPIntegrationFactory';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import { prisma } from '@/lib/prisma';

interface ReconnectResult {
  success: boolean;
  message: string;
  connection?: {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    erpType: string;
    status: string;
    lastSyncDate: Date | null;
    lastSyncStatus: string | null;
    lastSyncError: string | null;
    mappingHealth: number;
    dataDomains: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Use Case: Reconnect to ERP
 *
 * Attempts to restore an existing ERP connection using the stored credentials.
 * Useful when sessions expire or connections transition to an error/disconnected state.
 */
export class ReconnectERPUseCase {
  async execute(connectionId: string): Promise<ReconnectResult> {
    try {
      const connection = await prisma.eRPConnection.findUnique({
        where: { id: connectionId },
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

      if (!connection) {
        return {
          success: false,
          message: 'ERP connection not found',
        };
      }

      const erpType =
        ERPType[connection.erpType as keyof typeof ERPType] ??
        (connection.erpType as ERPType);

      if (!ERPIntegrationFactory.isSupported(erpType)) {
        return {
          success: false,
          message: `ERP type ${connection.erpType} is not supported yet`,
        };
      }

      let credentials: ERPCredentials;
      try {
        credentials = EncryptionService.decrypt(
          connection.credentialsEncrypted,
        ) as ERPCredentials;
        if (!credentials.type) {
          credentials.type = erpType;
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Failed to read stored credentials',
        };
      }

      const erpService = ERPIntegrationFactory.getService(erpType);

      // Update status to CONNECTING while we attempt to re-establish the session
      await prisma.eRPConnection.update({
        where: { id: connectionId },
        data: {
          status: ERPStatus.CONNECTING,
          lastSyncError: null,
        },
      });

      const testResult = await erpService.testConnection(credentials);

      if (!testResult.success) {
        const failedConnection = await prisma.eRPConnection.update({
          where: { id: connectionId },
          data: {
            status: ERPStatus.ERROR,
            lastSyncStatus: 'FAILED',
            lastSyncError: testResult.message ?? 'Unable to reconnect to ERP',
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
          success: false,
          message: testResult.message ?? 'Unable to reconnect to ERP',
          connection: this.sanitizeConnection(failedConnection),
        };
      }

      const updated = await prisma.eRPConnection.update({
        where: { id: connectionId },
        data: {
          status: ERPStatus.CONNECTED,
          lastSyncStatus: 'SUCCESS',
          lastSyncError: null,
          lastSyncDate: new Date(),
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
        message: testResult.message ?? 'ERP connection restored successfully',
        connection: this.sanitizeConnection(updated),
      };
    } catch (error: any) {
      console.error('Error reconnecting ERP integration:', error);
      return {
        success: false,
        message: error.message || 'Failed to reconnect to ERP',
      };
    }
  }

  private sanitizeConnection(connection: any) {
    return {
      id: connection.id,
      customerId: connection.customerId,
      customerName: connection.customer.name,
      customerEmail: connection.customer.email,
      erpType: connection.erpType,
      status: connection.status,
      lastSyncDate: connection.lastSyncDate,
      lastSyncStatus: connection.lastSyncStatus,
      lastSyncError: connection.lastSyncError,
      mappingHealth: connection.mappingHealth,
      dataDomains: connection.dataDomains,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }
}


