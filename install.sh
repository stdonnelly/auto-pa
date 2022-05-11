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

# Get the default user (because pi is no longer default)
user=$(id -nu 1000)

# Add sudoers file
echo $user ALL=(root) = NOPASSWD: /usr/bin/timedatectl > /etc/sudoers.d/auto-pa
chmod 440 /etc/sudoers.d/auto-pa

# Make the directory structure
mkdir /var/auto-pa/
chown $user:$adminGroup /var/auto-pa/
mkdir /var/log/auto-pa/
chown $user:$adminGroup /var/log/auto-pa/
mkdir /usr/local/etc/auto-pa/
chown $user:$adminGroup /usr/local/etc/auto-pa/

# Edit the service to run as the user (not root)


# Switch to auto-pa for the last part
su $user
mkdir /var/auto-pa/html/
