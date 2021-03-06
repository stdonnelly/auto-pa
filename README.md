# auto-pa

## Overview
This is a set of scripts and configuration files designed to use a Raspberry Pi in an automated sound system.
Sounds are scheduled to play at different times during the day.
For example, a wake-up call and a lights-out call for a summer camp.
This project was used for BSA Camp Bud Schiele, the summer camp for the [Piedmont Council](https://www.piedmontcouncilbsa.org/).
There is also a configuration interface accessable by a captive portal on the WiFi network hosted by the Pi.

## Installation
Clone this repository. Open the terminal in the root folder of this repository.
Run `sudo ./install.sh`

This will also install the required packages using apt if they are not already installed.

## Requirements
- Raspberry Pi OS
    - Lite probably works
    - Tested on Raspberry Pi OS with desktop (32-bit) from January 28th 2022
- hostapd
- dnsmasq
- VLC media player (cvlc is used to play sounds)
- Node.js
- npm

## Citation
This section will be for guides used to create this project