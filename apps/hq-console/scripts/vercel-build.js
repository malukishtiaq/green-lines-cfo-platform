#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting Vercel build process...');

try {
  // Just run Next.js build without trying to generate Prisma client
  console.log('🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
