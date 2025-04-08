#!/usr/bin/env bash

gsettings monitor org.gnome.desktop.interface color-scheme \
  | xargs -L1 ${HOME}/.config/helix/scripts/update-theme.sh
