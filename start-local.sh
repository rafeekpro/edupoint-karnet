#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== VouchersKit Local Development Setup ===${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Stop and remove existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker compose -f docker-compose.local.yml down

# Remove old volumes to ensure fresh database
echo -e "${YELLOW}Removing old volumes...${NC}"
docker compose -f docker-compose.local.yml down -v

# Build and start services
echo -e "${GREEN}Building and starting services...${NC}"
docker compose -f docker-compose.local.yml up --build -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check if services are running
echo -e "${GREEN}Checking services status...${NC}"
docker compose -f docker-compose.local.yml ps

echo ""
echo -e "${GREEN}=== Services are ready! ===${NC}"
echo ""
echo -e "${GREEN}Access points:${NC}"
echo -e "  Frontend (NextUI):    ${YELLOW}http://localhost:3000${NC}"
echo -e "  Backend API:          ${YELLOW}http://localhost:8000${NC}"
echo -e "  API Documentation:    ${YELLOW}http://localhost:8000/docs${NC}"
echo -e "  Adminer (Database):   ${YELLOW}http://localhost:8081${NC}"
echo ""
echo -e "${GREEN}Test accounts (password: admin123):${NC}"
echo -e "  Admin:      admin@voucherskit.com"
echo -e "  Therapist:  therapist1@voucherskit.com"
echo -e "  Client:     client1@example.com"
echo ""
echo -e "${GREEN}Database credentials:${NC}"
echo -e "  Server:     postgres"
echo -e "  Username:   therapy_user"
echo -e "  Password:   therapy_password"
echo -e "  Database:   therapy_system"
echo ""
echo -e "${YELLOW}To view logs:${NC} docker compose -f docker-compose.local.yml logs -f"
echo -e "${YELLOW}To stop:${NC} docker compose -f docker-compose.local.yml down"
echo ""