# Vercel Build Configuration Fix

## Issue
```
Error: JSON5: invalid character '�' at 1:1
```

This error typically occurs when:
1. Vercel is reading files from the wrong directory
2. There's an encoding issue in a JSON file
3. The build settings don't match the monorepo structure

## Solution: Configure Vercel Build Settings

### Step 1: Update Vercel Project Settings

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **General**

#### Configure Root Directory:
```
Root Directory: apps/hq-console
```
**Important:** Click "Edit" next to "Root Directory" and set it to `apps/hq-console`

#### Configure Build & Development Settings:
Go to: **Settings** → **Build & Development Settings**

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next (leave default)
Install Command: npm install
Root Directory: apps/hq-console (should already be set from above)
```

### Step 2: Environment Variables (if not already set)

Make sure these are configured:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### Step 3: Redeploy

After updating settings:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

## Alternative: Create vercel.json (if settings don't work)

If the Vercel dashboard settings don't resolve the issue, you can try adding a `vercel.json` at the **root** of your repository:

```json
{
  "buildCommand": "cd apps/hq-console && npm run build",
  "devCommand": "cd apps/hq-console && npm run dev",
  "installCommand": "cd apps/hq-console && npm install",
  "outputDirectory": "apps/hq-console/.next"
}
```

But **first try the dashboard settings approach** as it's cleaner for monorepos.

## Why This Error Occurs

Vercel is trying to parse a JSON file from the wrong location. By setting the Root Directory to `apps/hq-console`, Vercel will:
- Run `npm install` inside `apps/hq-console`
- Read `package.json` from `apps/hq-console`
- Build from the correct directory

The `�` character typically indicates Vercel is reading a binary file or a file with wrong encoding when it expects JSON.

## Verification

After redeploying, you should see in the build logs:
```
Running build in apps/hq-console
✓ Generated Prisma Client (v6.17.1)
▲ Next.js 15.5.5
✓ Compiled successfully
```

No more JSON5 parsing errors!

