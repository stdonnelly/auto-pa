#!/bin/bash

# Checking if running as root
if [ $(whoami) != 'root' ]
then
    echo "Script must be run as root"
    echo "Use 'sudo ./install'"
    exit 1
else
    echo "Running as root"
    exit 0
fi

# Make sure all required packages are installed
# List of required packages
packages=("vlc" "hostapd" "dnsmasq" "nodejs" "npm")