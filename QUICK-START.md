# Green Lines CFO Platform - Quick Start Guide

## 🚀 How to Start the Application (ALWAYS USE THIS)

### Option 1: Double-click Startup Script (EASIEST)
1. Double-click `START-APP.bat` in the project root
2. Wait 10 seconds
3. Open browser:
   - Main App: http://localhost:3000
   - Database: http://localhost:5555

### Option 2: Manual Start (if script doesn't work)
Open terminal in project root and run:
```bash
cd apps/hq-console
npm run dev
```
In ANOTHER terminal:
```bash
cd apps/hq-console
npm run db:studio
```

## 🛑 How to Stop the Application
- Double-click `STOP-APP.bat`
- OR close the terminal windows

## ❌ Common Issues & Solutions

### Issue: "This site can't be reached"
**Solution**: Wait 10-15 seconds after starting. The server needs time to compile.

### Issue: "Port already in use"
**Solution**: Run `STOP-APP.bat` first, then `START-APP.bat`

### Issue: "Prisma Client error"
**Solution**: 
```bash
cd apps/hq-console
npx prisma generate
npm run dev
```

### Issue: Commands not working from root
**Solution**: ALWAYS cd into `apps/hq-console` first!

## 📍 Important Directories
- **Project Root**: `C:\Users\maluk\Documents\cfo_docs`
- **HQ Console**: `C:\Users\maluk\Documents\cfo_docs\apps\hq-console`
- **Always run commands from HQ Console directory!**

## 🔑 Demo Credentials
- Email: `admin@greenlines.com`
- Password: `admin123`

## 📦 Useful Commands (run from apps/hq-console)
```bash
npm run dev          # Start development server
npm run db:studio    # Start Prisma Studio
npm run db:seed      # Seed database with demo data
npx prisma generate  # Generate Prisma Client
```

## 🎯 The Golden Rule
**ALWAYS start from the startup script (`START-APP.bat`) or cd into `apps/hq-console` first!**

