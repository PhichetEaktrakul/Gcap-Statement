#!/bin/bash
# This script builds and/or pushes Docker images to a private registry.
# It supports:
#   - Custom image tag
#   - Build only (no push)
#   - Push only (no build)

# =========================
# Default configuration
# =========================

TAG="latest"            # Default Docker tag
BUILD_ONLY=false        # If true: only build images
PUSH_ONLY=false         # If true: only push images
UPDATE_PROD_ENV=false   # (Currently unused / commented)

# =========================
# Parse command-line arguments
# =========================
# Supported flags:
#   --tag, -t           Set custom image tag
#   --build-only, -b    Only build images, do not push
#   --push-only, -p     Only push existing images

while [[ $# -gt 0 ]]; do
    case $1 in
        --tag|-t)
            TAG="$2"     # Assign tag value
            shift 2      # Move past flag and value
            ;;
        --build-only|-b)
            BUILD_ONLY=true
            shift
            ;;
        --push-only|-p)
            PUSH_ONLY=true
            shift
            ;;
        # --update-prod-env|-u)
        #     UPDATE_PROD_ENV=true
        #     shift
        #     ;;
        *)
            # Unknown flag handler
            echo "Unknown option: $1"
            echo "Usage: $0 [--tag|-t TAG] [--build-only|-b] [--push-only|-p]"
            exit 1
            ;;
    esac
done

# =========================
# Image configuration
# =========================

REGISTRY="registry.gcap.co.th"               # Docker registry URL
GCAP_STATEMENT_IMAGE="$REGISTRY/gcap-statement"  # Full image name

# =========================
# Display current config
# =========================

echo "Building and pushing GCAP Statement images..."
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo "Build Only: $BUILD_ONLY"
echo "Push Only: $PUSH_ONLY"

# =========================
# Build phase
# =========================
# Skip build if --push-only is set

if [ "$PUSH_ONLY" = false ]; then
    echo ""
    echo "=== Building GCAP Statement ==="

    # Build Docker image with no cache
    docker build --no-cache \
        -t "${GCAP_STATEMENT_IMAGE}:${TAG}" \
        -f Dockerfile.prod .
    

    # Exit if build fails
    if [ $? -ne 0 ]; then
        echo "Failed to build GCAP Statement image"
        exit 1
    fi
    echo ""
fi

# =========================
# Stop if build-only
# =========================

if [ "$BUILD_ONLY" = true ]; then
    echo ""
    echo "All images built successfully (Local Only)!"
    echo "Backend: ${GCAP_STATEMENT_IMAGE}:${TAG}"
    echo ""
    echo "Note: Images are built locally and NOT pushed to registry."
    echo "To push these images, use:"
    echo "  ./build-and-push.sh --push-only --tag $TAG"
    exit 0
fi

# =========================
# Push phase
# =========================

echo ""
echo "=== Pushing to Registry ==="
echo "Pushing ${GCAP_STATEMENT_IMAGE}:${TAG}..."

docker push "${GCAP_STATEMENT_IMAGE}:${TAG}"

# Exit if push fails
if [ $? -ne 0 ]; then
    echo "Failed to push GCAP Statement image"
    exit 1
fi

echo ""
echo "All images built and pushed successfully!"
echo "App: ${GCAP_STATEMENT_IMAGE}:${TAG}"

# =========================
# (Optional) Update production env
# =========================
# This section is currently disabled.
# It would update .env.production with new image tags.

# if [ "$UPDATE_PROD_ENV" = true ] && [ "$TAG" != "latest" ]; then
#     echo ""
#     echo "=== Updating Production Environment ==="
#     ./update-version.sh --both-tags "$TAG" --env-file .env.production
#     if [ $? -ne 0 ]; then
#         echo "Failed to update production environment file"
#         exit 1
#     fi
#     echo "Production environment updated with new tags."
# fi
