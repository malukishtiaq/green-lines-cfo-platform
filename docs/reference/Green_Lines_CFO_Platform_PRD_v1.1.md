**Green Lines CFO Platform -- Product Requirements Document (PRD)**

*Version 1.1 \| Date: 15 Oct 2025 \| Owner: Product & Operations \| Data
Residency: Azure UAE North/Central*

# Changelog

  ----------------------------------------------------------------------------
  Version          Date             Author           Notes
  ---------------- ---------------- ---------------- -------------------------
  1.0              15 Oct 2025      M. Hisham /      Initial PRD
                                    Copilot          

  1.1              15 Oct 2025      Copilot          Added Odoo integration;
                                                     ERP status triage
                                                     (Partner/Non‑Partner/No
                                                     ERP); service-level
                                                     assignments; detailed
                                                     page specs; mapping
                                                     tables; acceptance
                                                     criteria; test plan.
  ----------------------------------------------------------------------------

# 1. Overview

Green Lines will deliver a digital-first CFO Services platform spanning
three systems: (A) HQ Console, (B) Customer CFO App, and (C)
Agent/Partner App. The platform integrates with Green Lines' internal
Odoo ERP for customers, products, orders, invoices, and credit notes.
Customers subscribe to 3/6/12‑month plans; after the first meeting with
a Senior Consultant, the agreed plan is provisioned in the Customer App
(real-time status, sessions, payments, and add-ons). HQ assigns
certified local agents to each service (not only stock count), including
bookkeeping, VAT, inventory, cashflow forecasting, ERP integration (via
Tech Partners), and more.

# 2. Business Rules 

-   HQ Console is the system of engagement; Odoo is the system of record
    for financials (customer master, orders, invoices, credit notes).

-   CRM must capture \"Customer ERP Status\": PARTNER ERP
    (Odoo/Zoho/SAP) → integration price 0; NON‑PARTNER ERP → integration
    fee applies; NO ERP → assign Tech Partner to deploy ERP before
    service start (ERP Gate).

-   All CFO services can be assigned to agents at the service level
    (bookkeeping, VAT, inventory, cashflow, AR/AP, payroll audit, SOPs,
    ERP projects).

-   Platform commission default 40%; partner payouts T+30 after customer
    acceptance; refunds reduce payouts.

-   Dynamic pricing allowed with guardrails (discounts \> threshold
    require approval).

-   Services may be locked by \"ERP Gate\" until ERP is live and
    approved.

# 3. Personas & RACI

-   Customer (CFO/Owner/Finance Manager)

-   Senior Consultant (HQ)

-   Field Agent / Specialist (Partner)

-   Ops Admin (HQ)

-   Finance Admin (HQ)

-   Partner Success (HQ)

RACI highlights:

  --------------------------------------------------------------------------
  Area           Responsible    Accountable    Consulted      Informed
  -------------- -------------- -------------- -------------- --------------
  Pricing &      Senior         Head of Sales  Finance Admin  Ops
  Quote          Consultant                                   

  Assignments    Senior         Ops Manager    Partner        Finance
                 Consultant                    Success        

  Invoices &     Finance Admin  Finance Head   Senior         Customer
  Refunds                                      Consultant     

  Payouts        Finance Admin  Finance Head   Partner        Agents
                                               Success        

  ERP Setup      Tech Partner   Ops Manager    Senior         Customer
                                               Consultant     
  --------------------------------------------------------------------------

# 4. HQ Console -- Detailed Feature Specs

## 4.1 Navigation & Roles

-   Top Nav: Dashboard \| CRM \| Engagements \| Assignments \| Catalog &
    Pricing \| Billing \| Payouts \| Partners & Agents \| Documents \|
    Meetings \| Analytics \| Integrations \| Settings

-   Roles: Admin, Senior Consultant, Ops Admin, Finance Admin, Partner
    Success, Read-only (granular RBAC via scopes).

## 4.2 CRM (Leads & Opportunities)

Fields (Create Lead/Opportunity):

  ---------------------------------------------------------------------------
  Field                 Type             Rules/Validation   Notes
  --------------------- ---------------- ------------------ -----------------
  Account Name          Text             Required           

  Legal Name            Text             Required           

  TRN (VAT)             Text             Regex UAE format;  
                                         optional           

  City/Region           Select           Required           Dubai, Abu Dhabi,
                                                            Sharjah, \...

  Primary Contact       Group            Email format;      
  (Name/Email/Mobile)                    mobile +971        

  Customer ERP Status   Select           Required           PARTNER \|
                                                            NON_PARTNER \|
                                                            NONE

  ERP Vendor            Select/Text      Visible if status  Odoo \| Zoho \|
                                         != NONE            SAP \| Other

  ERP Integration Scope Multi-select     Optional           COA, Customers,
                                                            Vendors, AP, AR,
                                                            Inventory,
                                                            Payroll, Custom

  ERP Integration Fee   Money            Auto: 0 if         Editable with
                                         PARTNER; \>0 if    approval
                                         NON_PARTNER;       
                                         hidden if NONE     

  Plan Term             Select           Required           3 \| 6 \| 12
                                                            months

  Base Package          Select           Required           Starter \| Growth
                                                            \| Enterprise
                                                            (configurable)

  Add-ons (suggested)   Multi-select     Optional           From Catalog

  Dynamic Pricing       Group            Optional           Region,
  Factors                                                   complexity,
                                                            partner tier,
                                                            utilization

  Discount %            Number           \>15% requires     
                                         approval           

  Notes                 Rich text        Optional           Meeting notes
  ---------------------------------------------------------------------------

Actions: Save Draft, Generate Proposal (PDF), Send for e‑Sign, Mark Won,
Provision Engagement.

Business Rules:

-   If ERP Status = NONE → must assign Tech Partner before Provision.

-   If ERP Status = NON_PARTNER → Integration Fee SKU auto-added.

-   If ERP Status = PARTNER (Odoo/Zoho/SAP) → Integration Fee = 0.

-   On Mark Won → push Customer, SO/Quote, and Invoice Draft to Odoo.

## 4.3 Engagements (Plans)

Key Fields:

  -----------------------------------------------------------------------
  Field                   Type                    Notes
  ----------------------- ----------------------- -----------------------
  Status                  Enum                    Provisioning \| ERP
                                                  Gate \| Active \| On
                                                  Hold \| Completed \|
                                                  Cancelled

  ERP Gate Status         Enum                    REQUIRED \| INTEGRATION
                                                  \| READY

  Start / End             Dates                   Derived from term

  Services                List                    Selected from Catalog;
                                                  each has SLA/evidence
                                                  rules

  Milestones              List                    Auto-generated per
                                                  service template

  Sessions                Calendar                Teams links

  Assignments             List                    Per service
                                                  (Primary/Secondary)

  Billing Plan            Enum                    Monthly \|
                                                  Milestone-based
  -----------------------------------------------------------------------

Rules:

-   ERP Gate locks non-ERP services until ERPIntegrationProject is
    GO_LIVE & Approved.

-   Every service must have a Primary Agent before status can be Active.

## 4.4 Assignments

Smart Suggestions Score = 25\*Proximity + 30\*SkillsCert +
20\*Availability + 15\*Quality + 10\*Load (normalized 0--1).

  -----------------------------------------------------------------------
  Field                   Type                    Notes
  ----------------------- ----------------------- -----------------------
  Service                 Lookup                  Service within
                                                  Engagement

  Primary Agent           Lookup                  Required

  Secondary Agents        List                    Optional

  SLA                     Enum                    Standard, Expedited,
                                                  Custom

  Due Date                DateTime                Derived from SLA

  Evidence Rules          JSON                    minPhotos, geotag,
                                                  signature, fileTypes
  -----------------------------------------------------------------------

## 4.5 Catalog & Pricing

Sample Services:

  -------------------------------------------------------------------------------------
  Service         Category   Default SLA         Evidence                  Commission
                                                                           Rule
  --------------- ---------- ------------------- ------------------------- ------------
  Accounting &    Core       Monthly Close       Reconciliations, reports  40% platform
  Bookkeeping                                                              default

  Monthly CFO     Advisory   Monthly             Report + commentary       40%
  Pack                                                                     

  VAT Filing &    Tax        Monthly/Quarterly   Filing proof              40%
  Compliance                                                               

  Inventory &     Field      Per visit           Photos+geotag+signature   40%
  Assets                                                                   
  Verification                                                             

  Cashflow        Advisory   Monthly             Model file, assumptions   40%
  Forecasting                                                              

  AR Clean‑up /   Ops        Weekly              Aging reports, notes      40%
  Collections                                                              

  ERP Integration Tech       Project             UAT sign‑off              40%
  (Non‑Partner)                                                            
  -------------------------------------------------------------------------------------

## 4.6 Billing (Odoo‑Centric)

-   Sales Order & Invoice created in Odoo; platform mirrors status.

-   Payments via PSP; webhook updates platform + Odoo.

-   Refunds create credit notes in Odoo; platform adjusts payouts.

## 4.7 Payouts & Commission

Formula:

-   PartnerShare = (InvoicePaidAmount - RefundsApplicable) \* (1 -
    PlatformCommission%).

-   Eligibility = CustomerAcceptanceDate + 30 days; no pending
    refund/dispute.

## 4.8 Partners & Agents

-   Profiles include certifications, exams, annual fees status, service
    areas, languages, utilization, CSAT.

-   Flag \"ERP Tech Partner\" for ERP projects; template tasks
    available.

## 4.9 Integrations (Odoo & PSP)

Odoo Mapping (examples):

  ------------------------------------------------------------------------------
  Platform          Odoo Model.Field         Direction         Notes
  ----------------- ------------------------ ----------------- -----------------
  Account.name      res.partner.name         →                 Create/Update

  Account.trn       res.partner.vat          →                 VAT/TRN

  SalesOrder        sale.order               →                 Plan + add-ons +
                                                               SKUs

  Invoice.status    account.move.state       ↔                 Paid/Overdue

  CreditNote        account.move(reversal)   ↔                 Refunds
  ------------------------------------------------------------------------------

PSP Webhooks: /webhooks/payments/{success\|failed\|refunded} → update
Invoice+Payment; sync to Odoo.

# 5. Customer CFO App -- Detailed Feature Specs

## 5.1 Home

  -----------------------------------------------------------------------
  Widget            Fields            Actions           Rules
  ----------------- ----------------- ----------------- -----------------
  Plan Header       Term, Status      ---               Show ERP Gate if
                                                        active

  Next Session      Time, Link        Join, Reschedule  \>=24h notice

  Milestones        List+status       Open, Accept      Accept triggers
                                                        payout clock

  Payments          Invoices          Pay now           PSP checkout

  Add‑ons           Cards             View, Purchase    Assignment auto
                                                        on payment

  ERP Setup         Phase, Owner, ETA View details      Visible if gated
  -----------------------------------------------------------------------

## 5.2 Plan & Milestones

-   Milestone detail: description, due, evidence, deliverables, Accept /
    Request Rework.

-   Acceptance required for payout eligibility (service-specific).

## 5.3 Sessions & Meetings

-   Calendar view; Teams links; reschedule rules; reminders 24h/1h.

## 5.4 Payments & Invoices

-   Invoice list + detail; Apple/Google Pay; receipts; refunds shown
    with credit note link.

## 5.5 Add‑ons Store

-   Service detail with SLA, scope, price; checkout; triggers assignment
    flow.

## 5.6 Documents & Chat

-   Vault with folders and versioning; secure chat with
    Consultant/Agents; attachments.

## 5.7 Insights (Finance)

-   Multi-currency, Custom Curve seasonality, variance alerts; read-only
    from analytics service.

# 6. Agent/Partner App -- Detailed Feature Specs

## 6.1 My Jobs

  -----------------------------------------------------------------------
  Card              Shows             Actions           Rules
  ----------------- ----------------- ----------------- -----------------
  Job               Service, SLA,     Acknowledge,      Must acknowledge
                    Due, Location     Start             within 4h

  -----------------------------------------------------------------------

## 6.2 Job Detail & Checklist

-   Tabs: Overview, Checklist, Evidence, Notes, Time & Expenses, Submit.

-   Evidence rules enforced: min photos, geotag, signature; offline
    capture allowed; sync on reconnect.

## 6.3 Earnings & Certifications

-   Earnings lifecycle: Eligible → Scheduled (T+30) → Paid; statements
    downloadable.

-   LMS: exams, badges; eligibility gates per service.

# 7. Data Model (Expanded)

  -----------------------------------------------------------------------
  Entity                              Key Attributes
  ----------------------------------- -----------------------------------
  Account                             id, name, trn, city, erpStatus,
                                      erpVendor, erpNotes

  Engagement                          id, accountId, term, status,
                                      erpGateStatus, start, end

  Service                             id, engagementId, type, sla,
                                      evidenceRules

  Assignment                          id, serviceId, primaryAgentId,
                                      secondaryAgents, acknowledgedAt

  Milestone                           id, engagementId, title, due,
                                      status

  Invoice                             id, engagementId, odooId, status,
                                      amount, currency, dueDate

  Payment                             id, invoiceId, pspId, status,
                                      method

  Payout                              id, partnerId, amount, eligibleAt,
                                      scheduledAt, paidAt, adjustments

  ERPIntegrationProject               id, engagementId, phase, artifacts,
                                      approvals, state
  -----------------------------------------------------------------------

# 8. Workflows & States

Onboarding: Lead → Proposal → e‑Sign → Payment → Provision → Assignment
→ Kickoff.

ERP Gate: REQUIRED → (Integration project tasks) → GO_LIVE → READY.

Task: Open → In Progress → Submitted → QA Review → Approved/Rejected →
(Rework) → Approved.

# 9. Notifications (Templates)

  -----------------------------------------------------------------------
  Event                   Channel                 Template
  ----------------------- ----------------------- -----------------------
  ERP Project Created     Email/Push              Your ERP setup has
                                                  started. Partner:
                                                  {name}. ETA: {date}.

  ERP Gate Cleared        Email/Push              ERP is live. All
                                                  services are now
                                                  unlocked.

  Agent Assignment        Email/Push              You've been assigned to
                                                  {service}. Acknowledge
                                                  within 4 hours.

  Invoice Issued          Email/Push/WhatsApp     Invoice {no} for
                                                  {amount} due by {date}.
                                                  Pay now.
  -----------------------------------------------------------------------

# 10. AI/ML Features (Design Notes)

-   Smart Assignment: feature store with distance, skills, availability,
    CSAT, load; explainable ranking reasons.

-   Meeting Summarization: draft plan & milestone suggestions from
    discovery notes.

-   Document AI: statement parsing, VAT risk flags, auto-tagging.

-   Forecasting: multi-currency model with Custom Curve; anomaly
    detection on expenses/revenue.

# 11. Security, Privacy, Compliance (UAE PDPL)

-   TLS 1.2+, TDE at rest; Key Vault for secrets; RBAC + row-level
    security for tenant isolation.

-   Audit all read/write to PII and financial records; export for DPIA.

-   Mobile: device binding, biometric unlock, jailbreak/root detection,
    token revoke.

# 12. Non‑Functional Requirements

-   Performance: P95 \< 1.5s for main screens; real-time updates \< 2s.

-   Availability: 99.9% APIs; DR with geo‑redundant storage; RPO\<=15m,
    RTO\<=4h.

-   Localization: EN/AR; weekend Sat--Sun; RTL support.

-   Offline: Agent app offline-first for checklists & evidence; conflict
    resolution via last-writer-wins with manual merge for evidence sets.

# 13. Acceptance Criteria (Expanded)

ERP Status mandatory / fee logic / gate unlock are enforced;
service-level assignment required; evidence validation for submissions;
payouts scheduled T+30 after acceptance; refunds reduce payouts
automatically.

# 14. API Samples

Create Engagement:

POST /api/engagements\
{\
\"accountId\": \"acc_001\",\
\"termMonths\": 6,\
\"services\": \[\"BOOKKEEPING\", \"VAT\"\],\
\"erpGateStatus\": \"REQUIRED\"\
}

Assign Service Agent:

POST /api/assignments\
{\
\"serviceId\": \"srv_123\",\
\"primaryAgentId\": \"agt_555\",\
\"sla\": \"STANDARD\",\
\"evidenceRules\": {\
\"minPhotos\": 3, \"geotag\": true, \"signature\": true\
}\
}

# 15. Test Cases

  -----------------------------------------------------------------------
  ID                      Scenario                Expected
  ----------------------- ----------------------- -----------------------
  TC-ERP-001              Create CRM without ERP  Blocked with validation
                          Status                  

  TC-ERP-002              Partner ERP sets fee to Proposal shows 0 AED
                          0                       integration

  TC-ERP-003              Non‑Partner ERP adds    Quote contains priced
                          SKU                     integration line

  TC-GATE-001             Services locked until   Customer app shows
                          ERP go-live             Locked; agent cannot
                                                  start

  TC-PAYOUT-001           Payout T+30 after       Eligible date =
                          acceptance              acceptance+30

  TC-REFUND-001           Refund before payout    Partner share reduced
                                                  accordingly
  -----------------------------------------------------------------------

# 16. Open Items

-   Confirm PSP (Checkout.com vs Amazon PS).

-   Define Non‑Partner ERP fee tiers (by modules/complexity).

-   List and onboard Tech Partners per region.

-   ERP Go‑Live acceptance checklist (COA, opening balances, UAT
    sign‑off).

-   Data retention schedules for evidence and financial docs.
