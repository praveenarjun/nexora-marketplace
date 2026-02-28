#!/bin/bash
set -e
set -o pipefail

# Configuration - set these environment variables or use defaults
SERVER_HOST="${DEPLOY_SERVER_HOST:?'DEPLOY_SERVER_HOST must be set'}"
SERVER_USER="${DEPLOY_SERVER_USER:-azureuser}"
SSH_KEY="${DEPLOY_SSH_KEY:-~/.ssh/shopease-key.pem}"

echo "Connecting to Azure Server to update backend services..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "${SERVER_USER}@${SERVER_HOST}" "cd ~/shopease && \
  docker compose -f docker-compose.prod.yml pull config-server api-gateway user-service notification-service && \
  docker compose -f docker-compose.prod.yml up -d --force-recreate config-server api-gateway user-service notification-service"
echo "Update complete! Please wait 2-3 minutes for Spring Boot services to fully start."
