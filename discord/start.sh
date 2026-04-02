#!/bin/bash

set -e

# echo "Building Discord bot Docker image..."
# docker build -t twentybots:latest .

echo "Starting Discord bot with docker-compose..."
docker-compose up -d --remove-orphans

echo "✓ Discord bot is running!"
echo "View logs with: docker-compose logs -f"
