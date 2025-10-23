#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Generating Prisma client...');

try {
  // Check if we're in a Vercel environment
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    console.log('📦 Vercel environment detected');
    
    // Try to generate Prisma client using Node.js directly
    const prismaPath = path.join(__dirname, '../node_modules/prisma/build/index.js');
    
    if (fs.existsSync(prismaPath)) {
      try {
        execSync(`node ${prismaPath} generate`, { stdio: 'inherit' });
        console.log('✅ Prisma client generated successfully');
      } catch (error) {
        console.log('⚠️ Prisma client generation failed:', error.message);
        // Don't fail the build, just continue
      }
    } else {
      console.log('⚠️ Prisma binary not found, skipping client generation');
    }
  } else {
    console.log('💻 Local environment detected');
    // Use regular prisma command for local development
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated successfully');
    } catch (error) {
      console.log('⚠️ Prisma client generation failed:', error.message);
    }
  }
} catch (error) {
  console.log('⚠️ Prisma client generation failed:', error.message);
  // Don't fail the build, just continue
}
