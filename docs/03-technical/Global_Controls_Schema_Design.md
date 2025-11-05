# Global Controls - Database Schema Design

## Overview
This document outlines the database schema design for Global Controls (Top Bar) functionality including Notifications, User Preferences, Search, Currency, and Filters.

## New Database Models

### 1. Notification Model
**Purpose**: Store system notifications for users (plan updates, approvals, assignments, etc.)

```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        NotificationType
  title       String
  message     String
  link        String?   // Deep link to relevant page
  
  // Reference to source entity (polymorphic)
  entityType  String?   // "TASK" | "PLAN" | "CUSTOMER" | "PARTNER" | "CONTRACT"
  entityId    String?   // ID of the related entity
  
  isRead      Boolean  @default(false)
  readAt      DateTime?
  
  priority    NotificationPriority @default(NORMAL)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("notifications")
}

enum NotificationType {
  TASK_ASSIGNED
  TASK_COMPLETED
  TASK_OVERDUE
  PLAN_CREATED
  PLAN_UPDATED
  PLAN_COMPLETED
  PARTNER_ASSIGNED
  CONTRACT_SIGNED
  APPROVAL_PENDING
  PAYMENT_RECEIVED
  SYSTEM_ALERT
  CUSTOM
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

**Relationships**:
- `User` → `Notification` (One-to-Many)
- Soft reference to any entity via `entityType` + `entityId`

---

### 2. UserPreference Model
**Purpose**: Store user-specific preferences (currency, timezone, date format, default filters)

```prisma
model UserPreference {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Display Preferences
  language    String   @default("en")      // "en" | "ar"
  currency    String   @default("AED")     // "AED" | "SAR" | "USD" | "EUR"
  timezone    String   @default("Asia/Dubai")
  dateFormat  String   @default("DD/MM/YYYY")
  
  // Default Filters (applied globally)
  defaultRegion     String?   // "GCC" | "MENA" | "APAC" | "EU"
  defaultOrg        String?   // Organization ID (for future multi-org support)
  defaultDateRange  String    @default("THIS_MONTH")
  
  // Notification Preferences
  emailNotifications    Boolean @default(true)
  pushNotifications     Boolean @default(true)
  smsNotifications      Boolean @default(false)
  
  // UI Preferences
  sidebarCollapsed      Boolean @default(false)
  dashboardLayout       Json?   // Custom dashboard layout
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("user_preferences")
}
```

**Relationships**:
- `User` → `UserPreference` (One-to-One)

---

### 3. SearchLog Model
**Purpose**: Track global search queries for analytics and quick access to recent searches

```prisma
model SearchLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  query       String
  category    String?  // "ALL" | "CUSTOMERS" | "PLANS" | "TASKS" | "PARTNERS"
  resultsCount Int     @default(0)
  
  // Track what user clicked
  clickedEntityType String?
  clickedEntityId   String?
  
  createdAt   DateTime @default(now())
  
  @@index([userId, createdAt])
  @@map("search_logs")
}
```

**Relationships**:
- `User` → `SearchLog` (One-to-Many)

---

### 4. NotificationPreference Model
**Purpose**: Fine-grained notification settings per notification type

```prisma
model NotificationPreference {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  notificationType  NotificationType
  
  // Channels
  emailEnabled      Boolean  @default(true)
  pushEnabled       Boolean  @default(true)
  smsEnabled        Boolean  @default(false)
  inAppEnabled      Boolean  @default(true)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([userId, notificationType])
  @@map("notification_preferences")
}
```

**Relationships**:
- `User` → `NotificationPreference` (One-to-Many)

---

## Updated User Model

```prisma
model User {
  // ... existing fields ...
  
  // New Relations
  notifications              Notification[]
  preference                 UserPreference?
  searchLogs                 SearchLog[]
  notificationPreferences    NotificationPreference[]
}
```

---

## Interaction Flows

### 1. Notification Flow
```
Event Occurs (Task Assigned)
  ↓
Create Notification Record
  ↓
Check User's NotificationPreference for TASK_ASSIGNED
  ↓
Send via enabled channels (Email/Push/SMS/In-App)
  ↓
User sees notification in Top Bar
  ↓
User clicks → Mark as read (readAt = now())
  ↓
Redirect to entityType + entityId (deep link)
```

### 2. User Preference Flow
```
User Login
  ↓
Fetch UserPreference
  ↓
Apply: currency, language, defaultRegion, defaultDateRange
  ↓
All pages use these defaults
  ↓
User changes preference in User Menu
  ↓
Update UserPreference
  ↓
Apply globally without reload (React Context)
```

### 3. Global Search Flow
```
User types in search bar
  ↓
Debounced API call /api/search?q=query&category=ALL
  ↓
Query across: customers.name/email, plans.name, tasks.title, partners.name
  ↓
Log search in SearchLog
  ↓
Return ranked results
  ↓
User clicks result → Log clickedEntityType/Id
  ↓
Navigate to entity detail page
```

---

## Database Indexes

### Critical Indexes for Performance:

1. **Notification**:
   - `@@index([userId, isRead])` - Fast unread notifications query
   - `@@index([userId, createdAt])` - Fast recent notifications query

2. **SearchLog**:
   - `@@index([userId, createdAt])` - Fast recent searches query

3. **NotificationPreference**:
   - `@@unique([userId, notificationType])` - Fast preference lookup

---

## API Endpoints Required

### Notifications:
- `GET /api/notifications` - List notifications (with pagination, filter by isRead)
- `GET /api/notifications/unread-count` - Get count of unread notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### User Preferences:
- `GET /api/user/preferences` - Get current user's preferences
- `PATCH /api/user/preferences` - Update user preferences
- `POST /api/user/preferences/reset` - Reset to defaults

### Search:
- `GET /api/search?q=query&category=ALL` - Global search
- `GET /api/search/recent` - Get recent searches

### Notification Preferences:
- `GET /api/notifications/preferences` - Get all notification preferences
- `PATCH /api/notifications/preferences` - Update notification preferences

---

## Notification Triggers

### System Events → Auto-Create Notifications:

1. **Task Events**:
   - `TASK_ASSIGNED` - When user is assigned to a task
   - `TASK_COMPLETED` - When assigned task is completed
   - `TASK_OVERDUE` - When task passes due date

2. **Plan Events**:
   - `PLAN_CREATED` - When new plan is created (notify manager/admin)
   - `PLAN_UPDATED` - When plan is updated (notify stakeholders)
   - `PLAN_COMPLETED` - When plan is completed

3. **Partner Events**:
   - `PARTNER_ASSIGNED` - When partner is assigned to a service

4. **Contract Events**:
   - `CONTRACT_SIGNED` - When contract is signed

5. **Approval Events**:
   - `APPROVAL_PENDING` - When approval is needed

6. **Payment Events**:
   - `PAYMENT_RECEIVED` - When payment is received

---

## Data Retention & Cleanup

### Policies:

1. **Notifications**:
   - Keep read notifications for 30 days
   - Keep unread notifications indefinitely
   - Archive old notifications (>90 days)

2. **SearchLogs**:
   - Keep for 90 days
   - Use for search analytics

3. **Preferences**:
   - Keep indefinitely (small data)

---

## Currency Support

### Supported Currencies:
- **AED** - UAE Dirham (default)
- **SAR** - Saudi Riyal
- **USD** - US Dollar
- **EUR** - Euro
- **GBP** - British Pound

### Implementation:
- Store all amounts in base currency (AED)
- Convert on display based on user preference
- Use exchange rate API (e.g., exchangerate-api.io)
- Cache exchange rates daily

---

## Global Filters Context

### Filters Applied Globally:
1. **Date Range**: Applied to all time-series data
2. **Region**: Filter by GCC/MENA/APAC/EU
3. **Organization**: (Future) Multi-org support
4. **Currency**: Display currency preference

### Implementation:
- React Context Provider wrapping entire app
- Store filters in context state
- All data-fetching components read from context
- Persist to UserPreference on change

---

## Security Considerations

1. **Notifications**:
   - Users can only see their own notifications
   - Row-level security: `userId` check in all queries

2. **Preferences**:
   - Users can only update their own preferences
   - Validate all inputs server-side

3. **Search**:
   - Respect user permissions (role-based)
   - Don't return data user doesn't have access to

---

## Performance Considerations

1. **Notifications**:
   - Paginate results (10-20 per page)
   - Use polling (every 30s) or WebSocket for real-time
   - Index on `userId` + `isRead` + `createdAt`

2. **Search**:
   - Use full-text search indexes
   - Debounce search input (300ms)
   - Limit results to 50 per query
   - Use PostgreSQL `tsvector` for better search

3. **Preferences**:
   - Cache in React Context
   - Only fetch once on login
   - Update locally + persist to DB

---

## Migration Strategy

1. **Phase 1**: Add new models to schema
2. **Phase 2**: Create seed data for existing users
3. **Phase 3**: Update User model relations
4. **Phase 4**: Implement API endpoints
5. **Phase 5**: Build UI components
6. **Phase 6**: Wire up functionality
7. **Phase 7**: Test thoroughly
8. **Phase 8**: Deploy

---

**Next Steps**:
1. Update `schema.prisma` with new models
2. Generate migration
3. Seed default data
4. Build API endpoints
5. Build UI components

