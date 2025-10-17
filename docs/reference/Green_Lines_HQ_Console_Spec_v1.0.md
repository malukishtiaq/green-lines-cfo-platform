**Green Lines -- HQ Console Specification**

*Version 1.0 \| 15 Oct 2025 \| Web Admin \| Odoo‑Integrated \|
Service‑Level Assignments*

# 1. Navigation & Roles

-   Top Nav: Dashboard \| CRM \| Plan Builder \| Engagements \|
    Assignments \| Catalog & Pricing \| Billing \| Payouts \| Partners &
    Agents \| Documents \| Meetings \| Analytics \| Integrations \|
    Settings

-   Roles: Admin, Senior Consultant, Ops Admin, Finance Admin, Partner
    Success, Read‑only; row‑level security by region/portfolio.

# 2. CRM (with ERP Triage)

  -----------------------------------------------------------------------
  Field                   Type                    Rule
  ----------------------- ----------------------- -----------------------
  Customer ERP Status     Select                  Required: PARTNER \|
                                                  NON_PARTNER \| NONE

  ERP Vendor              Select/Text             Visible if status !=
                                                  NONE: Odoo \| Zoho \|
                                                  SAP \| Other

  ERP Integration Scope   Multi-select            COA, Customers,
                                                  Vendors, AP, AR,
                                                  Inventory, Payroll,
                                                  Custom

  ERP Integration Fee     Money                   Auto 0 if PARTNER;
                                                  priced if NON_PARTNER;
                                                  hidden if NONE

  Plan Term               Select                  3 \| 6 \| 12 months

  Base Package            Select                  Starter \| Growth \|
                                                  Enterprise

  Discount %              Number                  \>15% needs approval
  -----------------------------------------------------------------------

-   On Won: push Customer, Sales Order, and Invoice draft to Odoo; add
    Integration SKU accordingly.

-   If ERP Status = NONE, must assign Tech Partner before Provision (ERP
    Gate).

# 3. Engagements & ERP Gate

  -----------------------------------------------------------------------
  Tab                                 Contents
  ----------------------------------- -----------------------------------
  Plan                                Term, dates, status

  ERP Gate                            Status REQUIRED \| INTEGRATION \|
                                      READY; ERP project link

  Services                            List with SLA/evidence; lock if
                                      gate active

  Milestones                          Schedule and acceptance

  Sessions                            Calendar; Teams links

  Assignments                         Primary/Secondary per service;
                                      scores; acknowledgments

  Billing                             Invoices & payments (Odoo links)

  Documents                           Vault; tagging; retention
  -----------------------------------------------------------------------

# 4. Assignments (Smart)

Score = 25\*Proximity + 30\*Skills+Cert + 20\*Availability +
15\*Quality + 10\*Load (0--100) with explainable badges.

  ---------------------------------------------------------------------------
  Field                   Type                    Notes
  ----------------------- ----------------------- ---------------------------
  Service                 Lookup                  Service within Engagement

  Primary Agent           Lookup                  Required

  Secondary Agents        List                    Optional

  SLA                     Enum                    Standard/Expedited/Custom

  Due                     DateTime                Derived from SLA

  Evidence Rules          JSON                    minPhotos, geotag,
                                                  signature, fileTypes
  ---------------------------------------------------------------------------

# 5. Catalog & Pricing

-   Services with SLA defaults, evidence, commission rules (default 40%
    platform).

-   Add‑ons with eligibility; Integration SKUs: ERP‑INT‑PARTNER (0 AED),
    ERP‑INT‑NONPARTNER (priced).

# 6. Billing & Refunds (Odoo)

-   Odoo is authoritative for invoices/credit notes; platform mirrors
    status.

-   PSP webhooks update both systems; refund wizard issues credit note
    in Odoo.

# 7. Payouts & Commission

-   Eligibility: customer acceptance + 30 days; no pending refunds.

-   Partner statements with adjustments; weekly payout run.

# 8. Partners & Agents

-   Profiles include certifications, exams, annual fees, service areas,
    languages, utilization, CSAT/NPS.

-   ERP Tech Partners flagged; ERP project templates available.

# 9. Integrations

  ------------------------------------------------------------------------------
  Platform          Odoo Model.Field         Direction         Notes
  ----------------- ------------------------ ----------------- -----------------
  Account.name      res.partner.name         →                 Create/Update

  Account.trn       res.partner.vat          →                 VAT/TRN

  SalesOrder        sale.order               →                 Plan + add-ons +
                                                               SKU

  Invoice.status    account.move.state       ↔                 Paid/Overdue

  CreditNote        account.move(reversal)   ↔                 Refunds
  ------------------------------------------------------------------------------

# 10. APIs (Samples)

Create Engagement

POST /api/engagements { accountId, termMonths, services\[\],
erpGateStatus }

Assign Agent

POST /api/assignments { serviceId, primaryAgentId, sla, evidenceRules }

# 11. Acceptance Criteria

-   ERP Status mandatory; Partner ERP → 0 fee; Non‑Partner → add SKU; No
    ERP → Tech Partner before Provision.

-   Engagement cannot be Active until every service has a Primary agent.

-   Evidence enforcement configured per service and reflected to Agent
    app.

-   Payouts scheduled T+30 post‑acceptance; refunds reduce partner share
    automatically.
