#!/bin/bash

# This script is used to launch the bot via systemd
# Regsiter the service
echo "Registering service..."
sudo cp faculty-manager.service /etc/systemd/system/faculty-manager.service

# Start the service
echo "Starting service..."
sudo systemctl enable --now faculty-manager
