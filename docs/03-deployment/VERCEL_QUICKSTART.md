# 🚀 Quick Start: Deploy to Vercel

## Step 1: Push Changes to Git
```bash
git add .
git commit -m "fix: Configure for Vercel deployment with Prisma support"
git push
```

## Step 2: Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables

Add these **3 REQUIRED** variables:

### 1. DATABASE_URL
```
postgresql://username:password@host:5432/database?schema=public
```
**Where to get:**
- **Vercel Postgres**: Storage tab → Create Postgres → Auto-added
- **Supabase**: Project Settings → Database → Connection String
- **Railway**: Database → Connection → Postgres Connection URL
- **Neon**: Dashboard → Connection String

### 2. NEXTAUTH_SECRET
```bash
# Generate with:
openssl rand -base64 32
```
**Result example:** `gQwX5rZ8tK2mN4pL6vH9sC1dF3gJ7hK0mN4pQ2rS5tV8wX1z`

### 3. NEXTAUTH_URL
```
https://your-project-name.vercel.app
```
**Replace with your actual Vercel URL**

## Step 3: Configure Build Settings

Vercel → Settings → Build & Development Settings:
- **Root Directory**: `apps/hq-console`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

## Step 4: Deploy

### Option A: Automatic (Recommended)
- Push to Git → Vercel auto-deploys

### Option B: Manual Redeploy
1. Vercel → Deployments tab
2. Find failed deployment
3. Click "..." → Redeploy

## Step 5: Run Database Migrations

**⚠️ Important:** Vercel doesn't run migrations automatically.

```bash
# From your local machine:
DATABASE_URL="your-production-database-url" npx prisma migrate deploy
```

Or using Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## ✅ Success Checklist

- [ ] All 3 environment variables set in Vercel
- [ ] Changes pushed to Git
- [ ] Deployment succeeded (check build logs)
- [ ] Database migrations run successfully
- [ ] Can access `/auth/signin` page
- [ ] Can log in successfully
- [ ] Dashboard loads without errors

## 🆘 If Deployment Fails

1. **Check Build Logs:**
   - Vercel → Deployments → Click failed deployment
   - Look for error messages

2. **Common Issues:**
   - ❌ "Prisma Client not found" → Check `DATABASE_URL` is set
   - ❌ "NextAuth configuration error" → Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
   - ❌ "Module not found" → Clear build cache and redeploy

3. **Clear Cache:**
   - Vercel → Settings → Clear Cache → Redeploy

4. **Check Full Guide:**
   - See `docs/Vercel_Deployment_Fix.md` for detailed troubleshooting

## 📱 Quick Commands

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Test build locally
npm run build

# Run migrations
npx prisma migrate deploy

# View Vercel logs
vercel logs

# Pull environment variables
vercel env pull
```

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Prisma on Vercel**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **NextAuth Deployment**: https://next-auth.js.org/deployment

---

**Estimated Time:** 5-10 minutes  
**Last Updated:** October 22, 2025

