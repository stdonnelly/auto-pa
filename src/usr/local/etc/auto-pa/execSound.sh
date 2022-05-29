#!/bin/bash
export XDG_RUNTIME_DIR=/run/user/1000

# For logging
date

cvlc $1 --play-and-exit