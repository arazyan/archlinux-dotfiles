#!/usr/bin/env bash
filename="/home/sad/Pictures/Screenshots/$(date +'%Y.%m.%d-%H:%m:%S').png"
touch $filename
grim $filename
