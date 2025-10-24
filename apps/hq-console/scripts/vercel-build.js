#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Try to generate Prisma client first
  console.log('🔧 Generating Prisma client...');
  
  try {
    // Try using the Prisma binary directly
    const prismaPath = path.join(__dirname, '../node_modules/prisma/build/index.js');
    if (fs.existsSync(prismaPath)) {
      execSync(`node ${prismaPath} generate`, { stdio: 'inherit' });
      console.log('✅ Prisma client generated successfully');
    } else {
      console.log('⚠️ Prisma binary not found, trying alternative approach...');
      // Try using npx prisma generate
      try {
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✅ Prisma client generated successfully with npx');
      } catch (npxError) {
        console.log('⚠️ npx prisma generate failed, trying direct prisma command...');
        try {
          execSync('prisma generate', { stdio: 'inherit' });
          console.log('✅ Prisma client generated successfully with direct command');
        } catch (directError) {
          console.log('⚠️ All Prisma generation methods failed, but continuing build...');
          console.log('Error:', directError.message);
        }
      }
    }
  } catch (prismaError) {
    console.log('⚠️ Prisma client generation failed, but continuing build...');
    console.log('Error:', prismaError.message);
  }
  
  // Run Next.js build
  console.log('🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
