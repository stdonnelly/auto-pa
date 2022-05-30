#!/bin/bash
export XDG_RUNTIME_DIR=/run/user/1000

# For logging
echo "[$(date)]: Playing $1"

cvlc $1 --play-and-exit