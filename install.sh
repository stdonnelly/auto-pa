#!/bin/bash

adminGroup="wheel"
# adminGroup="adm"

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

# Make the directory structure
mkdir /var/auto-pa/
chown $user:$adminGroup /var/auto-pa/
mkdir /var/log/auto-pa/
chown $user:$adminGroup /var/log/auto-pa/
mkdir /usr/local/etc/auto-pa/
chown $user:$adminGroup /usr/local/etc/auto-pa/

# Add sudoers file
echo $user ALL=(root) = NOPASSWD: /usr/bin/timedatectl > /etc/sudoers.d/auto-pa
chmod 440 /etc/sudoers.d/auto-pa

# Redirect port 80 to port 8080 so node can be run without root
iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables-save > /etc/iptables/rules.v4

# Edit the service to run as the user (not root)
sed -i "s/#USER/User=$user/" /etc/systemd/system/auto-pa.service

# Switch to auto-pa for the last part
su $user
mkdir /var/auto-pa/html/
