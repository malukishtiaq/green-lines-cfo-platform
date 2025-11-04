# Green Lines CFO Platform - Documentation

**Last Updated**: November 4, 2025

---

## 📁 Documentation Structure

### **📋 01-planning/** - Project Planning & Specifications
Complete specifications and planning documents for all platform components.

**Files:**
- `HQ Console Navigation & Page Specifications.md` - Complete HQ Console specs
- `CFO App Navigation & Page Spec.md` - Complete CFO App specs
- `HQ_Console_Development_Plan.md` - Development roadmap
- `HQ_Console_Complete_Breakdown.md` - Detailed breakdown
- PDF versions of specifications

**Use When:** Planning features, understanding requirements, designing new modules

---

### **🚀 02-implementation/** - Development Progress & Phase Documentation
Active development tracking and phase-specific implementation guides.

**Files:**
- `Progress_Tracker.md` ⭐ **START HERE** - Single source of truth for current status
- `Development_Progress_Log.md` - Detailed development log
- `Phase_1_Foundation.md` - Foundation phase (completed)
- `Phase_2_Implementation.md` - Current phase implementation
- `Task_Milestone_Implementation.md` - Task/milestone system docs
- `Task_Milestone_Budget_Flow.md` - Budget workflow
- `Project_Status_Review.md` - Status reviews

**Use When:** Daily development, tracking progress, understanding what's been built

---

### **☁️ 03-deployment/** - Deployment & DevOps
Guides for deploying to Vercel and troubleshooting deployment issues.

**Files:**
- `VERCEL_QUICKSTART.md` - Quick deployment guide
- `DEPLOYMENT_SUMMARY.md` - Deployment overview
- `DEPLOYMENT_VISUAL_GUIDE.md` - Visual deployment guide
- `Vercel_Deployment_Fix.md` - Common fixes
- `Vercel_Build_Error_Fix.md` - Build error solutions
- `Vercel_Advanced_Troubleshooting.md` - Advanced troubleshooting

**Use When:** Deploying, fixing build errors, troubleshooting production issues

---

### **🧪 04-testing/** - Testing Scenarios & QA
Test plans and scenarios for feature validation.

**Files:**
- `PlanBuilder_Testing_Scenarios.md` - Plan Builder test cases

**Use When:** Testing features, writing test cases, QA validation

---

### **🏗️ 05-architecture/** - System Architecture & Integration
High-level system design, integration flows, and architecture diagrams.

**Files:**
- `Platform_Integration_Analysis.md` - Integration architecture
- `System_Integration_Flow.md` - System flow diagrams
- `Machine_Diagram_Explained.md` - Machine/state diagrams

**Use When:** Understanding system design, planning integrations, architectural decisions

---

### **📚 reference/** - Original Specifications
Original PRD and specification documents (unchanged reference material).

**Files:**
- `Green_Lines_CFO_Platform_PRD_v1.1.md` - Product Requirements Document
- `Green_Lines_HQ_Console_Spec_v1.0.md` - HQ Console original spec
- `Green_Lines_CFO_App_Spec_v1.0.md` - CFO App original spec
- `Green_Lines_Agent_Platform_Spec_v1.0.docx` - Partner/Agent App spec
- `Plan Builder Form.md` - Plan Builder form specs
- `Example Senario.md` - Example scenarios
- DOCX and ODT versions

**Use When:** Referencing original requirements, verifying specs

---

### **🔬 Technology_Research/** - Technology Stack & Catalogs
Technology decisions, KPI catalogs, and milestone templates.

**Files:**
- `Technology_Stack_Recommendations.md` - Tech stack decisions
- `Master_KPI_Catalog_Expanded.xlsx` - Complete KPI catalog
- `Master_Milestone_Catalog.xlsx` - Milestone templates

**Use When:** Technology decisions, KPI definitions, milestone planning

---

### **📦 archive/** - Historical Documents
Deprecated or historical documents kept for reference.

**Files:**
- `Conversation_Log.md` - Old conversation logs
- `DOCUMENTATION_CLEANUP.md` - Previous cleanup notes

---

## 🎯 Quick Start Guide

### For New Developers
1. Start with `02-implementation/Progress_Tracker.md` to see current status
2. Read `01-planning/HQ Console Navigation & Page Specifications.md` for feature specs
3. Check `Project_Guide.md` (root) for development setup

### For Planning New Features
1. Check `01-planning/` for existing specifications
2. Review `05-architecture/` for system constraints
3. Update `02-implementation/Progress_Tracker.md` when starting

### For Deployment
1. Follow `03-deployment/VERCEL_QUICKSTART.md`
2. If issues arise, check troubleshooting guides in `03-deployment/`

---

## 📝 Core Documents

### `Project_Guide.md` (Root)
**Master project guide** with setup instructions, architecture overview, and getting started information.

### `02-implementation/Progress_Tracker.md` ⭐
**Single source of truth** for what's done, in progress, and pending. Update this after every feature completion.

---

## 🔄 Maintenance Guidelines

### When Adding New Documentation:
- **Planning docs** → `01-planning/`
- **Implementation/progress** → `02-implementation/`
- **Deployment guides** → `03-deployment/`
- **Test cases** → `04-testing/`
- **Architecture/design** → `05-architecture/`
- **Original specs** → `reference/`
- **Old/obsolete** → `archive/`

### When Updating Progress:
Always update `02-implementation/Progress_Tracker.md` - it's the single source of truth.

---

## 🏗️ Three-System Architecture

This platform consists of three interconnected applications:

1. **HQ Console** (`apps/hq-console/`)
   - Internal operations dashboard
   - Plan creation and monitoring
   - Partner management
   - Billing and CRM

2. **CFO App** (Future - `apps/customer-app/`)
   - Client-facing application
   - Report viewing and approvals
   - Service purchases

3. **Partner App** (Future - `apps/agent-app/`)
   - Partner portal
   - Assignment management
   - Deliverable uploads

---

**Repository**: https://github.com/malukishtiaq/green-lines-cfo-platform
