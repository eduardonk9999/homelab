#!/usr/bin/env bash
# Regras do ufw do r2d2. Idempotente: pode rodar de novo.
# Rodar no servidor com: sudo bash ufw.sh
set -euo pipefail

LAN=192.168.15.0/24

ufw default deny incoming
ufw default allow outgoing
ufw allow from "$LAN" to any port 22 proto tcp comment 'ssh LAN (IPv4)'
ufw allow in on tailscale0 comment 'tailnet'
ufw --force enable
ufw status verbose
