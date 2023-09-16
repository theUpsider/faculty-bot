#!/bin/bash

# This script is used to launch the bot via openrc
# Regsiter the service
echo "Registering service..."
sudo cp faculty-manager.service /etc/init.d/faculty-manager

# Start the service
echo "Starting service..."
sudo rc-update add faculty-manager
sudo rc-service faculty-manager start