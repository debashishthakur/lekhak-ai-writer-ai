#!/bin/bash

echo "🚀 Deploying Lekhak AI PhonePe Integration to Vercel via GitHub"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: backend directory not found${NC}"
    exit 1
fi

# Remove sensitive files before committing
echo -e "${YELLOW}🧹 Cleaning up sensitive files...${NC}"
rm -f backend/.env
rm -f backend/test_*.json
rm -f backend/debug_*.py
rm -f backend/test_*.html

# Check git status
echo -e "${YELLOW}📋 Checking what will be committed...${NC}"
git status

echo ""
echo -e "${YELLOW}📝 Files to be added/modified:${NC}"
git diff --name-only
git diff --cached --name-only
git ls-files --others --exclude-standard

echo ""
read -p "Do you want to commit these changes? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️ Deployment cancelled${NC}"
    exit 1
fi

# Stage all changes
echo -e "${YELLOW}📦 Staging changes...${NC}"
git add .

# Create commit
echo -e "${YELLOW}💾 Creating commit...${NC}"
git commit -m "feat: Complete PhonePe payment integration

- FastAPI backend with PhonePe OAuth and payment APIs
- React frontend components for checkout flow  
- Supabase database schema and REST API integration
- Webhook handling for all 16 PhonePe events
- Production deployment configuration for Vercel
- Complete payment lifecycle: creation → verification → subscription activation

Ready for production deployment.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎯 Next Steps:${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'New Project' and import your GitHub repository"
echo "3. Set root directory to 'backend'"
echo "4. Add environment variables (see DEPLOY_GITHUB_VERCEL.md)"
echo "5. Deploy and get your backend URL"
echo "6. Update webhook URL with PhonePe support"
echo "7. Test ₹5 payment"
echo ""
echo -e "${GREEN}📖 Full guide: DEPLOY_GITHUB_VERCEL.md${NC}"
echo ""
echo -e "${GREEN}🚀 Ready for Vercel deployment!${NC}"