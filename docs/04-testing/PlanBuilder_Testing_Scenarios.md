# PlanBuilder Testing Scenarios

## 🧪 Comprehensive Testing Guide for PlanBuilder Feature

### **Basic Information Stage Testing**

#### ✅ **Happy Path Scenarios**
1. **Complete Form Submission**
   - Fill all required fields (Plan Name, Industry, Company Size, Duration Type, Start Date, Address)
   - Verify form validation passes
   - Verify "Next" button enables

2. **Optional Fields**
   - Leave optional fields empty (Description, Working Days, Site Type, Access Requirements)
   - Verify form still submits successfully

3. **Conditional Fields**
   - Select "FIXED" duration type → verify "Duration Weeks" field appears
   - Select "ONGOING" duration type → verify "Duration Weeks" field hides
   - Test with valid duration weeks (1-104)

#### ❌ **Error Scenarios**
1. **Required Field Validation**
   - Leave Plan Name empty → verify error message "Required"
   - Leave Industry empty → verify error message
   - Leave Company Size empty → verify error message
   - Leave Duration Type empty → verify error message
   - Leave Start Date empty → verify error message
   - Leave Address empty → verify error message

2. **Invalid Input**
   - Enter Plan Name > 120 characters → verify character limit
   - Enter Description > 500 characters → verify character limit
   - Enter Duration Weeks < 1 or > 104 → verify range validation

---

### **Milestones Stage Testing**

#### ✅ **Happy Path Scenarios**

1. **Single Milestone Creation**
   - Click "Add Milestone"
   - Fill: Sequence=1, Name="Planning", Duration=2 weeks, Budget=30%, Deliverables="Site survey"
   - Save milestone
   - Verify milestone appears in table
   - Verify budget total shows 30%

2. **Multiple Milestones Creation**
   - Add milestone 1: Sequence=1, Name="Planning", Duration=2 weeks, Budget=30%
   - Add milestone 2: Sequence=2, Name="Implementation", Duration=4 weeks, Budget=50%
   - Add milestone 3: Sequence=3, Name="Testing", Duration=2 weeks, Budget=20%
   - Verify total budget = 100%
   - Verify "Next" button enables

3. **Milestone Editing**
   - Create a milestone
   - Click edit button (pencil icon)
   - Modify duration from 2 to 3 weeks
   - Modify budget from 30% to 40%
   - Save changes
   - Verify changes reflected in table
   - Verify budget total updates

4. **Milestone Deletion**
   - Create 3 milestones with 100% budget
   - Delete middle milestone
   - Verify milestone removed from table
   - Verify budget total decreases accordingly

5. **Critical Path Marking**
   - Create milestone with "Mark as Critical Path" checked
   - Verify "Critical" tag appears in table
   - Verify red color in visual timeline

#### ❌ **Error Scenarios**

1. **Budget Validation**
   - Create milestones totaling < 100% (e.g., 50%)
   - Try to click "Next" → verify error message about budget
   - Verify "Next" button disabled with tooltip

2. **Budget Over 100%**
   - Create milestones totaling > 100% (e.g., 150%)
   - Verify warning message shows over budget amount
   - Verify "Next" button disabled

3. **Empty Milestones**
   - Try to click "Next" without any milestones
   - Verify error message "Please add at least one milestone"

4. **Invalid Milestone Data**
   - Try to save milestone with empty name → verify validation error
   - Try to save milestone with duration < 1 or > 52 weeks → verify validation error
   - Try to save milestone with budget < 0 or > 100% → verify validation error
   - Try to save milestone with empty deliverables → verify validation error

---

### **Navigation & Workflow Testing**

#### ✅ **Stage Navigation**
1. **Forward Navigation**
   - Complete Stage 1 (Basic Info) → verify can proceed to Stage 2
   - Complete Stage 2 (Milestones) → verify can proceed to submission

2. **Backward Navigation**
   - Go to Stage 2 → click "Back" → verify returns to Stage 1
   - Verify form data preserved when going back

3. **Stage Validation**
   - Try to skip Stage 1 without completing required fields → verify blocked
   - Try to skip Stage 2 without 100% budget → verify blocked

#### ❌ **Navigation Error Scenarios**
1. **Incomplete Stage Progression**
   - Try to go from Stage 1 to Stage 2 with missing required fields
   - Verify error message and blocked progression

2. **Budget Validation Blocking**
   - Complete Stage 1, go to Stage 2
   - Add milestones but don't reach 100% budget
   - Try to proceed → verify blocked with budget error

---

### **Auto-Save & Draft Testing**

#### ✅ **Auto-Save Functionality**
1. **Form Auto-Save**
   - Fill partial data in Stage 1
   - Verify "Draft Auto-Saved" tag appears
   - Verify data persists on page refresh

2. **Milestone Auto-Save**
   - Add milestones in Stage 2
   - Verify milestones persist on page refresh
   - Verify budget calculations preserved

3. **Stage Position Auto-Save**
   - Navigate to Stage 2
   - Refresh page → verify returns to Stage 2

#### ❌ **Auto-Save Error Scenarios**
1. **Corrupted Draft Recovery**
   - Manually corrupt localStorage data
   - Refresh page → verify graceful error handling
   - Verify draft cleared and fresh start

---

### **Visual Timeline Testing**

#### ✅ **Timeline Display**
1. **Timeline Generation**
   - Create milestones with different durations
   - Verify timeline shows correct week ranges
   - Verify budget percentages displayed

2. **Critical Path Visualization**
   - Mark milestones as critical path
   - Verify red color coding in timeline
   - Verify "Critical" tags displayed

#### ❌ **Timeline Error Scenarios**
1. **Empty Timeline**
   - Verify empty state message when no milestones
   - Verify "Add Milestone" button prominent

---

### **Submit & Integration Testing**

#### ✅ **Plan Submission**
1. **Successful Submission**
   - Complete all required fields in both stages
   - Click "Submit Plan"
   - Verify loading state shows "Saving..."
   - Verify success message
   - Verify redirect to /plans page
   - Verify draft cleared from localStorage

2. **API Integration**
   - Verify plan data sent to /api/plans endpoint
   - Verify correct data structure sent
   - Verify plan appears in plans list after creation

#### ❌ **Submission Error Scenarios**
1. **Network Errors**
   - Simulate network failure during submission
   - Verify error message displayed
   - Verify form remains accessible for retry

2. **API Errors**
   - Simulate API error response
   - Verify error message displayed
   - Verify user can retry submission

---

### **Performance & Edge Cases**

#### ✅ **Performance Testing**
1. **Large Data Sets**
   - Create 20+ milestones
   - Verify performance remains acceptable
   - Verify UI remains responsive

2. **Long Text Input**
   - Enter very long descriptions and deliverables
   - Verify no performance degradation

#### ❌ **Edge Case Scenarios**
1. **Browser Compatibility**
   - Test in different browsers
   - Verify localStorage functionality works

2. **Mobile Responsiveness**
   - Test on mobile devices
   - Verify form usability on small screens

---

### **Test Data Examples**

#### **Valid Test Plans**
```json
{
  "planName": "ERP Implementation - ABC Corp",
  "industry": "Technology",
  "companySize": "SME",
  "durationType": "FIXED",
  "durationWeeks": 12,
  "milestones": [
    { "sequence": 1, "name": "Planning", "durationWeeks": 2, "budgetPercent": 20 },
    { "sequence": 2, "name": "Setup", "durationWeeks": 4, "budgetPercent": 40 },
    { "sequence": 3, "name": "Testing", "durationWeeks": 3, "budgetPercent": 25 },
    { "sequence": 4, "name": "Go-Live", "durationWeeks": 3, "budgetPercent": 15 }
  ]
}
```

#### **Invalid Test Cases**
- Plan name: "" (empty)
- Duration weeks: 0 or 105
- Budget total: 50% or 150%
- Milestone name: "" (empty)
- Milestone duration: 0 or 53 weeks

---

### **Automated Test Checklist**

#### **Manual Testing Priority**
1. ✅ Basic form validation (required fields)
2. ✅ Milestone creation, editing, deletion
3. ✅ Budget validation (100% requirement)
4. ✅ Navigation between stages
5. ✅ Auto-save functionality
6. ✅ Plan submission flow
7. ✅ Error handling and messages

#### **Regression Testing**
- Test after any code changes
- Verify existing functionality still works
- Test with different data combinations

---

### **Bug Report Template**

When reporting issues, include:
1. **Steps to Reproduce**: Exact steps taken
2. **Expected Result**: What should happen
3. **Actual Result**: What actually happened
4. **Browser/Device**: Testing environment
5. **Screenshots**: Visual evidence if applicable
6. **Console Errors**: Any JavaScript errors in browser console

---

This testing guide ensures the PlanBuilder feature is stable and reliable for production use.
