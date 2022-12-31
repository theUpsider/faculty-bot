#!/bin/bash

# This script is used to launch the bot

# Check launch mode (openrc, systemd or docker)
case $1 in
    openrc)
        echo "Launching bot via openrc..."
        sudo cp faculty-manager.service /etc/init.d/faculty-manager
        sudo rc-update add faculty-manager
        sudo rc-service faculty-manager start
        ;;
    systemd)
        echo "Launching bot via systemd..."
        sudo cp faculty-manager.service /etc/systemd/system/faculty-manager.service
        sudo systemctl enable --now faculty-manager
        ;;
    docker)
        echo "Launching bot via docker..."
        launch_docker.sh
        ;;
    *)
        echo "Invalid launch mode!"
        echo "Usage: launch_bot.sh [openrc|systemd|docker]"
        exit 1
        ;;
esac

# Build the docker image

function launch_docker() {
    echo "Building docker image..."
    docker build -t faculty-manager . > /dev/null

    echo "Launching Bot..."
    docker run -d --name="faculty_manager" --net host --env-file .env faculty_manager:latest
}
echo "Building docker image..."
docker build -t faculty-manager . > /dev/null

echo "Launching Database..."
docker compose -f docker_db.yml up -d

echo "Launching Bot..."
docker run -d --name="faculty_manager" --net host --env-file .env faculty_manager:latest

