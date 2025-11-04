# HQ Console Implementation Guide
**The ONLY file you need for development**

**Last Updated**: November 4, 2025  
**Current Status**: Foundation Complete (25%) → Building Phase 1  
**Based On**: HQ Console Navigation & Page Specifications.md (Company Spec)

---

## 🎯 **HOW TO USE THIS DOCUMENT**

This is your **single source of truth** for HQ Console development. It contains:

1. **What's Built** - Completed features (reference only)
2. **What's Pending** - All remaining work with exact tasks
3. **Implementation Plan** - Step-by-step build order
4. **Progress Tracking** - Update as you complete tasks

---

## ✅ **WHAT'S ALREADY BUILT (25% Complete)**

### Foundation ✅ COMPLETE
- Clean Architecture (4 layers: domain, application, infrastructure, presentation)
- Multi-language (Arabic RTL + English LTR) with next-intl
- Authentication (NextAuth.js)
- Database (PostgreSQL + Prisma)
- Design System (Ant Design Pro + custom theme)
- HTTP Client (centralized axios)
- Access Control (8 roles, 20+ permissions)

### Pages Partially Built
- **Dashboard** (60%) - KPI cards + 3 charts
- **Plan Builder** (40%) - Stage 1 (Client & Scope) + Stage 4 (Milestones)
- **Partners** (30%) - Basic CRUD operations

---

## 📋 **WHAT'S PENDING (75% Remaining)**

### **PHASE 1: Complete Plan Lifecycle** (3 Weeks) - 0% Started

#### **Week 1: Complete Plan Builder (6 missing stages)**

**Stage 2 — Baseline & Data Sources** ❌
```
Tasks:
- [ ] ERP Connection selector (Odoo/SAP/QuickBooks/Zoho/Manual)
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

