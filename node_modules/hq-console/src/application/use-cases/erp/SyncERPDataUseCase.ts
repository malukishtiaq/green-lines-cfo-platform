import { ERPType, ERPSyncResult } from '@/domain/entities/ERPIntegration';
import { ERPIntegrationFactory } from '@/infrastructure/services/ERPIntegrationFactory';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import { prisma } from '@/lib/prisma';

/**
 * Use Case: Sync ERP Data
 * 
 * Triggers a data sync from customer's ERP to platform.
 * Logs the sync history and updates connection status.
 */
export class SyncERPDataUseCase {
  async execute(
    connectionId: string,
    domains: string[],
    triggeredBy?: string
  ): Promise<{
    success: boolean;
    syncResult?: ERPSyncResult;
    message: string;
  }> {
    const startTime = new Date();

    try {
      // 1. Get connection from database
      const dbConnection = await prisma.eRPConnection.findUnique({
        where: { id: connectionId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
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
          message: `Cannot sync: Connection status is ${dbConnection.status}`,
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

      // 6. Sync data
      console.log(`Starting ERP sync for customer: ${dbConnection.customer.name}`);
      const syncResult = await erpService.syncData(connection, domains);

      // 7. Update connection with sync results
      await prisma.eRPConnection.update({
        where: { id: connectionId },
        data: {
          lastSyncDate: new Date(),
          lastSyncStatus: syncResult.success ? 'SUCCESS' : 'FAILED',
          lastSyncError: syncResult.errors.length > 0 ? syncResult.errors.join('; ') : null,
          dataDomains: domains, // Update synced domains
        },
      });

      // 8. Log sync history
      await prisma.eRPSyncHistory.create({
        data: {
          connectionId,
          syncType: 'MANUAL',
          status: syncResult.success ? 'SUCCESS' : 'FAILED',
          recordsProcessed: syncResult.recordsProcessed,
          recordsSkipped: syncResult.recordsSkipped,
          errors: syncResult.errors,
          warnings: syncResult.warnings,
          startTime: syncResult.startTime,
          endTime: syncResult.endTime,
          duration: syncResult.duration,
          triggeredBy: triggeredBy || 'SYSTEM',
          dataDomainsSynced: domains,
        },
      });

      return {
        success: syncResult.success,
        syncResult,
        message: syncResult.success
          ? `Successfully synced ${syncResult.recordsProcessed} records`
          : `Sync completed with errors: ${syncResult.errors.join(', ')}`,
      };
    } catch (error: any) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.error('Error syncing ERP data:', error);

      // Log failed sync
      try {
        await prisma.eRPSyncHistory.create({
          data: {
            connectionId,
            syncType: 'MANUAL',
            status: 'FAILED',
            recordsProcessed: 0,
            recordsSkipped: 0,
            errors: [error.message],
            warnings: [],
            startTime,
            endTime,
            duration,
            triggeredBy: triggeredBy || 'SYSTEM',
            dataDomainsSynced: domains,
          },
        });

        // Update connection status
        await prisma.eRPConnection.update({
          where: { id: connectionId },
          data: {
            lastSyncStatus: 'FAILED',
            lastSyncError: error.message,
          },
        });
      } catch (logError) {
        console.error('Error logging sync failure:', logError);
      }

      return {
        success: false,
        message: error.message || 'Failed to sync ERP data',
      };
    }
  }
}

