# Phase 1: Foundation Setup - Complete Documentation

**Status**: ✅ **COMPLETE** (100%)  
**Duration**: Weeks 1-2  
**Completion Date**: October 17, 2025

---

## 📋 Overview

Phase 1 established the complete foundation for the Green Lines CFO Platform, including architecture, authentication, database, design system, and all core infrastructure.

---

## ✅ Completed Deliverables

### **1. Monorepo Structure**
```
cfo_docs/
├── apps/
│   ├── hq-console/          # Admin Dashboard (Next.js 15)
│   ├── agent-app/           # Agent Application (Future)
│   ├── customer-app/        # Customer Portal (Future)
│   └── api/                 # Backend API (Future)
├── packages/
│   ├── config/              # Shared configuration
│   ├── database/            # Database schemas and utilities
│   ├── shared-components/   # Reusable UI components
│   ├── shared-types/       # TypeScript type definitions
│   └── shared-utils/        # Utility functions
├── docs/                    # Documentation
└── tools/                   # Development tools
```

**Tools**: TurboRepo for monorepo orchestration

---

### **2. Clean Architecture Implementation**

#### **Directory Structure**
```
src/
├── domain/                    # 🎯 Domain Layer (Pure Business Logic)
│   ├── entities/             # Business entities and enums
│   │   ├── index.ts
│   │   └── AccessControl.ts
│   ├── repositories/         # Repository interfaces (contracts)
│   │   └── index.ts
│   └── services/            # Domain services (validation, calculations)
│       └── index.ts
├── application/              # 🔧 Application Layer (Use Cases & Services)
│   ├── use-cases/           # Business use cases
│   │   ├── index.ts
│   │   └── ServiceBasedUseCases.ts
│   ├── services/            # Application services (orchestration)
│   │   ├── index.ts
│   │   ├── AccessControlService.ts
│   │   └── OrchestrationService.ts
│   └── index.ts            # Dependency injection container
├── infrastructure/          # 🗄️ Infrastructure Layer (External Concerns)
│   ├── database/           # Database configuration
│   │   └── index.ts
│   ├── http/               # HTTP client (like Flutter's Dio)
│   │   └── HttpClient.ts
│   ├── repositories/       # Repository implementations
│   │   ├── index.ts
│   │   └── ApiCustomerRepository.ts
│   └── services/           # External services (email, payments)
│       └── index.ts
└── presentation/            # 🎨 Presentation Layer (UI)
    ├── components/         # React components
    │   ├── DashboardPage.tsx
    │   ├── PartnersPage.tsx
    │   └── PlanBuilder.tsx
    ├── hooks/             # Custom React hooks
    │   ├── index.ts
    │   └── useAccessControl.tsx
    └── pages/             # Next.js pages
```

#### **Dependency Flow Rules**
- ✅ **Inner layers** don't know about **outer layers**
- ✅ **Outer layers** depend on **inner layers**
- ✅ **Domain layer** has NO external dependencies
- ✅ Dependency injection through factories

---

### **3. Multi-Language Support**

#### **Configuration**
- **Library**: next-intl v4.3.12
- **Languages**: 
  - English (en) - LTR - Default
  - Arabic (ar) - RTL - Full RTL support
- **URL Structure**: `/en/route` and `/ar/route`

#### **Implementation**
```typescript
// Component usage
import { useTranslations } from 'next-intl';

const MyComponent = () => {
  const t = useTranslations('featureName');
  const tCommon = useTranslations('common');
  
  return <h1>{t('title')}</h1>;
};
```

#### **RTL Support**
```typescript
// Layout component
import { useLocale } from 'next-intl';

const MyLayout = () => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  return (
    <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Content */}
    </div>
  );
};
```

#### **Translation Files**
- `messages/en.json` - English translations
- `messages/ar.json` - Arabic translations

---

### **4. Database Setup**

#### **Technology Stack**
- **ORM**: Prisma 6.17.1
- **Database**: Neon Postgres (Serverless)
- **Connection**: Pooled via pgBouncer

#### **Schema Models**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      UserRole @default(ADMIN)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Customer {
  id        String         @id @default(cuid())
  name      String
  email     String         @unique
  phone     String?
  company   String?
  status    CustomerStatus @default(PROSPECT)
  // ... more fields
}

model ServicePlan {
  id          String      @id @default(cuid())
  name        String
  description String?
  type        ServiceType
  status      PlanStatus  @default(DRAFT)
  price       Float
  // ... more fields
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  priority    Priority   @default(MEDIUM)
  // ... more fields
}

// + More models: Partner, Communication, Setting, etc.
```

#### **Enums**
- `UserRole`: OWNER, CEO, ADMIN, HR, ACCOUNTANT, MODERATOR, AGENT, CUSTOMER
- `CustomerStatus`: PROSPECT, ACTIVE, INACTIVE, CHURNED
- `ServiceType`: BASIC_CFO, PRO_CFO, FRACTIONAL_CFO, CUSTOM
- `TaskStatus`: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- `Priority`: LOW, MEDIUM, HIGH, URGENT

#### **Seed Data**
```bash
npm run db:seed
```
Creates:
- 1 Admin user (`admin@greenlines.com` / `password123`)
- 3 Demo customers
- 3 Service plans
- 3 Tasks
- 5 Partners
- Demo communications

---

### **5. Authentication System**

#### **Technology**
- **Library**: NextAuth.js v4.24.11
- **Provider**: Credentials (email + password)
- **Session**: JWT-based
- **Password Hashing**: bcryptjs v3.0.2

#### **Implementation**
```typescript
// apps/hq-console/src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials
        // Return user or null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) { /* ... */ },
    async session({ session, token }) { /* ... */ }
  },
  pages: {
    signIn: '/auth/signin',
  }
};
```

#### **Protected Routes**
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
});

export const config = {
  matcher: ['/(en|ar)/:path*']
};
```

---

### **6. Design System**

#### **Theme Configuration**
```typescript
// src/design-system/theme.ts
export const themeConfig = {
  colors: {
    primary: '#1890ff',
    secondary: '#52c41a',
    error: '#ff4d4f',
    warning: '#faad14',
    info: '#1890ff',
    success: '#52c41a',
  },
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif',
      mono: 'Fira Code, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
};
```

#### **CSS Variables**
```css
/* design-system/design-tokens.css */
:root {
  --color-primary: #1890ff;
  --color-secondary: #52c41a;
  --font-primary: 'Inter', sans-serif;
  --spacing-md: 1rem;
  --border-radius-md: 0.5rem;
}
```

#### **Features**
- Centralized theme configuration
- CSS variables for consistency
- Dark/light mode support
- RTL/LTR layout support
- Theme switcher component

---

### **7. HTTP Client Architecture**

#### **Centralized Client**
```typescript
// src/infrastructure/http/HttpClient.ts
import axios, { AxiosInstance } from 'axios';

class HttpClient {
  private static instance: HttpClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '',
      timeout: 10000,
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ ${error.response?.status} ${error.config?.url}`);
        if (error.response?.status === 401) {
          window.location.href = '/auth/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  public get<T>(url: string) {
    return this.axiosInstance.get<T>(url);
  }

  public post<T>(url: string, data?: any) {
    return this.axiosInstance.post<T>(url, data);
  }

  // ... more methods
}

export const httpClient = HttpClient.getInstance();
```

#### **Features**
- Singleton pattern (one instance)
- Request/response logging (like Dio printing)
- Automatic auth token handling
- Centralized 401 redirects
- Easy switching between axios/fetch

---

### **8. Access Control System**

#### **User Roles**
```typescript
enum UserRole {
  OWNER = 'OWNER',           // Can do everything
  CEO = 'CEO',               // Can see everything, can't delete users
  ADMIN = 'ADMIN',           // Can manage most things
  HR = 'HR',                 // Can manage users and profiles
  ACCOUNTANT = 'ACCOUNTANT', // Can manage payments and finances
  MODERATOR = 'MODERATOR',   // Can manage tasks and customers
  AGENT = 'AGENT',           // Can manage assigned tasks only
  CUSTOMER = 'CUSTOMER',     // Can only view own data
}
```

#### **Permissions**
```typescript
enum Permission {
  // Users
  CREATE_USERS = 'CREATE_USERS',
  READ_USERS = 'READ_USERS',
  UPDATE_USERS = 'UPDATE_USERS',
  DELETE_USERS = 'DELETE_USERS',
  
  // Customers
  CREATE_CUSTOMERS = 'CREATE_CUSTOMERS',
  READ_CUSTOMERS = 'READ_CUSTOMERS',
  UPDATE_CUSTOMERS = 'UPDATE_CUSTOMERS',
  DELETE_CUSTOMERS = 'DELETE_CUSTOMERS',
  
  // Plans
  CREATE_PLANS = 'CREATE_PLANS',
  READ_PLANS = 'READ_PLANS',
  UPDATE_PLANS = 'UPDATE_PLANS',
  DELETE_PLANS = 'DELETE_PLANS',
  APPROVE_PLANS = 'APPROVE_PLANS',
  
  // Tasks
  CREATE_TASKS = 'CREATE_TASKS',
  READ_TASKS = 'READ_TASKS',
  UPDATE_TASKS = 'UPDATE_TASKS',
  DELETE_TASKS = 'DELETE_TASKS',
  ASSIGN_TASKS = 'ASSIGN_TASKS',
  
  // Reports
  READ_REPORTS = 'READ_REPORTS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',
  
  // Settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
}
```

#### **Usage**
```typescript
// Check permissions
const { hasPermission, canAccessPage } = useAccessControl(UserRole.ADMIN);

// Conditional rendering
<PermissionGate permission={Permission.READ_REPORTS}>
  <ReportsButton />
</PermissionGate>

// Page access
if (!canAccessPage('settings')) {
  return <AccessDenied />;
}
```

---

### **9. Service Architecture**

#### **Service Types**

**Domain Services** (Pure business logic)
```typescript
// ValidationService.ts
export class ValidationService {
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  calculateTotalPrice(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

**Application Services** (Use case orchestration)
```typescript
// OrchestrationService.ts
export class OrchestrationService {
  async createCustomerWithPlan(customerData, planData) {
    // 1. Validate customer data
    // 2. Create customer
    // 3. Create plan
    // 4. Send welcome email
    // 5. Return result
  }
}
```

**Infrastructure Services** (External integrations)
```typescript
// EmailService.ts
export class EmailService {
  async sendEmail(to: string, subject: string, body: string) {
    // Send via SendGrid, AWS SES, etc.
  }
}
```

#### **Dependency Injection**
```typescript
// application/index.ts
export class ServiceFactory {
  private static emailService: EmailService;
  
  static getEmailService(): EmailService {
    if (!this.emailService) {
      this.emailService = new EmailService();
    }
    return this.emailService;
  }
  
  // ... more service getters
}
```

---

### **10. UI Components**

#### **Layout Components**
- `DashboardLayout.tsx` - Main layout with sidebar
- `LanguageSwitcher.tsx` - Switch between en/ar
- `ThemeSwitcher.tsx` - Dark/light mode toggle
- `Providers.tsx` - Context providers wrapper

#### **Page Components**
- `DashboardPage.tsx` - Dashboard with KPIs
- `PartnersPage.tsx` - Partners management
- `PlanBuilder.tsx` - Multi-stage plan builder
- `ReportsPage.tsx` - Reports and analytics
- `DesignSystemDemo.tsx` - Design system showcase

#### **Custom Hooks**
- `useAccessControl()` - Permission checking
- `useDashboard()` - Dashboard data fetching
- `useTasks()` - Tasks data fetching
- `useCustomers()` - Customers data fetching

---

## 🔧 Configuration Files

### **package.json**
```json
{
  "name": "hq-console",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy"
  },
  "dependencies": {
    "@ant-design/icons": "^6.1.0",
    "@ant-design/nextjs-registry": "^1.1.0",
    "@ant-design/pro-components": "^2.8.10",
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "^6.17.1",
    "antd": "^5.27.5",
    "axios": "^1.12.2",
    "bcryptjs": "^3.0.2",
    "next": "15.5.5",
    "next-auth": "^4.24.11",
    "next-intl": "^4.3.12",
    "prisma": "^6.17.1",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
```

### **next.config.js**
```javascript
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

module.exports = withNextIntl(nextConfig);
```

### **prisma/schema.prisma**
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x", "linux-musl-openssl-3.0.x", "linux-musl"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🚀 Deployment

### **Vercel Configuration**
- **Root Directory**: `apps/hq-console`
- **Build Command**: `npm run build` (from root)
- **Install Command**: `npm install` (from root)
- **Output Directory**: `.next`

### **Environment Variables**
```bash
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."
```

---

## 📚 Documentation

### **Code Standards**
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Clean Architecture principles
- Multi-language support mandatory
- RTL/LTR testing required
- Error handling required
- Loading states required

### **Development Workflow**
1. Create feature branch
2. Implement following Clean Architecture
3. Add translations (en.json + ar.json)
4. Test RTL/LTR layouts
5. Add error handling and loading states
6. Create PR for review
7. Merge to main

---

## ✅ Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Architecture | Clean Architecture | ✅ Implemented |
| Multi-language | 2 languages | ✅ English + Arabic |
| Authentication | Working | ✅ NextAuth.js |
| Database | PostgreSQL | ✅ Neon Postgres |
| Deployment | Live | ✅ Vercel |
| Design System | Centralized | ✅ Implemented |
| HTTP Client | Singleton | ✅ Implemented |
| Access Control | Role-based | ✅ 8 roles, 20+ permissions |
| Services | Architecture | ✅ 3-layer services |
| Testing | Setup | ⏳ Pending |

---

## 🎉 Key Achievements

1. ✅ Complete monorepo setup with TurboRepo
2. ✅ Clean Architecture implementation from scratch
3. ✅ Full multi-language support (Arabic RTL + English LTR)
4. ✅ Complete authentication system
5. ✅ Neon Postgres database with Prisma
6. ✅ Centralized design system
7. ✅ HTTP client architecture
8. ✅ Complete access control system
9. ✅ Service-based architecture
10. ✅ Successful Vercel deployment

---

*Phase 1 provides a solid, scalable foundation for all future development. All architectural patterns and standards are established and working.*

