#!/usr/bin/env bash
# requires wl-clipboard
grim -g "$(slurp)" - | wl-copy
