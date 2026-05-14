#!/bin/bash
set -e

# Defaults
SERVICE_TAG=""
ENV_FILE=".env.production"
DOWN_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag|-t)
      SERVICE_TAG="$2"
      shift 2
      ;;
    --env-file|-e)
      ENV_FILE="$2"
      shift 2
      ;;
    --down|-d)
      DOWN_ONLY=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [--tag|-t TAG] [--env-file|-e FILE] [--down|-d]"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Load env file
load_env_file() {
  if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
  fi
}

# Down only
if [ "$DOWN_ONLY" = true ]; then
  echo "Stopping gcap-statement..."
  docker compose --env-file "$ENV_FILE" down
  exit 0
fi

# Load env
load_env_file

# Resolve tag
ACTUAL_TAG=${SERVICE_TAG:-${TAG:-latest}}

# Registry
REGISTRY="registry.gcap.co.th"
IMAGE_NAME="gcap-statement"
FULL_IMAGE="$REGISTRY/$IMAGE_NAME:$ACTUAL_TAG"

echo "Deploying gcap-statement"
echo "Image: $FULL_IMAGE"
echo "Env file: $ENV_FILE"

read -p "Deploy to PRODUCTION? (yes/no): " confirm
if [[ "$confirm" != "yes" && "$confirm" != "y" ]]; then
  echo "Cancelled."
  exit 0
fi

# Export for docker-compose
export REGISTRY
export TAG="$ACTUAL_TAG"

# Pull
echo ""
echo "=== Pulling image ==="
docker login $REGISTRY
docker pull "$FULL_IMAGE"

# Restart
echo ""
echo "=== Restarting container ==="
docker compose --env-file "$ENV_FILE" down
docker compose --env-file "$ENV_FILE" up -d --force-recreate

# Status
echo ""
echo "=== Status ==="
docker compose --env-file "$ENV_FILE" ps

echo ""
echo "Deployment completed!"
echo "Service Version: $ACTUAL_TAG"
echo "Logs: docker compose --env-file \"$ENV_FILE\" logs -f"
