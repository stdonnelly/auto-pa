#!/bin/bash
export XDG_RUNTIME_DIR=/run/user/1000

cvlc $1 --play-and-exit >> /var/log/auto-pa/vlc_auto.log 2>&1