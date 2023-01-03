#!/bin/bash

# This script is used to launch the bot
function launch_docker() {
    # remove old container
    echo "Removing old container..."
    docker rm -f faculty_manager

    echo "Pulling docker image..."
    docker pull ghcr.io/rndrmu/facultymanager:latest

    echo "Launching Database..."
    #docker compose -f docker_db.yml up -d
    docker run -d --name="faculty_manager_db" --net host -v $PWD/db:/var/lib/postgresql/data -e POSTGRES_PASSWORD=postgres -e POSTGRES

    echo "Launching Bot..."
    docker run -d --name="faculty_manager" --net host -v $PWD/config.json:/config.json -v $PWD/images:/images --env-file .env faculty_manager:latest
}

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
        launch_docker
        ;;
    *)
        echo "Invalid launch mode!"
        echo "Usage: launch_bot.sh [openrc|systemd|docker]"
        exit 1
        ;;
esac


