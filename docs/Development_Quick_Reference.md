# Development Quick Reference Guide

## Current Project Status

### ✅ Phase 1: Foundation Setup - COMPLETED
- **Commit**: `d1e3ed7a`
- **Status**: All deliverables completed
- **Repository**: https://github.com/malukishtiaq/green-lines-cfo-platform

### 🚀 Phase 2: Core Dashboard Enhancement - CURRENT
- **Target**: Complete by end of Week 4
- **Focus**: Enhanced widgets, user management, advanced tables

### 📋 Phase 3: Customer Management - PLANNED
- **Target**: Weeks 5-6
- **Focus**: CRM features, communication tracking

### 📋 Phase 4: Service Plan Management - PLANNED
- **Target**: Weeks 7-8
- **Focus**: Plan Builder, templates, workflows

### 📋 Phase 5: Task Management & Assignment - PLANNED
- **Target**: Weeks 9-10
- **Focus**: Smart assignment, AI/ML integration

---

## Quick Start Commands

### Development Setup
```bash
# Clone repository
git clone https://github.com/malukishtiaq/green-lines-cfo-platform.git
cd green-lines-cfo-platform/apps/hq-console

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Set up database
npm run db:generate
npm run db:push
npm run db:seed

# Start development
npm run dev
```

### Demo Credentials
- **Email**: admin@greenlines.com
- **Password**: password123

---

## Phase 2 Implementation Checklist

### Week 3 Tasks
- [ ] **Day 1-2**: Advanced KPI Cards
  - Real-time data updates
  - Trend indicators
  - Color-coded metrics

- [ ] **Day 3-4**: Interactive Charts
  - Revenue trends (line chart)
  - Customer distribution (pie chart)
  - Task status overview (bar chart)
  - Monthly performance (area chart)

- [ ] **Day 5-7**: User Profile Management
  - Profile page with editing
  - Avatar upload
  - Password change
  - Settings page

### Week 4 Tasks
- [ ] **Day 1-2**: Enhanced Data Tables
  - Multi-column sorting
  - Advanced filtering
  - Search functionality
  - Bulk actions

- [ ] **Day 3-4**: Error Handling & UX
  - Loading states
  - Error boundaries
  - User feedback
  - Toast notifications

- [ ] **Day 5-7**: Responsive Design
  - Mobile optimization
  - Tablet support
  - Testing and bug fixes

---

## Required Dependencies for Phase 2

```bash
# Install Phase 2 dependencies
npm install recharts react-hook-form zod zustand
npm install @hookform/resolvers react-hot-toast
npm install framer-motion lucide-react
npm install @tanstack/react-query
npm install react-dropzone date-fns
```

---

## File Structure for Phase 2

```
src/
├── components/
│   ├── charts/           # Chart components
│   ├── dashboard/        # Dashboard widgets
│   ├── tables/          # Enhanced tables
│   ├── forms/           # Form components
│   ├── ui/              # UI utilities
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── store/               # Zustand state management
├── lib/                 # Utility libraries
└── types/               # TypeScript types
```

---

## API Endpoints to Implement

### Dashboard API
- `GET /api/dashboard/metrics` - Dashboard KPIs
- `GET /api/dashboard/charts/*` - Chart data

### User Management API
- `GET /api/users/profile` - User profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Avatar upload
- `PUT /api/users/password` - Password change

### Data Export API
- `GET /api/tasks/export` - Export tasks
- `GET /api/customers/export` - Export customers
- `POST /api/*/bulk-action` - Bulk operations

---

## Success Criteria

### Technical Metrics
- Dashboard loads in < 2 seconds
- All charts render with real data
- User profile management functional
- Data tables support all features
- Mobile responsive design works
- 90%+ test coverage

### Performance Standards
- Core Web Vitals pass
- Bundle size < 500KB
- API response < 200ms
- Database queries optimized

---

## Testing Commands

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build
```

---

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

---

## Deployment Commands

```bash
# Build and test
npm run build
npm run test

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls
```

---

## Key Files to Monitor

### Phase 2 Priority Files
- `src/components/dashboard/KPICards.tsx`
- `src/components/charts/RevenueChart.tsx`
- `src/app/profile/page.tsx`
- `src/components/tables/TaskTable.tsx`
- `src/components/ui/ErrorBoundary.tsx`

### Configuration Files
- `package.json` - Dependencies
- `prisma/schema.prisma` - Database schema
- `next.config.ts` - Next.js configuration
- `.env.local` - Environment variables

---

## Common Issues & Solutions

### Database Connection Issues
```bash
# Check database URL in .env.local
# Ensure PostgreSQL is running
# Run: npm run db:push
```

### Authentication Issues
```bash
# Check NEXTAUTH_SECRET in .env.local
# Verify NEXTAUTH_URL is correct
# Clear browser cookies
```

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Development Best Practices

### Code Standards
- Use TypeScript strict mode
- Follow ESLint rules
- Write JSDoc comments
- Use meaningful variable names
- Keep components small and focused

### Git Workflow
- Create feature branches
- Write descriptive commit messages
- Test before committing
- Review code before merging
- Keep commits atomic

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets
- Use proper caching strategies
- Monitor bundle size

---

*This quick reference guide provides essential information for efficient development of the Green Lines CFO Platform.*
