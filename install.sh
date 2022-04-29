#!/bin/bash

# adminGroup="wheel"
adminGroup="adm"

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
#packages=("vlc" "hostapd" "dnsmasq" "nodejs" "npm")

# Make the auto-pa account
useradd -Nr auto-pa

# Make the directory structure
mkdir /var/auto-pa/
chown auto-pa:$adminGroup /var/auto-pa/
mkdir /var/log/auto-pa/
chown auto-pa:$adminGroup /var/log/auto-pa/
mkdir /usr/local/etc/auto-pa/
chown auto-pa:$adminGroup /usr/local/etc/auto-pa/

# Switch to auto-pa for the last part
su auto-pa
mkdir /var/auto-pa/html/
