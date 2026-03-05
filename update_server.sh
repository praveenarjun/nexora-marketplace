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
  echo 'Starting Core Services...' && \
  docker compose -f docker-compose.prod.yml up -d --force-recreate discovery-server && sleep 120 && \
  docker compose -f docker-compose.prod.yml up -d --force-recreate config-server && sleep 120 && \
  echo 'Starting API Gateway...' && \
  docker compose -f docker-compose.prod.yml up -d --force-recreate api-gateway && sleep 30 && \
  echo 'Starting Data & Feature Services...' && \
  docker compose -f docker-compose.prod.yml up -d --force-recreate product-service user-service inventory-service && sleep 40 && \
  echo 'Starting Operational Services...' && \
  docker compose -f docker-compose.prod.yml up -d --force-recreate order-service notification-service && \
  echo 'Cleaning up old images...' && \
  docker image prune -f"
echo "Update complete! Services are coming online sequentially. Please wait 3-5 minutes for full stability."
echo "You can check status with: ssh -i $SSH_KEY ${SERVER_USER}@${SERVER_HOST} 'cd ~/shopease && docker compose -f docker-compose.prod.yml ps'"
