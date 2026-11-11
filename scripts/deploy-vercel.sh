#!/bin/bash
# Vercel Deployment Script for Voltess
# Usage: ./scripts/deploy-vercel.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
PROJECT_NAME="voltess"

if [ "$ENVIRONMENT" = "production" ]; then
  PROJECT_NAME="voltess"
  echo "🚀 Deploying to PRODUCTION..."
else
  PROJECT_NAME="voltess-staging"
  echo "🚀 Deploying to STAGING..."
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "📦 Installing Vercel CLI..."
  npm install -g vercel@latest
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "🔐 Please log in to Vercel..."
  vercel login
fi

# Build the project first
echo "🔨 Building project..."
pnpm build

# Deploy to Vercel
echo "📤 Deploying to Vercel ($PROJECT_NAME)..."
if [ "$ENVIRONMENT" = "production" ]; then
  vercel --prod --name=$PROJECT_NAME
else
  vercel --name=$PROJECT_NAME
fi

echo "✅ Deployment complete!"
echo "📝 Don't forget to configure environment variables in Vercel Dashboard:"
echo "   - NEXT_PUBLIC_API_URL"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   And backend API variables if deploying API separately"