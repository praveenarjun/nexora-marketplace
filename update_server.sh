#!/bin/bash
set -e
set -o pipefail

# Configuration - DEPLOY_SERVER_HOST is required; others have defaults
SERVER_HOST="${DEPLOY_SERVER_HOST:?Error: DEPLOY_SERVER_HOST environment variable must be set}"
SERVER_USER="${DEPLOY_SERVER_USER:-azureuser}"
SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/shopease-key.pem}"

echo "Connecting to Azure Server to update backend services..."
ssh -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" "${SERVER_USER}@${SERVER_HOST}" "cd ~/shopease && \
  docker compose -f docker-compose.prod.yml pull discovery-server config-server api-gateway product-service user-service inventory-service order-service notification-service && \
  docker compose -f docker-compose.prod.yml up -d --force-recreate discovery-server config-server api-gateway product-service user-service inventory-service order-service notification-service"
echo "Update complete! Please wait 2-3 minutes for Spring Boot services to fully start."
