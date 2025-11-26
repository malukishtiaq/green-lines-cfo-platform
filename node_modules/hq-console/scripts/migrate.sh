#!/bin/bash

# Database migration script for Vercel deployment
echo "Starting database migration..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

echo "Database migration completed successfully!"
