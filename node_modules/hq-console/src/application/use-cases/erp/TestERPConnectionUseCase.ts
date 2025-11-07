import { ERPType, ERPCredentials } from '@/domain/entities/ERPIntegration';
import { ERPIntegrationFactory } from '@/infrastructure/services/ERPIntegrationFactory';

/**
 * Use Case: Test ERP Connection
 * 
 * Tests ERP credentials without saving to database.
 * This is used before creating a connection to validate credentials.
 */
export class TestERPConnectionUseCase {
  async execute(erpType: ERPType, credentials: ERPCredentials): Promise<{
    success: boolean;
    message: string;
    serverInfo?: any;
  }> {
    try {
      // 1. Validate ERP type is supported
      if (!ERPIntegrationFactory.isSupported(erpType)) {
        return {
          success: false,
          message: `ERP type ${erpType} is not supported`,
        };
      }

      // 2. Get appropriate ERP service
      const erpService = ERPIntegrationFactory.getService(erpType);

      // 3. Test connection
      const result = await erpService.testConnection(credentials);

      return result;
    } catch (error: any) {
      console.error('Error testing ERP connection:', error);
      return {
        success: false,
        message: error.message || 'Failed to test connection',
      };
    }
  }
}

