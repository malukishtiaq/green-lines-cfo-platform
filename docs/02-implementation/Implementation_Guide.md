# HQ Console Implementation Guide

**Last Updated**: November 14, 2025  
**Current Status**: ERP Integration & KPI System (35% Complete)  
**Current Focus**: Implementing 12 Core KPIs from Odoo

---

## 🎯 **HOW TO USE THIS DOCUMENT**

**IMPORTANT**: This document is a detailed implementation reference. For current status, always start with:
- 📘 **`docs/CURRENT_STATUS.md`** ⭐ **Start here for every session**

This document contains:
1. **What's Built** - Completed features with technical details
2. **What's Pending** - Remaining work organized by priority
3. **Technical Specifications** - Detailed implementation requirements
4. **Progress Tracking** - Check `docs/02-implementation/Progress_Tracker.md`

---

## ✅ **WHAT'S ALREADY BUILT (35% Complete)**

### Foundation ✅ 100% COMPLETE
- Clean Architecture (4 layers: domain, application, infrastructure, presentation)
- Multi-language (Arabic RTL + English LTR) with next-intl
- Authentication (NextAuth.js with role-based access)
- Database (PostgreSQL + Prisma with encryption)
- Design System (Ant Design Pro + custom theme)
- HTTP Client (centralized axios with logging)
- Access Control (8 roles, 20+ permissions)

### Dashboard ✅ 100% COMPLETE
- KPI cards: Total Plans Initiated, Open Plans, Closed Plans, Total Partners
- Filters: Date Range, Region, Industry, Partner Tier, Plan Type, Status
- Charts: Customers by Region (Bar), Plans Trend (Line with conversion rate)
- Actions: Create Plan, Invite Partner, Export Dashboard
- Full translations (English + Arabic) with RTL support
- 3 API endpoints operational

### ERP Integration 🔄 60% COMPLETE

#### Infrastructure ✅
- Domain entities (`ERPIntegration.ts`) - Complete
- Service interfaces (`IERPIntegrationService.ts`) - Complete
- Odoo integration service with session-based auth - Complete
- Salesforce integration service (OAuth 2.0) - Complete
- ERP Integration Factory (singleton pattern) - Complete
- Encryption service for credentials - Complete

#### Database Models ✅
- `ERPConnection` - Stores connection details with encrypted credentials
- `ERPSyncHistory` - Logs all sync operations

#### API Endpoints ✅ (5 endpoints)
- `POST /api/erp/test-connection` - Test ERP credentials
- `GET /api/erp/connections` - List all connections
- `POST /api/erp/connections/[id]/reconnect` - Reconnect expired session
- `POST /api/erp/connections/[id]/sync` - Trigger data sync
- `GET /api/erp/test/pos-orders` - Testing endpoint

#### UI Pages ✅
- `/erp` - ERP Integration dashboard
- `/erp/test` - ERP testing page
- `ERPConnectionStatus` component

#### Odoo Session-Based Authentication ✅
**Key Innovation**: Session management with `callKw()` method

```typescript
// Authenticate and extract session_id from cookies
POST /web/session/authenticate
→ Extract session_id from set-cookie header
→ Store for subsequent calls

// Use session_id for all API calls
POST /web/dataset/call_kw/{model}/{method}
Headers: Cookie: session_id=EXTRACTED_ID
```

**Documentation**: `docs/05-architecture/ERP_Integration_Guide.md`

### KPI System 🔄 8% COMPLETE

#### Implemented ✅
**Revenue Growth % (FIN.REV_GROWTH%)**:
- Endpoint: `GET /api/erp/kpi/revenue-growth`
- Formula: `(Revenue_t - Revenue_{t-1}) / Revenue_{t-1} × 100`
- Data Source: Odoo `account.move` (posted invoices/refunds)
- Features: Custom date ranges, period comparison
- Status: Tested with live Odoo instance

#### Not Started ⏳ (11 Core KPIs)
See `docs/Technology_Research/KPI_Implementation_Status.md` for full tracker

**Financial**: Operating Margin %, Net Profit Margin %, EBITDA Margin %
**Working Capital**: DSO, DPO, DIO, Cash Conversion Cycle
**Inventory**: Inventory Turnover
**Profitability**: ROA %, ROE %, ROCE %

### Plan Builder 🔄 25% COMPLETE
- ✅ Stage 1: Client & Scope Selection
- ✅ Stage 4: Milestones
- ⏳ Stages 2, 3, 5, 6, 7, 8 (pending)

### Partners Page 🔄 30% COMPLETE
- ✅ Basic CRUD operations
- ⏳ Advanced filtering, tiers, performance metrics

---

## 📋 **WHAT'S PENDING - CURRENT PRIORITIES**

### **PRIORITY 1: Complete KPI System** (Current Focus - Approved by Management)

This is the **highest priority** work approved by management.

#### **Step 1: Implement Remaining 11 Core KPIs** (2-3 weeks)

**Approach**: Follow the Revenue Growth pattern for each KPI

**Phase 1A: Financial Margin KPIs** (Week 1)
1. **Operating Margin %** (`FIN.OP_MARGIN%`)
   - Formula: `Operating Income / Revenue × 100`
   - Models: `account.move`, `account.move.line`
   - Endpoint: `/api/erp/kpi/operating-margin`
   
2. **Net Profit Margin %** (`FIN.NET_MARGIN%`)
   - Formula: `Net Income / Revenue × 100`
   - Models: `account`, `account.move.line`
   - Endpoint: `/api/erp/kpi/net-margin`
   
3. **EBITDA Margin %** (`FIN.EBITDA_MARGIN%`)
   - Formula: `EBITDA / Revenue × 100`
   - Models: `account`, `account.move.line`
   - Endpoint: `/api/erp/kpi/ebitda-margin`

**Phase 1B: Working Capital KPIs** (Week 2)
4. **Days Sales Outstanding** (`WC.DSO`)
   - Formula: `(Average AR / Credit Sales) × Days`
   - Models: `account.move`, `stock.move`
   - Endpoint: `/api/erp/kpi/dso`
   
5. **Days Payables Outstanding** (`WC.DPO`)
   - Formula: `(Average AP / Purchases or COGS) × Days`
   - Models: Multiple models
   - Endpoint: `/api/erp/kpi/dpo`

**Phase 1C: Inventory & Profitability KPIs** (Week 3)
6. **Days Inventory Outstanding** (`WC.DIO`)
   - Formula: `(Average Inventory / COGS) × Days`
   - Models: `inventory`, COGS
   - Endpoint: `/api/erp/kpi/dio`
   - **Dependency**: Requires stock module

7. **Cash Conversion Cycle** (`WC.CCC`)
   - Formula: `DIO + DSO - DPO`
   - Models: Derived from above
   - Endpoint: `/api/erp/kpi/ccc`
   
8. **Inventory Turnover** (`INV.TURN`)
   - Formula: `COGS / Average Inventory`
   - Models: `inventory`, COGS
   - Endpoint: `/api/erp/kpi/inventory-turnover`

9. **Return on Assets %** (`FIN.ROA%`)
   - Formula: `Net Income / Avg Total Assets × 100`
   - Models: `account`, GL Balance Sheet
   - Endpoint: `/api/erp/kpi/roa`

10. **Return on Equity %** (`FIN.ROE%`)
    - Formula: `Net Income / Avg Equity × 100`
    - Models: `account`, GL Balance Sheet
    - Endpoint: `/api/erp/kpi/roe`

11. **Return on Capital Employed %** (`FIN.ROCE%`)
    - Formula: `EBIT / (Total Assets - Current Liabilities) × 100`
    - Models: `account`, Balance Sheet
    - Endpoint: `/api/erp/kpi/roce`

**Testing Requirements for Each KPI**:
- Test with live Odoo instance (`https://testing.glsystem.ae`)
- Validate formula matches Excel specification
- Performance target: < 2 seconds response time
- Handle edge cases (zero revenue, missing data, etc.)
- Comprehensive error handling

**Documentation**: `docs/Technology_Research/KPI_Implementation_Status.md`

---

#### **Step 2: KPI Database Schema** (3-5 days)

Add to `prisma/schema.prisma`:

```prisma
// Master catalog of all available KPIs
model KPICatalog {
  id              String   @id @default(uuid())
  code            String   @unique  // e.g., "FIN.REV_GROWTH%"
  name            String             // e.g., "Revenue Growth %"
  formula         String             // Formula description
  purpose         String             // What it measures
  dataSource      String             // Where data comes from
  industry        String             // Cross-Industry, Retail, etc.
  odooModels      String[]           // Required Odoo models
  isCore          Boolean  @default(false) // Core = yellow in catalog
  category        String             // Financial, Working Capital, etc.
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  planKPIs        PlanKPI[]
  
  @@index([isCore, category])
}

// KPIs selected for a specific service plan
model PlanKPI {
  id                String   @id @default(uuid())
  servicePlanId     String
  kpiCatalogId      String
  targetValue       Float              // Target to achieve
  thresholdGreen    Float              // Green if >= this
  thresholdAmber    Float              // Amber if >= this
  thresholdRed      Float              // Red if < this
  weight            Float              // Weight in overall score (must total 100%)
  effectiveFrom     DateTime
  effectiveTo       DateTime?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  servicePlan       ServicePlan  @relation(fields: [servicePlanId], references: [id], onDelete: Cascade)
  kpiCatalog        KPICatalog   @relation(fields: [kpiCatalogId], references: [id])
  results           KPIResult[]
  
  @@unique([servicePlanId, kpiCatalogId])
  @@index([servicePlanId, isActive])
}

// Historical KPI calculation results
model KPIResult {
  id              String   @id @default(uuid())
  planKPIId       String
  periodStart     DateTime
  periodEnd       DateTime
  actualValue     Float              // Calculated value
  targetValue     Float              // Target at time of calculation
  variance        Float              // (actual - target) / target * 100
  status          String             // GREEN / AMBER / RED
  calculatedAt    DateTime @default(now())
  dataSourceType  String             // ODOO / SALESFORCE / MANUAL
  calculationTime Int                // Milliseconds to calculate
  rawData         Json?              // Store API response for debugging
  errorMessage    String?            // If calculation failed
  
  planKPI         PlanKPI  @relation(fields: [planKPIId], references: [id], onDelete: Cascade)
  
  @@index([planKPIId, periodStart])
  @@index([calculatedAt])
}
```

**Migration Steps**:
1. Add models to schema
2. Run `npm run db:generate`
3. Run `npm run db:push`
4. Seed `KPICatalog` with 12 Core KPIs from Master_KPI_Catalog

---

#### **Step 3: KPI Infrastructure** (5-7 days)

**A. KPI Calculation Service**
```typescript
// File: src/application/services/KPICalculationService.ts

interface IKPICalculationService {
  calculateKPI(
    kpiCode: string,
    connectionId: string,
    startDate: Date,
    endDate: Date
  ): Promise<KPIResult>;
  
  calculateMultipleKPIs(
    kpiCodes: string[],
    connectionId: string,
    startDate: Date,
    endDate: Date
  ): Promise<KPIResult[]>;
  
  scheduleKPIRefresh(planId: string, frequency: 'HOURLY' | 'DAILY' | 'WEEKLY'): Promise<void>;
}
```

**B. KPI Caching Strategy**
- Cache results in database (`KPIResult` model)
- Cache expiry: 1 hour for real-time KPIs, 24 hours for historical
- Manual refresh available via API
- Background job for scheduled refresh

**C. API Endpoints**
```typescript
GET  /api/kpis/catalog              // List all available KPIs
GET  /api/kpis/catalog/:code        // Get single KPI details
POST /api/plans/:id/kpis            // Add KPI to plan
GET  /api/plans/:id/kpis            // List KPIs for plan
PUT  /api/plans/:id/kpis/:kpiId     // Update KPI targets/thresholds
DELETE /api/plans/:id/kpis/:kpiId   // Remove KPI from plan
GET  /api/plans/:id/kpis/:kpiId/calculate  // Calculate/refresh KPI
GET  /api/plans/:id/kpis/calculate-all     // Calculate all plan KPIs
```

---

### **PRIORITY 2: KPI User Interface** (After Priority 1)

#### **Plan Builder Stage 3: KPI Selection** (3-5 days)

**Features**:
- Searchable/filterable KPI catalog
- Category filter (Financial, Working Capital, etc.)
- Industry filter
- "Add to Plan" button
- Selected KPIs list with:
  - Target value input
  - Threshold sliders (Green/Amber/Red)
  - Weight input (auto-validates total = 100%)
  - Remove button
- Preview: Show overall KPI mix pie chart
- Save: Add to `PlanKPI` table

**UI File**: `apps/hq-console/src/app/plans/new/page.tsx` (Stage 3 tab)

---

#### **Plan Monitor Tab 2: KPI Dashboard** (5-7 days)

**Features**:
- KPI overview table:
  - Columns: KPI Name, Target, Actual, Variance %, Status, Last Updated
  - Color-coded rows (green/amber/red)
  - Sort by any column
  - Filter by status
- "Refresh All KPIs" button
- Individual KPI cards:
  - Current value vs target
  - Trend line (last 6 periods)
  - Drill-down to detail view
- Charts:
  - Overall KPI score gauge
  - Category performance (radar chart)
  - Trend over time (line chart)
- Export to Excel/PDF

**UI File**: `apps/hq-console/src/app/plans/[id]/monitor/page.tsx` (KPIs tab)

---

#### **Dashboard KPI Widgets** (2-3 days)

**Features**:
- Top 3 performing KPIs (green)
- Top 3 underperforming KPIs (red/amber)
- Overall KPI health score
- Click to navigate to Plan Monitor

**UI File**: `apps/hq-console/src/presentation/components/dashboard/KPIWidget.tsx`

---

### **PRIORITY 3: Complete Plan Builder** (After KPI UI)

Stages 2, 5, 6, 7, 8 as originally planned in this document (see below for detailed specs).

---

### **PRIORITY 4: Plan Monitor Full Implementation** (After Plan Builder)

All 7 tabs with full functionality.

---

## 🔧 **TECHNICAL REFERENCE**

### Original Plan Builder Stages (Lower Priority)

**Note**: These are deferred until KPI system is complete.
- [ ] Connection status indicator
- [ ] Data Domains checkboxes (AR, AP, GL, Sales, Inventory)
- [ ] Mapping Health % display
- [ ] "Connect ERP" button
- [ ] "Test Sync" button  
- [ ] "Import CSV" button

Database Changes:
// Add to ServicePlan model
erpConnection   Json?    // { type, status, lastSync, mappingHealth }
dataDomains     String[] // ["AR", "AP", "GL", "SALES"]
```

**Stage 3 — KPIs & Targets** ❌
```
Tasks:
- [ ] Import KPI catalog from docs/Technology_Research/Master_KPI_Catalog_Expanded.xlsx
- [ ] KPI selection interface (searchable, filterable)
- [ ] For each KPI: Target, Thresholds (Green/Amber/Red %), Weight %, Calc Source, Dates
- [ ] Weight validation (must total 100%)
- [ ] "Add KPI" + "Bulk Edit" buttons

New Database Model:
model PlanKPI {
  id                String   @id @default(uuid())
  servicePlanId     String
  kpiName           String
  targetValue       Float
  thresholdGreen    Float
  thresholdAmber    Float
  thresholdRed      Float
  weight            Float
  calculationSource String
  effectiveFrom     DateTime
  effectiveTo       DateTime?
  actualValue       Float?
  status            String?
  servicePlan       ServicePlan @relation(fields: [servicePlanId], references: [id])
}
```

**Stage 5 — Workflow & Governance** ❌
```
Tasks:
- [ ] Approval Policy: Mode A/B/C radio buttons
- [ ] Notification Channels: Email/SMS/Push/In-App checkboxes
- [ ] Report Cadence: Weekly/Bi-weekly/Monthly/Quarterly dropdown
- [ ] SLA Settings: Response time, Escalation rules, Auto-escalation toggle

Database Changes:
// Add to ServicePlan model
governancePolicy Json? // { approvalMode, notificationChannels, reportCadence, slaResponseHours, escalationEnabled }
```

**Stage 6 — Pricing & Commercials** ❌
```
Tasks:
- [ ] Package selector (Basic/Standard/Premium/Custom)
- [ ] Add-ons multi-select (Extra users/Advanced reporting/API/Support)
- [ ] Commission Model (Platform %/Partner %/Revenue share)
- [ ] Payout Delay (30/60/90 days)
- [ ] Contract Dates + Payment Terms
- [ ] "Calculate Total" + "Download Proposal" (PDF) buttons

New Database Model:
model PlanPricing {
  id                    String   @id @default(uuid())
  servicePlanId         String   @unique
  package               String
  addOns                String[]
  basePrice             Float
  totalPrice            Float
  platformCommissionPct Float
  partnerCommissionPct  Float
  payoutDelayDays       Int
  refundPolicy          String
  contractStartDate     DateTime
  contractEndDate       DateTime
  paymentTerms          String
  proposalGenerated     Boolean  @default(false)
  proposalPath          String?
  servicePlan           ServicePlan @relation(fields: [servicePlanId], references: [id])
}
```

**Stage 7 — Assignments & Partner Selection** ❌
```
Tasks:
- [ ] Assignment Items table
- [ ] For each: Type/Partner/Owner/SLA/Due Date/Priority/Notes/Attachments
- [ ] "Add Assignment" + "Create Assignments" + "Notify Partner" buttons

New Database Model:
model Assignment {
  id              String   @id @default(uuid())
  servicePlanId   String
  type            String
  partnerId       String?
  assignmentOwner String
  slaHours        Int
  dueDate         DateTime
  priority        String
  status          String   @default("PENDING")
  notes           String?
  attachments     String[]
  notifyPartner   Boolean  @default(true)
  servicePlan     ServicePlan @relation(fields: [servicePlanId], references: [id])
  partner         Partner? @relation(fields: [partnerId], references: [id])
}
```

**Stage 8 — Review & Approval** ⚠️ Enhance
```
Tasks:
- [ ] Summary panel for ALL 8 stages
- [ ] Risk Checklist (5 checkboxes)
- [ ] Legal Confirmation checkbox
- [ ] "Save Draft" / "Submit for Approval" / "Approve & Activate" buttons
- [ ] Email notifications on approval
```

---

#### **Week 2: Build Plan Monitor Page** ❌

**NEW PAGE: `/plans/[id]/monitor`**

```
Header Section:
- [ ] Client/Plan/Period/Status/ERP Status/Last Sync/Mapping Health

Action Buttons:
- [ ] Sync Now / Generate Report / Publish to CFO App / Export / Reforecast / Escalate / Book Meeting

Tab 1: Overview
- [ ] Top KPI Cards (4-6 from Stage 3)
- [ ] Milestone Timeline (visual)
- [ ] Budget vs Actual chart
- [ ] Alerts + Notes & @Mentions

Tab 2: KPIs
- [ ] Table: KPI/Target/Actual/Variance/Status/Owner/Last Update
- [ ] Color coding (Green/Amber/Red)
- [ ] Drill-down charts
- [ ] "Edit Targets" button
- [ ] API: GET /api/plans/[id]/kpis

Tab 3: Tasks & Risks
- [ ] Kanban view (Backlog/In Progress/Blocked/Done)
- [ ] "Create Task" + "Create Risk" buttons
- [ ] Drag-and-drop

Tab 4: Exceptions
- [ ] Auto-detected issues table
- [ ] Actions: Assign/Create Task/Mute/Add Note
- [ ] Auto-detection engine

Tab 5: Integration
- [ ] ERP Connection details
- [ ] Field Mapping coverage %
- [ ] Sync Logs
- [ ] Actions: Connect/Fix/Test/Sync

Tab 6: Activity Log
- [ ] Audit trail: Who/What/Before/After/Reason/Timestamp
- [ ] Filters + Search + Export CSV

Tab 7: Reports
- [ ] Templates: Executive/CFO Deep-Dive/Operations/Exceptions
- [ ] "Include Commentary" toggle
- [ ] Generate/Publish/Download actions

Governed Changes Drawer:
- [ ] Change Type/Before/After/Reason/Impacted KPIs/Effective Date
- [ ] Approval flow (Mode A/B/C)
- [ ] "Submit Change Request" button

New Database Models:
model PlanTask {
  id            String   @id
  servicePlanId String
  title         String
  kpiId         String?
  owner         String
  slaHours      Int
  dueDate       DateTime
  priority      String
  status        String
  comments      Json[]
  servicePlan   ServicePlan @relation(fields: [servicePlanId], references: [id])
}

model PlanRisk {
  id            String   @id
  servicePlanId String
  title         String
  impact        String
  likelihood    Int
  mitigation    String
  trigger       String
  watchers      String[]
  status        String   @default("OPEN")
  servicePlan   ServicePlan @relation(fields: [servicePlanId], references: [id])
}

model PlanException {
  id            String   @id
  servicePlanId String
  type          String
  severity      String
  detectedAt    DateTime @default(now())
  owner         String?
  status        String   @default("OPEN")
  notes         String?
  resolvedAt    DateTime?
  servicePlan   ServicePlan @relation(fields: [servicePlanId], references: [id])
}

model PlanActivityLog {
  id            String   @id
  servicePlanId String
  userId        String
  action        String
  entityType    String
  entityId      String?
  before        Json?
  after         Json?
  reason        String?
  attachments   String[]
  timestamp     DateTime @default(now())
  servicePlan   ServicePlan @relation(fields: [servicePlanId], references: [id])
}
```

---

#### **Week 3: Build Assignments Page** ❌

**NEW PAGE: `/assignments`**

```
Mini-Dashboard:
- [ ] 4 KPI cards: Open/In Progress/Closed/Overdue

Filters:
- [ ] Status/Region/Partner/Client/Plan/Due Date/Owner
- [ ] "Clear Filters" button

Assignments Table:
- [ ] Columns: Assignment No./Plan ID/Client/Assignment/Partner/Status/Owner/SLA/Priority/Last Update/Actions
- [ ] Sort + Pagination + Bulk actions

Row Actions:
- [ ] View / Edit / Reassign / Close / Add Note

Assignment Detail Drawer:
- [ ] Full details + Activity timeline + Attachments + Comments + Status update + Partner communication

API Endpoints:
- [ ] GET /api/assignments (with filters)
- [ ] GET /api/assignments/[id]
- [ ] PUT /api/assignments/[id]
- [ ] POST /api/assignments/[id]/reassign
- [ ] POST /api/assignments/[id]/close
- [ ] POST /api/assignments/[id]/notes
```

---

### **PHASE 2: Client & Partner Management** (2 Weeks) - Not Started

**Week 4: Complete Partners Page**
- [ ] Add Tier/Tax ID/Website/Entity fields
- [ ] Multiple contacts per partner
- [ ] Attachments/documents
- [ ] Capabilities matrix
- [ ] Partner tiers (Platinum/Gold/Silver/Bronze)
- [ ] "Save & Invite" + "Block" actions
- [ ] Performance metrics + Rating system

**Week 5: Build CRM Page** (NEW PAGE: `/crm`)
- [ ] Customer profiles CRUD
- [ ] Multiple contacts per customer
- [ ] Document attachments (Trade License/VAT/Agreements)
- [ ] Notes & tags system
- [ ] Customer status workflow
- [ ] "Save & Invite" action
- [ ] History timeline
- [ ] Quick filters

---

### **PHASE 3: Financial & Scheduling** (2 Weeks) - Not Started

**Week 6: Build Billing Page** (NEW PAGE: `/billing`)
- [ ] Dashboard: Billed/Collected/Outstanding/Commissions
- [ ] Charts: Collections Trend/Commissions by Partner
- [ ] Transactions table
- [ ] Invoice/Payment/Refund management
- [ ] Commission calculation engine
- [ ] Payout management
- [ ] Export (Excel/PDF)

**Week 7: Build Calendar Page** (NEW PAGE: `/calendar`)
- [ ] Views: Month/Week/Day/Agenda
- [ ] Create meeting modal
- [ ] Color-coded by client/plan
- [ ] Drag-and-drop reschedule
- [ ] O365/Google Calendar integration
- [ ] Meeting reminders
- [ ] Participant management

---

### **PHASE 4: Enhancement & Polish** (1 Week) - Not Started

**Week 8: Complete Dashboard + Global Features**
- [ ] Dashboard: Proper KPIs/Charts/Filters per spec
- [ ] Global search (plans/customers/partners)
- [ ] Date range filters (MTD/QTD/YTD/Custom)
- [ ] Org/Region filters
- [ ] Currency selector
- [ ] Notifications dropdown
- [ ] Real-time notifications (WebSockets)

---

## 📅 **IMPLEMENTATION TIMELINE**

| Phase | Duration | Status | Completion | Business Value |
|-------|----------|--------|------------|----------------|
| Foundation | ✅ Done | Complete | 100% | Infrastructure |
| **Phase 1** | **3 weeks** | **→ START HERE** | **0% → 70%** | **Core workflow** |
| Phase 2 | 2 weeks | Pending | 70% → 85% | Client/Partner mgmt |
| Phase 3 | 2 weeks | Pending | 85% → 95% | Financial/Calendar |
| Phase 4 | 1 week | Pending | 95% → 100% | Polish |
| **TOTAL** | **8 weeks** | **In Progress** | **25% → 100%** | **Full spec** |

---

## 📊 **PROGRESS TRACKING**

### Phase 1 Week 1: Plan Builder Stages
- [ ] Day 1-2: Stage 2 (ERP Connection)
- [ ] Day 3-4: Stage 3 (KPIs) + Database schema
- [ ] Day 5: Stage 5 (Governance)
- **Status**: Not Started
- **Last Updated**: Nov 4, 2025

### Phase 1 Week 2: Plan Monitor
- [ ] Day 1: Header + CTAs + Overview tab
- [ ] Day 2: KPIs tab + Tasks & Risks tab
- [ ] Day 3: Exceptions tab + Integration tab
- [ ] Day 4: Activity Log tab + Reports tab
- [ ] Day 5: Governed Changes drawer + Testing
- **Status**: Not Started

### Phase 1 Week 3: Assignments + Final Stages
- [ ] Day 1-2: Stage 6 (Pricing) + Stage 7 (Assignments)
- [ ] Day 3: Stage 8 (Review & Approval)
- [ ] Day 4-5: Assignments page + Testing
- **Status**: Not Started

---

## 🎯 **SUCCESS CRITERIA**

### After Phase 1 (Week 3):
✅ HQ can create complete plans with:
- Client scope + ERP connection
- KPIs with targets/thresholds  
- Milestones with budgets
- Governance policies (Mode A/B/C)
- Pricing and commercials
- Partner assignments
- Full approval workflow

✅ HQ can monitor active plans with:
- Real-time KPI tracking
- Milestone progress
- Task management
- Risk tracking
- Exception handling
- Complete audit trail
- Report generation

✅ HQ can manage assignments with:
- View all assignments
- Filter and search
- Reassign tasks
- Track SLAs
- Partner communication

**Business Impact**: Revenue-generating plans can be created, delivered, and managed end-to-end.

---

## 💡 **DEVELOPMENT NOTES**

### Database Schema Location
`apps/hq-console/prisma/schema.prisma`

### When Adding New Models
1. Add model to schema.prisma
2. Run: `npx prisma migrate dev --name <migration_name>`
3. Run: `npx prisma generate`
4. Update domain entities: `src/domain/entities/index.ts`
5. Create repository: `src/infrastructure/repositories/`
6. Add to RepositoryFactory: `src/infrastructure/database/index.ts`

### API Route Pattern
`apps/hq-console/src/app/api/<resource>/route.ts`

### Component Pattern
`apps/hq-console/src/presentation/components/<ComponentName>.tsx`

### Translation Pattern
Always add to both:
- `apps/hq-console/messages/en.json`
- `apps/hq-console/messages/ar.json`

---

## 📚 **REFERENCE DOCUMENTS**

### PRIMARY SPEC (What to Build)
`docs/01-planning/HQ Console Navigation & Page Specifications.md`

### SECONDARY REFERENCES
- `docs/01-planning/CFO App Navigation & Page Spec.md`
- `docs/reference/` - Original PRD and specs
- `docs/Technology_Research/Master_KPI_Catalog_Expanded.xlsx`
- `docs/Technology_Research/Master_Milestone_Catalog.xlsx`

---

## 🔄 **HOW TO UPDATE THIS DOCUMENT**

As you complete tasks:
1. Check off completed items with `[x]`
2. Update "Last Updated" date in Progress Tracking section
3. Update "Status" from "Not Started" → "In Progress" → "Complete"
4. Add any important notes or decisions made

**This is the ONLY implementation doc. Keep it updated!** 🎯

---

**Ready to start Phase 1, Week 1, Day 1?** 🚀

