**Green Lines -- Customer CFO App Specification**

*Version 1.0 \| 15 Oct 2025 \| Mobile + Web \| EN/AR \| ERP‑aware
Dashboard + AI Assistant*

# 1. Goals & Principles

-   Give customers a configurable ERP‑aware financial dashboard + their
    CFO plan status in one screen.

-   Enable self‑service for sessions, payments, documents, add‑ons, and
    AI assistance.

-   Maintain transparency of milestones, tasks, SLAs, and acceptance
    states.

# 2. Main Screen (Dashboard)

  -----------------------------------------------------------------------
  Widget            Data              Customization     Actions
  ----------------- ----------------- ----------------- -----------------
  ERP KPI Board     Sales, Expenses,  Drag & drop;      Open KPI detail
                    Cashflow,         add/remove cards  
                    Inventory                           

  Plan Overview     Term, Status,     Pick KPIs         Open Plan
                    KPIs (TTFV,                         
                    On‑time %,                          
                    Variance)                           

  Next Session      Date/time, Teams  ---               Join, Reschedule
                    link                                

  Milestones        Traffic‑light     ---               Open milestone
                    status                              

  Payments          Invoice list      ---               Pay now

  Add‑ons           Recommended       ---               Browse store
                    services                            
  -----------------------------------------------------------------------

-   If ERP Gate active: show ERP Setup widget (phase, ETA, Tech
    Partner).

-   AI Assistant floating action available on all screens.

# 3. AI Assistant (ChatGPT‑like)

-   Natural language chat: 'Where are we vs plan?', 'Explain cashflow
    variance', 'What's next?', 'Recommend add‑ons'.

-   Data sources: ERP KPIs, Plan/Milestones, Sessions,
    Invoices/Payments, Evidence summaries.

-   Actions: Deep links to pages; generate summaries; export answers as
    PDF.

# 4. Plan & Milestones

  -----------------------------------------------------------------------
  Item              Fields            Actions           Rules
  ----------------- ----------------- ----------------- -----------------
  Milestone List    Title, Due,       Open detail       Locked if ERP
                    Status, Linked                      Gate
                    sessions/tasks                      

  Milestone Detail  Description, SLA, Accept, Request   Acceptance starts
                    Evidence preview  Rework, Message   payout clock

  Tasks (read‑only) Assignee          Open task detail  ---
                    (agent/team),                       
                    Due, Status                         
  -----------------------------------------------------------------------

# 5. Sessions & Meetings

-   Calendar view; Teams links; reschedule with ≥24h notice; reminders
    24h/1h.

# 6. Payments & Invoices

-   Invoice list/detail with VAT, integration fee (if applicable); Pay
    now (Checkout.com / Amazon PS); receipts; refunds show credit note
    ref.

# 7. Add‑ons Store

  -----------------------------------------------------------------------
  Card                    Details                 Action
  ----------------------- ----------------------- -----------------------
  Service                 Scope, SLA, price       Add to cart → Pay →
                                                  Assign

  -----------------------------------------------------------------------

# 8. Documents & Reports

-   Vault with folders (by engagement/milestone); versioning; tagging;
    CFO Pack, VAT filings, forecasts; upload/download/share.

# 9. Chat & Support

-   Threaded chat with Consultant and assigned agents; attachments;
    canned quick actions; audit logs.

# 10. Top Settings Menu

-   Profile

-   Sessions & Meetings

-   Payments & Invoices

-   Documents & Reports

-   Chat & Support

# 11. Non‑Functional & Security

-   EN/AR; RTL; weekend Sat--Sun; push/email/WhatsApp notifications.

-   Biometric unlock (mobile); session timeout; token revoke; PDPL
    alignment.

# 12. Acceptance Criteria (Key)

-   Dashboard shows ERP KPIs and Plan KPIs together; user can re‑order
    KPI cards.

-   AI Assistant answers link to relevant pages and may export summaries
    as PDF.

-   Milestone acceptance triggers payout eligibility; locked milestones
    respect ERP Gate.

-   Payments work with Apple/Google Pay; refunds show credit note
    reference.
