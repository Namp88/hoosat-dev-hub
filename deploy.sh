#!/bin/bash
set -e

echo "🚀 Starting deployment of Hoosat Developer Hub..."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    echo -e "${YELLOW}📝 Loading environment variables...${NC}"
    set -a
    source .env
    set +a
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
fi

DOCKER_IMAGE=${DOCKER_IMAGE:-ghcr.io/namp88/hoosat-dev-hub:latest}
CONTAINER_NAME="hoosat-dev-hub-prod"

# docker-compose v1 (1.29) crashes with KeyError: 'ContainerConfig' when it recreates a container
# on current Docker Engine, so prefer the Compose v2 plugin.
if docker compose version > /dev/null 2>&1; then
    compose() { docker compose -f docker-compose.prod.yml "$@"; }
else
    echo -e "${YELLOW}Compose v2 plugin not found, falling back to docker-compose v1${NC}"
    compose() { docker-compose -f docker-compose.prod.yml "$@"; }
fi

# Pull latest image
echo -e "${YELLOW}📦 Pulling latest image: ${DOCKER_IMAGE}${NC}"
docker pull "${DOCKER_IMAGE}"

# Stop old containers
echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
compose down || true

# Remove old containers
echo -e "${YELLOW}🗑️  Removing old containers...${NC}"
docker rm -f ${CONTAINER_NAME} 2>/dev/null || true

# Start new containers
echo -e "${YELLOW}🔄 Starting new containers...${NC}"
compose up -d

# Wait for container to start
echo -e "${YELLOW}⏳ Waiting for container to start...${NC}"
sleep 10

# Check if container is running
if docker ps | grep -q ${CONTAINER_NAME}; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    compose ps
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📋 Recent logs:${NC}"
    compose logs --tail=20
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🌐 Site available at: https://hub.hoosat.net${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${RED}Container is not running. Showing logs:${NC}"
    compose logs
    exit 1
fi

echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
