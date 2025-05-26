#!/bin/bash

# === CONFIGURATION ===
LATITUDE=52.52437N       # Replace with your latitude
LONGITUDE=13.41053E     # Replace with your longitude
light="echo false > $HOME/.config/cosmic/com.system76.CosmicTheme.Mode/v1/is_dark"  # Replace with your desired command
dark="echo true > $HOME/.config/cosmic/com.system76.CosmicTheme.Mode/v1/is_dark"

while true; do
    # Wait until next sunrise
    echo "Waiting for sunrise..."
    sunwait wait rise $LATITUDE $LONGITUDE
    echo "Running command at sunrise"
    eval "$light"

    # Wait until next sunset
    echo "Waiting for sunset..."
    sunwait wait set $LATITUDE $LONGITUDE
    echo "Running command at sunset"
    eval "$dark"
done

