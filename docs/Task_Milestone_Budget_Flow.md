# Task-Milestone-Budget Flow Documentation

## Business Flow

### 1. Customer Onboarding
- Customer is created in the system
- Basic information collected

### 2. Task & Budget Agreement
- Create a Task for the customer
- Set the total budget for the task
- Task represents the entire project/engagement

### 3. Plan & Milestone Creation
- Create a Plan linked to the Task
- Break down the Plan into Milestones
- Each Milestone has:
  - Budget allocation (percentage of total task budget)
  - Deliverables
  - Duration
  - Dependencies

### 4. Execution & Tracking
- As work progresses, update milestone status
- Track actual costs against budget
- Mark milestones as completed

### 5. Dashboard Analytics
- Show task progress across all customers
- Display budget utilization
- Show completed vs pending milestones
- Revenue and cost analytics

## Data Relationships

```
Customer
  └── Task (with total budget)
        ├── Plan
        │     └── Milestones (with budget %)
        ├── Actual costs
        └── Status tracking
```

## Dashboard Metrics

1. **Customer Metrics**
   - Total customers
   - Active customers with ongoing tasks

2. **Task Metrics**
   - Total tasks
   - Pending tasks
   - In-progress tasks
   - Completed tasks
   - Task completion rate

3. **Financial Metrics**
   - Total task budgets
   - Actual costs incurred
   - Budget utilization %
   - Revenue from completed tasks

4. **Milestone Metrics**
   - Total milestones
   - Completed milestones
   - Pending milestones
   - Milestone completion rate by task

