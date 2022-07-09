#!/bin/bash
export XDG_RUNTIME_DIR=/run/user/1000

# For logging
echo "[$(date)]: Playing $1"

# Check if the file is assembly (contains the word "assembly")
if [[ ${1^^} == *"ASSEMBLY"* ]]
then
    # Play twice if assembly
    echo "Playing twice"
    set "$1 $1"
fi

cvlc --play-and-exit $1
