#!/bin/bash

# === CONFIGURATION ===
LATITUDE=40.7128       # Replace with your latitude
LONGITUDE=-74.0060     # Replace with your longitude
COMMAND="echo 'Event triggered'"  # Replace with your desired command

while true; do
    # Wait until next sunrise
    echo "Waiting for sunrise..."
    sunwait sun rise angle 0 $LATITUDE $LONGITUDE
    echo "Running command at sunrise"
    eval "$COMMAND"

    # Wait until next sunset
    echo "Waiting for sunset..."
    sunwait sun set angle 0 $LATITUDE $LONGITUDE
    echo "Running command at sunset"
    eval "$COMMAND"
done

