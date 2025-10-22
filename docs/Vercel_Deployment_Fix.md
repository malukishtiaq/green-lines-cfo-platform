# 🚨 Vercel Deployment Fix - Complete Guide

## Issue Summary
Your Vercel deployments are failing. This guide provides the complete fix for all three failing deployments:
- `fq5yfr6h5` on green-lines-cfo-platform-hq-console
- `deqjxonxk` on glerp-cfo-platform-hq-console
- `gjbovphgk` on glerp-cfo-platform-hq-console

## ✅ Changes Made

### 1. Updated `package.json`
**Location:** `apps/hq-console/package.json`

**Changes:**
- ✅ Moved `@prisma/client` from `devDependencies` to `dependencies` (required for production)
- ✅ Moved `prisma` from `devDependencies` to `dependencies` (needed for build-time generation)
- ✅ Updated build script: `"build": "prisma generate && next build"` (ensures Prisma client is generated)
- ✅ Added postinstall script: `"postinstall": "prisma generate"` (auto-generates Prisma client)

**Why:** Vercel needs Prisma client available during the build process.

### 2. Updated `next.config.js`
**Location:** `apps/hq-console/next.config.js`

**Changes:**
- ✅ Added `experimental.serverComponentsExternalPackages` configuration
- ✅ Marked `@prisma/client` and `bcryptjs` as external packages

**Why:** Prevents Next.js from bundling Prisma Client incorrectly in server components.

### 3. Created `.env.example`
**Location:** `apps/hq-console/.env.example`

**Purpose:** Documents required environment variables for deployment.

---

## 🔧 Vercel Configuration Steps

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

#### Required Variables:
```bash
# Database URL (PostgreSQL connection string)
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# NextAuth.js Secret (CRITICAL - generate a strong secret)
NEXTAUTH_SECRET=your-production-secret-here

# NextAuth.js URL (your Vercel deployment URL)
NEXTAUTH_URL=https://your-app.vercel.app
```

#### How to Get These Values:

**1. DATABASE_URL:**
- If using **Vercel Postgres**: Go to Storage → Postgres → Copy connection string
- If using **external database** (Supabase, Railway, etc.): Get connection string from your provider
- Format: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public`

**2. NEXTAUTH_SECRET:**
Generate a secure secret:
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use online generator:
# https://generate-secret.vercel.app/32
```

**3. NEXTAUTH_URL:**
- Use your Vercel deployment URL (e.g., `https://green-lines-cfo-platform-hq-console.vercel.app`)
- For production branch: Use your custom domain if configured

---

### Step 2: Configure Build Settings

In Vercel Project Settings → Build & Development Settings:

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Root Directory: apps/hq-console
```

---

### Step 3: Database Setup

#### Option A: Using Vercel Postgres (Recommended)
1. Go to your Vercel project
2. Click "Storage" tab
3. Create new Postgres database
4. Vercel automatically adds `DATABASE_URL` to your environment variables
5. Run migrations:
   ```bash
   # From your local machine
   cd apps/hq-console
   npx prisma migrate deploy
   ```

#### Option B: Using External Database
1. Set up PostgreSQL database (Supabase, Railway, Neon, etc.)
2. Add `DATABASE_URL` to Vercel environment variables
3. Run migrations from local machine or Vercel CLI

---

### Step 4: Redeploy

After setting environment variables:

**Method 1: Via Vercel Dashboard**
1. Go to Deployments tab
2. Click "..." on the latest failed deployment
3. Click "Redeploy"

**Method 2: Push to Git**
```bash
git add .
git commit -m "fix: Configure for Vercel deployment"
git push
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Prisma Client not found"
**Solution:** Environment variable `DATABASE_URL` is missing or incorrect.
- ✅ Verify `DATABASE_URL` is set in Vercel
- ✅ Check database connection string format
- ✅ Ensure database is accessible from Vercel

### Issue 2: "NextAuth configuration error"
**Solution:** `NEXTAUTH_SECRET` or `NEXTAUTH_URL` is missing.
- ✅ Add `NEXTAUTH_SECRET` (use generated secret)
- ✅ Add `NEXTAUTH_URL` (your Vercel deployment URL)

### Issue 3: Build timeout
**Solution:** Build is taking too long.
- ✅ Check if `--turbopack` flag is causing issues (we removed it from build script)
- ✅ Upgrade Vercel plan if needed

### Issue 4: Module not found errors
**Solution:** Dependencies not installed correctly.
- ✅ Clear Vercel cache: Deployments → Settings → Clear Cache
- ✅ Redeploy

### Issue 5: Database connection fails
**Solution:** Database not accessible from Vercel servers.
- ✅ Check database firewall rules (allow Vercel IPs)
- ✅ Use connection pooling (Prisma Data Proxy or PgBouncer)

---

## 📋 Verification Checklist

Before redeploying, verify:

- [ ] ✅ `package.json` updated (Prisma in dependencies)
- [ ] ✅ `next.config.js` updated (external packages)
- [ ] ✅ `DATABASE_URL` set in Vercel
- [ ] ✅ `NEXTAUTH_SECRET` set in Vercel
- [ ] ✅ `NEXTAUTH_URL` set in Vercel
- [ ] ✅ Database is accessible
- [ ] ✅ Migrations are run
- [ ] ✅ Build settings configured correctly

---

## 🎯 Testing After Deployment

1. **Check Build Logs:**
   - Go to Vercel → Deployments → Click on deployment
   - Verify "Prisma Client generated" appears in logs
   - Verify build completes successfully

2. **Test Authentication:**
   - Visit `/auth/signin`
   - Try logging in
   - Should not see authentication errors

3. **Test Database Connection:**
   - Visit dashboard
   - Check if data loads correctly
   - Create a test record

---

## 🔄 If Still Failing

If deployments still fail after following this guide:

1. **Get Detailed Logs:**
   - Go to Vercel → Deployments → Failed deployment
   - Click "View Function Logs"
   - Copy the exact error message

2. **Common Next Steps:**
   - Clear Vercel build cache
   - Check Prisma schema matches database
   - Verify all API routes are using correct imports
   - Check middleware.ts for errors

3. **Emergency Rollback:**
   - Go to previous successful deployment
   - Click "Promote to Production"

---

## 📝 Additional Notes

### Database Migrations on Vercel:
Vercel doesn't automatically run migrations. You have two options:

**Option 1: Manual (Recommended for production)**
```bash
# From local machine with production DATABASE_URL
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

**Option 2: Add to build script (Not recommended)**
```json
"build": "prisma generate && prisma migrate deploy && next build"
```
⚠️ Not recommended because migrations might fail mid-deployment.

### Prisma Data Proxy:
For serverless environments, consider using Prisma Data Proxy:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL") // For migrations
}
```

---

## 🆘 Need More Help?

If you're still experiencing issues:

1. Share the **exact error message** from Vercel build logs
2. Verify environment variables are set correctly
3. Check if database is accessible from external services
4. Consider using Vercel Postgres for easier setup

---

## ✨ Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ No "Prisma Client" errors in logs
- ✅ Authentication works
- ✅ Database queries return data
- ✅ All pages load correctly

---

**Last Updated:** October 22, 2025  
**Status:** Ready for deployment  
**Next Steps:** Configure environment variables in Vercel and redeploy

