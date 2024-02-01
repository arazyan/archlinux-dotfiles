#!/usr/bin/env bash
echo "$(cat /sys/devices/platform/thinkpad_hwmon/hwmon/hwmon[[:print:]]*/fan1_input) RPM  "
