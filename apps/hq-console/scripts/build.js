#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting custom build process...');

try {
  // Check if we're in a Vercel environment
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    console.log('📦 Vercel environment detected');
    
    // Generate Prisma client using Node.js directly
    console.log('🔧 Generating Prisma client...');
    const prismaPath = path.join(__dirname, '../node_modules/prisma/build/index.js');
    
    if (fs.existsSync(prismaPath)) {
      execSync(`node ${prismaPath} generate`, { stdio: 'inherit' });
      console.log('✅ Prisma client generated successfully');
    } else {
      console.log('⚠️ Prisma binary not found, skipping client generation');
    }
  } else {
    console.log('💻 Local environment detected');
    // Use regular prisma command for local development
    execSync('npx prisma generate', { stdio: 'inherit' });
  }
  
  // Run Next.js build
  console.log('🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
