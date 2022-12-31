#!/bin/bash

# This script is used to launch the bot via docker

# Build the docker image
echo "Building docker image..."
docker build -t faculty-manager . > /dev/null

echo "Launching Database..."
docker compose -f docker_db.yml up -d

echo "Launching Bot..."
docker run -d --name="faculty_manager" --net host --env-file .env faculty_manager:latest

