#!/bin/bash
# OSINT Recon — one-shot local setup script
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "\n${GREEN}🔍 OSINT Recon — Setup${NC}\n"

# Node version check
NODE_VER=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}❌  Node.js 18+ required. Download from https://nodejs.org${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC}  Node.js $(node -v)"

# Install deps
echo -e "\n📦  Installing dependencies..."
npm install
npm run install:all
echo -e "${GREEN}✓${NC}  Dependencies installed"

# .env setup
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo -e "\n${YELLOW}⚠  backend/.env created from template.${NC}"
  echo -e "${YELLOW}   Open it and paste your ANTHROPIC_API_KEY, then re-run: npm run dev${NC}"
  echo -e "\n   Get a free key at: ${GREEN}https://console.anthropic.com${NC}\n"
  exit 0
fi

# Check key is set
if grep -q "your_anthropic_api_key_here" backend/.env; then
  echo -e "\n${YELLOW}⚠  ANTHROPIC_API_KEY not set yet in backend/.env${NC}"
  echo -e "   Replace 'your_anthropic_api_key_here' with your real key.\n"
  exit 0
fi

echo -e "\n${GREEN}✅  Everything looks good!${NC}"
echo -e "   Run: ${GREEN}npm run dev${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:3001${NC}\n"
