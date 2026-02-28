#!/bin/bash
set -e
set -o pipefail

# Configuration - set these environment variables or use defaults
SERVER_HOST="${DEPLOY_SERVER_HOST:?'DEPLOY_SERVER_HOST must be set'}"
SERVER_USER="${DEPLOY_SERVER_USER:-azureuser}"

echo "Connecting to Azure Server to update backend services..."
ssh "${SERVER_USER}@${SERVER_HOST}" "cd ~/shopease && \
  git pull origin main && \
  docker compose -f docker-compose.prod.yml pull config-server api-gateway user-service notification-service && \
  docker compose -f docker-compose.prod.yml up -d --force-recreate config-server api-gateway user-service notification-service"
echo "Update complete! Please wait 2-3 minutes for Spring Boot services to fully start."
