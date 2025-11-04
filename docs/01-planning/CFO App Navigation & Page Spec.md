# CFO App — Navigation & Page Specifications

This document defines the navigation structure and detailed content for each page in the **CFO App (Client-facing application)**.  
It complements the HQ Console and Partner App, enabling clients to monitor plans, approve changes, download reports, purchase additional services, and interact with HQ and partners.

---

## 🌐 Global Navigation (Bottom or Side Menu)
1. My Company (Company 360)
2. Profile & Settings  

**Global Controls (Top Bar):** Notifications, Search, Filters (Date Range, Plan), Currency, Language Switch

---

## 0) My Company (Company 360)

**Purpose:** Personalized, ERP-connected command center showing overall company trends.  
Users can design their dashboard (e.g., Total Sales, Top Customers, Top Items) and drill into details.

### Data & Integration
- **Sources:** ERP (Odoo, Zoho, SAP, QuickBooks), CRM, Banking feed (optional)
- **Status Bar:** ERP Connected • Last Sync • Mapping Health • As-of timestamp
- **Multi-currency:** Base or transactional currency; FX per plan/report policy

### Modes
- **View Mode:** Locked layout with interactive filtering & drill-down
- **Builder Mode:** Drag-and-drop layout editor (add/resize/reorder widgets)

### Global Filters
- Date Range (Today, MTD, QTD, YTD, Custom)
- Organization / Business Unit / Branch
- Region / Channel / Salesperson
- Customer / Supplier
- SKU / Category
- Currency

### Widget Library
**Metric Cards:**  
Total Sales, Net Sales, Gross Margin %, Net Profit %, Cash-in vs Cash-out, AR Balance, AP Balance, CCC, DSO, DPO, DIO

**Ranking / Top-N:**  
Top Customers, Top Items/SKUs, Top Regions/Stores/Channels

**Charts:**  
Sales Trend, Sales by Region/Channel, Product Mix, Collections vs Targets

**Tables:**  
Customer Ledger, SKU Performance, AR Aging

**Custom KPI:**  
Formula builder (e.g., (Revenue−COGS)/Revenue)

### Actions
Add Widget • Save Layout • Set as Default • Share View • Export (PDF/PNG/Excel) • Schedule Email Snapshot

### Drill-Down (Transactions Explorer)
Clicking any widget opens a transaction explorer with:
- **Columns:** Doc No., Date, Type, Customer/Supplier, SKU, Amount, etc.
- **Filters:** All global filters + document/payment status
- **Actions:** Open ERP Document, Export CSV/XLSX, Create Task, Add Note
- **Pivot & Grouping:** Drag dimensions & save as custom views

### Starter Layout
Default widgets for new users:  
Total Sales (MTD), GM%, DSO, AR Aging, Top 10 Customers, Top 10 Items, Sales by Region

### Empty State & Safeguards
- If ERP not connected → show “Connect ERP to start” wizard  
- Stale data (>24h) → show sync banner  
- Respect permissions & PII masking

---

## 1) Dashboard

**Purpose:** Overview of financial health, active plans, and alerts.

**Widgets & Cards:** Active Plans, Plan Status Summary, Top KPIs, Exceptions Open, Upcoming Meetings  
**Charts:** Performance Trend, Working Capital Trend  
**Actions:** View Plan Details • Download Report • Book Meeting

---

## 2) Plans

**Purpose:** Show all approved plans with details and progress.

### Table View
| Plan Name | Period | Status | Owner | Last Updated | Actions |
|------------|---------|--------|--------|---------------|----------|
| View | Download Report | Book Meeting |

### Plan Detail Tabs
- **Overview:** KPIs summary, milestones, budget vs actual
- **KPIs:** Target vs Actual, variance, trends
- **Milestones:** Status, due dates, owners
- **Notes & Comments:** Collaboration

**Actions:** Download Report • Request Change • Book Meeting

---

## 3) Reports

**Purpose:** Access published reports and generate snapshots.

**Features:**  
Report Library (Name | As-of Date | Template | Status | Actions)  
Filters: Date Range, Plan, Report Type  
Schedule Reports: Weekly/Monthly  

**Actions:** Download (PDF/PPT/Excel) • Share (email link)

---

## 4) Approvals

**Purpose:** Manage governance approvals for plan edits.

**Approval Cards:**  
Change Type, Before/After, Reason, Impacted KPIs, Requested By  

**Actions:** Approve • Reject • Comment  
**Filters:** Pending | Approved | Rejected | Date Range  
**Notifications:** Push + Email for new requests

---

## 5) Tasks & Exceptions

**Purpose:** Show tasks assigned and exceptions requiring attention.

**Tabs:**
- **Tasks:** Task Name | KPI | Owner | Due Date | Status  
- **Exceptions:** Exception Type | Severity | Detected On | Owner | Status

**Actions:** Update Task • Add Notes

---

## 6) Calendar

**Purpose:** Manage meetings and reviews.

**Views:** Month | Week | Day  
**Features:** Color-coded meetings (HQ/Partner), Sync with O365/Google  
**Actions:** Book Meeting • Attach Report Snapshot

---

## 7) Billing

**Purpose:** Display invoices, payments, and subscription details.

**Dashboard:** Total Billed • Total Paid • Outstanding  
**Table:** Invoice No. | Date | Amount | Status | Actions  
**Actions:** Download Invoice • Pay Online

---

## 8) Purchase Services

**Purpose:** Purchase additional services (Bookkeeping, Payroll, Compliance, Advisory).

**Features:**
- **Service Catalog:** Bookkeeping, Trade Finance, Payroll, Compliance, Tax Filing, Advisory
- **Service Card:** Name | Description | Price | SLA | Partner Type  
- **Service Detail:** Deliverables, SLA, Pricing, Partner, Attachments

**Actions:** Add to Cart • Request Quote • Checkout & Pay • Track Status  
**Notifications:** Purchase Confirmation • Assignment Details

---

## 9) Support & Chat

**Purpose:** Real-time support and FAQs.

**Features:** Live Chat, Knowledge Base, Raise Ticket  
**Actions:** (varies by category)

---

## 10) Profile & Settings

**Purpose:** Manage user profile and preferences.

**Fields:** Name, Email, Phone, Role, Notifications, Language, Currency  
**Actions:** Edit Profile • Change Password • Logout

---

## 🔔 Notifications & Eventing
- New report published  
- Approval request  
- Meeting scheduled  
- Exception detected  
- Invoice issued  
- Service purchased  
- My Company snapshot emailed  

---

## 💡 UX Notes
- Mobile-first, responsive charts  
- Quick actions for most-used features  
- Secure authentication (MFA optional)  
- Downloads include branding & timestamp

---

## 11) Empty States, Locks & Guardrails

**Purpose:** Define app behavior when data/workflows are missing or locked.

### Page-Level Empty States & CTAs
- Overdue invoice → “Pay Now” banner + dunning timeline  
- Payment in review → Show pending confirmation  
- MFA required → Setup before access  

### Notifications & Eventing (Additions)
- `account.locked` / `account.unlocked`  
- `billing.invoice.overdue` / `billing.payment.received`  
- `compliance.document.expired`  
- `integration.erp.disconnected|reconnected`  
- `plan.expired|renewed`

### Copy & Design Guidelines
- Short, optimistic copy with CTA  
- Use icons & tooltips  
- Include help link to Support  

### Admin Settings (HQ Console)
- Lock thresholds & accessible pages  
- Compliance checklist by country  
- Default empty-state CTAs  
- Email templates for dunning & lock notifications

---

**End of Document**
