#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Running API endpoint tests..."

# Run tests for each endpoint
echo -e "\n${GREEN}Testing Image Generation API...${NC}"
npm test __tests__/api/generate-image.test.ts

echo -e "\n${GREEN}Testing Video Generation API...${NC}"
npm test __tests__/api/generate-video.test.ts

echo -e "\n${GREEN}Testing Model Training API...${NC}"
npm test __tests__/api/train-model.test.ts

echo -e "\n✅ All API endpoint tests completed!" 