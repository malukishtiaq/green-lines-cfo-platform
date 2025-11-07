# ERP Integration Infrastructure

## Overview
This implementation provides a comprehensive ERP integration framework supporting multiple ERP systems (Odoo, Salesforce, SAP, Zoho, QuickBooks, Oracle).

## Architecture

### 1. Domain Layer (`src/domain/`)
- **entities/ERPIntegration.ts**: Core types and interfaces
  - `ERPType`: Enum for supported ERPs
  - `ERPStatus`: Connection status
  - `ERPCredentials`: Authentication details for each ERP
  - `ERPConnection`: Connection state
  - `ERPSyncResult`: Sync operation results
  - Financial data structures: Customer, Invoice, Payment, Transaction, SalesOrder

### 2. Service Layer (`src/domain/services/`)
- **IERPIntegrationService.ts**: Interface that all ERP integrations must implement
  - `testConnection()`: Test ERP credentials
  - `connect()`: Establish connection
  - `disconnect()`: Close connection
  - `syncData()`: Sync data from ERP
  - `getCustomers()`: Fetch customer data
  - `getInvoices()`: Fetch invoices
  - `getPayments()`: Fetch payments
  - `getAccountTransactions()`: Fetch GL transactions
  - `getSalesOrders()`: Fetch sales orders
  - `getChartOfAccounts()`: Fetch COA
  - `refreshToken()`: Refresh OAuth tokens
  - `validateMapping()`: Validate field mappings

### 3. Infrastructure Layer (`src/infrastructure/services/`)

#### OdooIntegrationService.ts
- Connects to Odoo using JSON-RPC API
- Authenticates with username/password
- Supports:
  - Customer sync (res.partner)
  - Invoice sync (account.move)
  - Payment sync (account.payment)
  - Sales orders (sale.order)
  - Chart of Accounts
- Uses Odoo's `/web/session/authenticate` endpoint
- Query data using `/web/dataset/search_read`

#### SalesforceIntegrationService.ts
- Connects to Salesforce using OAuth 2.0
- Supports username/password flow
- Token refresh capability
- Supports:
  - Account/Customer sync
  - Opportunity sync (as sales orders)
  - Custom invoice/payment objects
- Uses Salesforce REST API v58.0
- Query data using SOQL

#### ERPIntegrationFactory.ts
- Factory pattern for creating ERP service instances
- Singleton management (cached instances)
- `getService(type)`: Get service for specific ERP
- `getAvailableERPTypes()`: List supported ERPs
- `isSupported(type)`: Check if ERP is supported

## Implementation Status

### ✅ Fully Implemented
1. **Odoo Integration**
   - Authentication
   - Customer sync
   - Invoice sync
   - Payment sync
   - Connection testing

2. **Salesforce Integration**
   - OAuth authentication
   - Account/Customer sync
   - Opportunity sync
   - Token refresh
   - Connection testing

### 🚧 Partial Implementation
- Sales orders (Odoo)
- Chart of Accounts (Odoo)
- GL transactions (both)

### ⏳ Not Implemented Yet
- SAP
- Zoho
- QuickBooks
- Oracle
- Microsoft Dynamics

## Usage Examples

### 1. Test Connection

```typescript
import { ERPIntegrationFactory } from '@/infrastructure/services/ERPIntegrationFactory';
import { ERPType, ERPCredentials } from '@/domain/entities/ERPIntegration';

// Test Odoo connection
const odooService = ERPIntegrationFactory.getService(ERPType.ODOO);

const credentials: ERPCredentials = {
  type: ERPType.ODOO,
  odooUrl: 'https://your-odoo-instance.com',
  odooDatabase: 'your_database',
  odooUsername: 'admin',
  odooPassword: 'your_password',
};

const result = await odooService.testConnection(credentials);
console.log(result); // { success: true, message: '...', serverInfo: {...} }
```

### 2. Connect and Sync Data

```typescript
// Connect
const connection = await odooService.connect(credentials);

// Sync data
const syncResult = await odooService.syncData(connection, ['AR', 'AP', 'Sales']);
console.log(`Processed ${syncResult.recordsProcessed} records`);

// Get customers
const customers = await odooService.getCustomers(connection);

// Get invoices
const invoices = await odooService.getInvoices(
  connection,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
```

### 3. Salesforce Example

```typescript
// Test Salesforce connection
const sfService = ERPIntegrationFactory.getService(ERPType.SALESFORCE);

const sfCredentials: ERPCredentials = {
  type: ERPType.SALESFORCE,
  salesforceClientId: 'your_client_id',
  salesforceClientSecret: 'your_client_secret',
  salesforceUsername: 'user@company.com',
  salesforcePassword: 'your_password',
  salesforceSecurityToken: 'your_security_token',
};

const sfResult = await sfService.testConnection(sfCredentials);

// Connect and fetch data
const sfConnection = await sfService.connect(sfCredentials);
const accounts = await sfService.getCustomers(sfConnection);
const opportunities = await sfService.getSalesOrders(sfConnection);
```

## Next Steps

### 1. Create API Endpoints
Create REST API endpoints to:
- Test ERP connections
- Save ERP credentials securely
- Trigger data sync
- Monitor sync status
- View sync history

### 2. Create UI Components
Build UI for:
- ERP configuration form
- Connection status dashboard
- Data mapping interface
- Sync schedule configuration
- Error logs viewer

### 3. Database Schema
Add tables for:
- `erp_connections`: Store connection details
- `erp_sync_history`: Log sync operations
- `erp_data_mappings`: Store field mappings
- `erp_sync_schedule`: Automated sync configuration

### 4. Security
- Encrypt credentials in database
- Use environment variables for sensitive data
- Implement token rotation
- Add rate limiting
- Audit logging

### 5. Error Handling
- Retry logic for failed syncs
- Exponential backoff
- Dead letter queue for failed records
- Alert notifications

### 6. Performance
- Batch processing for large datasets
- Incremental sync (delta sync)
- Background job processing
- Caching layer

## File Structure

```
apps/hq-console/src/
├── domain/
│   ├── entities/
│   │   └── ERPIntegration.ts          # Types & interfaces
│   └── services/
│       └── IERPIntegrationService.ts  # Service interface
└── infrastructure/
    └── services/
        ├── OdooIntegrationService.ts       # Odoo implementation
        ├── SalesforceIntegrationService.ts # Salesforce implementation
        └── ERPIntegrationFactory.ts        # Factory pattern
```

## Dependencies Required

Add to `package.json`:
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "jsforce": "^2.0.0-beta.28",  // For Salesforce (alternative)
    "xml2js": "^0.6.2"            // For XML-RPC if needed
  }
}
```

## Environment Variables

```env
# Odoo
ODOO_URL=https://your-instance.odoo.com
ODOO_DATABASE=your_db
ODOO_USERNAME=admin
ODOO_PASSWORD=your_password

# Salesforce
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_USERNAME=user@company.com
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_token
```

## Testing

Create test files:
- `OdooIntegrationService.test.ts`
- `SalesforceIntegrationService.test.ts`
- `ERPIntegrationFactory.test.ts`

Use mock data and test connections without actual API calls.

## Monitoring

Implement monitoring for:
- Connection health checks
- Sync success/failure rates
- API response times
- Data quality metrics
- Error patterns

## Documentation

API documentation for each ERP:
- Odoo: https://www.odoo.com/documentation/16.0/developer/reference/external_api.html
- Salesforce: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/
- SAP: https://help.sap.com/docs/
- Zoho: https://www.zoho.com/creator/help/api/

