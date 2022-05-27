#!/bin/bash

adminGroup="pi"
# adminGroup="adm"

# Checking if running as root
if [ $(whoami) != 'root' ]
then
    echo "Script must be run as root"
    echo "Use 'sudo ./install'"
    exit 1
fi

# TODO: Make sure all required packages are installed
dependencies=('hostapd' 'dnsmasq' 'cvlc' 'nodejs' 'npm')

# Get the default user (because pi is no longer default)
user=$(id -nu 1000)

# Make the directory structure
echo 'Making directories'
mkdir /var/auto-pa/
chown $user:$adminGroup /var/auto-pa/
mkdir /var/log/auto-pa/
chown $user:$adminGroup /var/log/auto-pa/
mkdir /usr/local/etc/auto-pa/
chown $user:$adminGroup /usr/local/etc/auto-pa/

# Copy "/etc"
echo 'Copying "/etc" folder'
rsync -rt src/etc/ /etc/

# Add sudoers file
echo 'Modifying sudoers, iptables, and the auto-pa service'
echo '$user ALL=(root) NOPASSWD: /usr/bin/timedatectl' > /etc/sudoers.d/auto-pa
chmod 440 /etc/sudoers.d/auto-pa

# Redirect port 80 to port 8080 so node can be run without root
iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables-save > /etc/iptables/rules.v4

# Edit the service to run as the user (not root)
sed -i "s/#USER/User=$user/" /etc/systemd/system/auto-pa.service

# Change the WiFi password
read -p "Enter a password for the new WiFi network (default: raspberry): " pass
if [ ! -z "$pass" ] # Only change if something was actually entered
then
    sed -i "s/wpa_passphrase=raspberry/wpa_passphrase=$pass/" /etc/hostapd/hostapd.conf
fi

# Switch to auto-pa for the last part
#su - $user

sudo -u $user bash << END

# Copy var
echo 'Copying "/var" and "/usr/local"'
cp -r src/var /

cp -r src/usr/local/etc/auto-pa/ /usr/local/etc/

# Copy submoules into html
cp -r submodules /usr/local/etc/auto-pa/html/

# Install node.js dependencies
echo 'Installing node.js dependencies'
cd /usr/local/etc/auto-pa/nodejs_app/
npm install
END

# Enable and start services
echo 'Starting daemons'
systemctl daemon-reload
systemctl unmask hostapd
systemctl enable hostapd dnsmasq auto-pa
systemctl start hostapd dnsmasq auto-pa
