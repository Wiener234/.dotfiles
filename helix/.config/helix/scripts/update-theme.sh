#!/usr/bin/env bash

# Fail early, fail often.
set -eu -o pipefail

if [[ "$2" == "prefer-light" ]]; then
  # Update Helix Editor config to use light theme.
  sed -i 's/theme = ".*"/theme = "catppuccin_latte"/' ${HOME}/.config/helix/config.toml
else
  # Update Helix Editor config to use dark theme.
  sed -i 's/theme = ".*"/theme = "catppuccin_frappe"/' ${HOME}/.config/helix/config.toml
fi

pkill -USR1 hx
