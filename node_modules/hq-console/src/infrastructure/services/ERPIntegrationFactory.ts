import { ERPType } from '@/domain/entities/ERPIntegration';
import { IERPIntegrationService } from '@/domain/services/IERPIntegrationService';
import { OdooIntegrationService } from './OdooIntegrationService';
import { SalesforceIntegrationService } from './SalesforceIntegrationService';

/**
 * Factory for creating ERP integration service instances
 */
export class ERPIntegrationFactory {
  private static services: Map<ERPType, IERPIntegrationService> = new Map();

  /**
   * Get ERP integration service for specific type
   */
  static getService(type: ERPType): IERPIntegrationService {
    // Return cached instance if exists
    if (this.services.has(type)) {
      return this.services.get(type)!;
    }

    // Create new instance
    let service: IERPIntegrationService;

    switch (type) {
      case ERPType.ODOO:
        service = new OdooIntegrationService();
        break;

      case ERPType.SALESFORCE:
        service = new SalesforceIntegrationService();
        break;

      case ERPType.SAP:
        // TODO: Implement SAP integration
        throw new Error('SAP integration not implemented yet');

      case ERPType.ZOHO:
        // TODO: Implement Zoho integration
        throw new Error('Zoho integration not implemented yet');

      case ERPType.QUICKBOOKS:
        // TODO: Implement QuickBooks integration
        throw new Error('QuickBooks integration not implemented yet');

      case ERPType.ORACLE:
        // TODO: Implement Oracle integration
        throw new Error('Oracle integration not implemented yet');

      case ERPType.NONE:
        throw new Error('Cannot create service for NONE type');

      default:
        throw new Error(`Unsupported ERP type: ${type}`);
    }

    // Cache the instance
    this.services.set(type, service);

    return service;
  }

  /**
   * Get all available ERP types
   */
  static getAvailableERPTypes(): ERPType[] {
    return [
      ERPType.ODOO,
      ERPType.SALESFORCE,
      // ERPType.SAP, // Uncomment when implemented
      // ERPType.ZOHO,
      // ERPType.QUICKBOOKS,
      // ERPType.ORACLE,
    ];
  }

  /**
   * Check if ERP type is supported
   */
  static isSupported(type: ERPType): boolean {
    return this.getAvailableERPTypes().includes(type);
  }
}

