# Green Lines CFO Platform - Master Documentation Index

## 📚 Documentation Structure

This directory contains strategic documentation for the Green Lines CFO Platform development. Each document serves a specific purpose for AI assistant reference during development.

---

## 🎯 Core Documents (Always Reference These)

### **1. Progress_Tracker.md** 
**Purpose**: Single source of truth for tracking what's done, what's in progress, and what's pending.  
**Update Frequency**: After every significant feature completion  
**Contains**: 
- Current phase status
- Completed features checklist
- Pending features
- Known issues
- Database status
- Deployment status

### **2. Phase_1_Foundation.md**
**Purpose**: Complete documentation of Phase 1 foundation work  
**Update Frequency**: Rarely (Phase 1 is complete)  
**Contains**:
- Clean Architecture implementation
- Multi-language setup
- Design system
- HTTP client architecture
- Access control system
- Service architecture
- Authentication system

### **3. Phase_2_Dashboard.md**
**Purpose**: Implementation guide for Phase 2 dashboard features  
**Update Frequency**: As features are completed  
**Contains**:
- KPI cards implementation
- Charts and analytics
- User profile management
- Enhanced data tables
- Responsive design
- Testing requirements

### **4. Phase_3_Customers.md**
**Purpose**: Implementation guide for Phase 3 customer management  
**Update Frequency**: When Phase 3 starts  
**Contains**:
- Customer list and filtering
- Customer profiles
- Customer forms
- Communication history
- Customer analytics

### **5. Phase_4_Plans.md**
**Purpose**: Implementation guide for Phase 4 service plan management  
**Update Frequency**: As features are completed  
**Contains**:
- Plan Builder (completed)
- Plan templates
- Plan approval workflows
- Plan performance tracking
- Plan analytics

### **6. Phase_5_Tasks.md**
**Purpose**: Implementation guide for Phase 5 task management  
**Update Frequency**: When Phase 5 starts  
**Contains**:
- Task creation interface
- Smart assignment engine
- Workload monitoring
- Task status tracking
- Task analytics

---

## 📖 Reference Documents (Use When Needed)

### **reference/** folder
**Purpose**: Original specifications and requirements  
**Contains**:
- Green Lines CFO Platform PRD
- HQ Console Spec
- Agent Platform Spec
- Customer App Spec
- Example scenarios
- Plan Builder form requirements

### **Technology_Research/** folder
**Purpose**: Technology stack decisions and recommendations  
**Contains**:
- Technology Stack Recommendations
- Library comparisons
- Architecture decisions

---

## 🗂️ Archived Documents (Historical Reference Only)

### **archive/** folder
**Purpose**: Old documents kept for historical reference  
**Contains**:
- Deployment troubleshooting guides (issues resolved)
- Old conversation logs
- Temporary implementation notes
- Build error fixes (issues resolved)

---

## 📋 Document Usage Rules for AI Assistant

### **When Starting New Feature**:
1. Check `Progress_Tracker.md` to see current status
2. Read relevant `Phase_X_*.md` for implementation details
3. Reference `reference/` folder for requirements
4. Update `Progress_Tracker.md` when feature is complete

### **When User Reports Issue**:
1. Check `Progress_Tracker.md` for known issues
2. Fix the issue
3. Update `Progress_Tracker.md` if it was a known issue
4. Do NOT create new troubleshooting documents

### **When Phase is Complete**:
1. Update `Progress_Tracker.md` with completion status
2. Archive any temporary documents to `archive/`
3. Keep phase document for future reference

### **Document Creation Rules**:
- ❌ DO NOT create documents for: bug fixes, deployment issues, temporary notes
- ❌ DO NOT create new documents without user request
- ✅ DO update `Progress_Tracker.md` regularly
- ✅ DO update relevant `Phase_X_*.md` when adding features
- ✅ DO keep documentation clean and organized

---

## 🎯 Current Active Documents

Based on current phase (Phase 2 - Week 3):

| Document | Status | Use For |
|----------|--------|---------|
| `Progress_Tracker.md` | 🟢 Active | Daily development tracking |
| `Phase_1_Foundation.md` | ✅ Complete | Reference for architecture patterns |
| `Phase_2_Dashboard.md` | 🟢 Active | Current development guide |
| `Phase_3_Customers.md` | ⏳ Pending | Future reference |
| `Phase_4_Plans.md` | 🟡 Partial | Reference for Plan Builder |
| `Phase_5_Tasks.md` | ⏳ Pending | Future reference |
| `reference/*` | 📚 Reference | Requirements and specs |

---

## 🧹 Cleanup Completed

### **Archived** (moved to `archive/` folder):
- Conversation_Log.md → Old conversations
- DEPLOYMENT_SUMMARY.md → Deployment issues resolved
- DEPLOYMENT_VISUAL_GUIDE.md → Deployment issues resolved
- Vercel_Advanced_Troubleshooting.md → Issues resolved
- Vercel_Build_Error_Fix.md → Issues resolved
- Vercel_Deployment_Fix.md → Issues resolved
- VERCEL_QUICKSTART.md → Deployment working now
- PlanBuilder_Testing_Scenarios.md → Testing notes
- HQ_Console_Complete_Breakdown.md → Merged into phase docs
- Machine_Diagram_Explained.md → System architecture notes

### **Consolidated**:
- Development_Progress_Log.md → Merged into `Progress_Tracker.md`
- Project_Status_Review.md → Merged into `Progress_Tracker.md`
- HQ_Console_Development_Plan.md → Split into phase documents
- Phase_2_Implementation.md → Renamed to `Phase_2_Dashboard.md`

### **Kept**:
- Project_Guide.md → High-level project overview
- Platform_Integration_Analysis.md → Integration architecture
- System_Integration_Flow.md → System flow diagrams
- reference/ → Original specifications
- Technology_Research/ → Tech stack decisions

---

## 📝 Quick Reference

**Current Phase**: Phase 2 (Dashboard Enhancement) - Week 3 Day 3  
**Current Task**: Charts & Analytics Implementation  
**Next Document to Update**: `Progress_Tracker.md` after charts are complete  
**Active Phase Document**: `Phase_2_Dashboard.md`

---

*This index provides a clean, strategic documentation structure for efficient AI-assisted development. Always refer to this index when unsure which document to use or update.*

