# HQ Console (Counsel NAV) — End-to-End Specifications

This document details the navigation, widgets, fields, actions, and workflows for each page in the **HQ Console (Counsel NAV)**.  
It reflects the “Right Track / Stay on Track” operating model, three-system architecture (HQ Console, CFO App, Partner App), and governance rules.

---

## 🌐 Global Navigation (Left Sidebar)

1. Dashboard  
2. Plan Builder  
3. Plan Monitor  
4. Assignments  
5. Partners  
6. Calendar  
7. Billing  
8. CRM  

**Global Controls (Top Bar):** Search, Date Range Filter, Org/Region Filter, Currency, Notifications, User Menu

---

## 1) Dashboard

**Purpose:** Executive overview of plans and partner footprint, with quick trend charts.

### KPIs (Cards)
- Total Plans Initiated  
- Total Open Plans (status = Open/In Progress)  
- Total Closed Plans  
- Total Partners (active partners)

### Charts
**Clients by Region (Map/Bar)**  
- X: Region (GCC, MENA, APAC, EU)  
- Y: # Clients  
- Filters: Industry, Partner Tier, Date Created  

**Plans: Total vs Closed (Trend)**  
- Lines/bars for Plans Initiated vs Plans Closed (monthly/quarterly)  
- Overlay: Conversion Rate (% closed / initiated)

### Filters
- Date Range (This Month / QTD / YTD / Custom)  
- Region / Country  
- Industry  
- Partner Tier  
- Plan Type (Right Track, Stay on Track)  
- Status (Open, In Progress, Closed)

### Actions
- Create Plan → Plan Builder  
- Invite Partner → Partners  
- Export Dashboard (PDF/PNG)

---

## 2) Plan Builder

**Purpose:** Guided wizard to create an approved plan with targets, milestones, assignments, pricing, and governance.

### Stages (Wizard Progress at Top)

#### Stage 1 — Client & Scope
**Fields:**  
Client, Branch QTY, Plan Period, Session, Plan Type, Objectives, Users (name & phone).  
**Actions:** Save Draft • Next

#### Stage 2 — Baseline & Data Sources
**Fields:**  
ERP Connection (Type, Status), Data Domains (AR/AP, GL, Sales, etc.), Mapping Health (%).  
**Actions:** Connect ERP • Test Sync • Import CSV • Next

#### Stage 3 — KPIs & Targets
**Fields:**  
KPI Catalogue (select & star defaults)  
- Target Value  
- Thresholds (Green/Amber/Red)  
- Weight (%)  
- Calculation Source  
- Effective Dates  
- Overall Status Rule  

**Actions:** Add KPI • Bulk Edit Thresholds • Next

#### Stage 4 — Milestones & Timeline
**Fields:**  
Milestone Title, Partner Assigned, Deliverables, Dependencies, Duration, Dashboard fields (Title, Due Date, Owner).  
**Actions:** Add Milestone • Next

#### Stage 5 — Workflow & Governance
**Fields:**  
Approval Policy:
- Mode A: Client Approval Required  
- Mode B: Notify Only  
- Mode C: HQ Only  

Notification Channels, Report Cadence, SLA Settings.  
**Actions:** Save Policy • Next

#### Stage 6 — Pricing & Commercials
**Fields:**  
Package, Add-ons, Price, Commission Model, Payout Delay, Refund Handling, Contract Dates, Payment Terms.  
**Actions:** Calculate • Download Proposal • Next

#### Stage 7 — Assignments & Partner Selection
**Fields:**  
Assignment Items, Partner Selection, Assignment Owner, SLA/Due Dates, Notes, Attachments.  
**Actions:** Create Assignments • Notify Partner • Next

#### Stage 8 — Review & Approval
**Review Panel:** Summary of scope, KPIs, milestones, governance, pricing, assignments.  
Includes risk checklist, legal confirmation.  
**Actions:** Save Draft • Submit for Approval • Approve & Activate Plan

---

## 3) Plan Monitor

**Purpose:** Post-approval control center to track performance, manage exceptions, publish reports, and govern changes.

**Header:** Client • Plan • Period • Status • ERP Status • Last Sync • Mapping Health  
**CTAs:** Sync Now • Generate Report • Publish to CFO App • Export • Reforecast • Escalate • Book Meeting

### Tabs

#### Overview
Top KPI Cards, Milestone Timeline, Budget vs Actual, Alerts, Notes & @Mentions

#### KPIs
Table (KPI | Target | Actual | Variance | Status | Owner | Last Update), Drill-down charts, Edit Targets

#### Tasks & Risks
Kanban/Table view: Backlog, In Progress, Blocked, Done  
Fields: Title, KPI Link, Owner, SLA, Due Date, Priority, Status, Comments  
Create Risk (Impact, Likelihood, Mitigation, Trigger, Watchers)

#### Exceptions
Auto-detected issues list (Type, Severity, Date, Owner, Status)  
Actions: Assign Owner • Create Task • Mute • Add Note

#### Integration
ERP Connection (Type, Auth, Status), Field Mapping coverage (%), Logs  
Actions: Connect ERP • Fix Mapping • Test Sync

#### Activity Log
Audit Trail: Who, What, Before/After, Reason, Timestamp, Attachments

#### Reports
Templates: Executive, CFO Deep-Dive, Operations, Exceptions Only  
Include Commentary toggle  
Actions: Generate Preview • Publish to CFO App • Download (PDF/PPT/Excel)

**Governed Changes:**  
Drawer: Change Type, Before/After, Reason, Impacted KPIs, Effective Date  
Follows Mode A/B/C rules

---

## 4) Assignments

**Purpose:** Operational view for partner and internal tasks.

### Mini-Dashboard
Open • In Progress • Closed • Overdue  

### Filters
Status, Region, Partner, Client, Plan, Due Date, Owner  

### Table
Assignment No. | Plan ID | Client | Assignment | Partner | Status | Owner | SLA | Priority | Last Update  
**Actions:** View • Edit • Reassign • Close • Add Note

---

## 5) Partners List

**Purpose:** Manage partner network and tiers.

### Table Columns
Partner No. | Name | Type | Status | Location | Tier  
**Actions:** Edit • Remove • Block

### Create / Edit Partner Form
Fields:  
Partner Info (Name, Entity, Tax ID, Website), Type, Tier, Status, Locations, Contacts, Attachments, Capabilities, Notes  
**Actions:** Save • Save & Invite • Cancel

**Safety:**  
Remove → soft delete  
Block → Inactive & revoke assignments

---

## 6) Calendar

**Purpose:** Manage plan-related meetings.

**Views:** Month • Week • Day • Agenda  
**Features:** Color-coded by Client or Plan, Drag-and-Drop reschedule  
**Create Meeting Modal:**  
Title, Date/Time, Participants, Location, Agenda, Attachments, Reminders  
**Actions:** Send Invites • Save Draft • Cancel  
**Integrations:** O365/Google Calendar (two-way) with notifications to CFO & Partner Apps

---

## 7) Billing

**Purpose:** Track financial transactions, commissions, and payouts.

### Dashboard Cards
Total Billed • Total Collected • Outstanding AR • Partner Commissions • Refunds • Payouts Due  

### Charts
Collections Trend, Commissions by Partner, Refunds vs Charges  

### Filters
Date Range, Client, Partner, Plan Type, Status  

### Transactions Table
Transaction ID | Client | Plan | Invoice | Date | Amount | Status | Commission | Platform Share | Payout Date | Adjustments | Notes  
**Actions:** View Invoice • Record Payment • Issue Refund • Export

### Partner Commission Rules
Platform Commission %, Partner Share after Refunds, Payout Cycle (30 days post-collection)

### Exports
- Excel (.xlsx) — transactions, commissions, payouts  
- PDF — billing snapshot

---

## 8) CRM

**Purpose:** Manage client information and documents.

**Features:**  
Create/Edit/View customer profiles, Attach documents (Trade License, VAT, Agreements), Multiple contacts, Notes & Tags.

**Table:**  
Customer ID | Name | Industry | Location | VAT | Status | Actions (View/Edit/Remove/Attach Docs)

**Create Customer Form:**  
Name, Industry, Size, VAT, Tax ID, Contacts, Attachments, Notes  
**Actions:** Save • Save & Invite • Cancel

---

## 🔐 Permissions Summary
- **Ops Admin (HQ):** Full access; create/edit plans; billing ops.  
- **Finance Lead (HQ):** Approvals, pricing, billing.  
- **Partner:** View/update assignments, upload evidence.  
- **Client (CFO App):** View reports, approve changes, book meetings.

---

## 🔔 Eventing & Notifications (Key Triggers)
- `plan.created`, `plan.approved`, `plan.snapshot.published`  
- `target.updated`, `milestone.updated` (approval workflow)  
- `assignment.created|updated|overdue`  
- `meeting.created|updated|cancelled`  
- `invoice.issued|paid|refunded`, `commission.accrued|paid`  
- `customer.created|updated|document.attached`

---

**End of Document**
