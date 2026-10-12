#!/usr/bin/env bash
# Retrato de recursos do r2d2. Rode no Mac:
#   ssh r2d2 'bash -s' < host/scripts/baseline.sh > docs/evidencias/baseline-$(date +%F).txt
set -euo pipefail

echo "# baseline $(hostname) — $(date -Is)"
echo "## sistema";  lsb_release -ds; uname -r; uptime
echo "## cpu";      nproc; grep -m1 'model name' /proc/cpuinfo
echo "## memória";  free -m
echo "## swap";     swapon --show || true
echo "## disco";    df -h -x tmpfs -x devtmpfs -x squashfs -x overlay
echo "## lvm";      sudo -n vgs 2>/dev/null || echo "(vgs precisa de sudo)"
echo "## top 10 por memória (RSS MB)"
ps -eo comm,rss --sort=-rss | awk 'NR==1{print; next} NR<=11{printf "%-25s %d\n", $1, $2/1024}'
echo "## serviços em execução"; systemctl list-units --type=service --state=running --no-legend | awk '{print $1}'
echo "## portas escutando";     ss -tulpn 2>/dev/null | awk 'NR==1 || /LISTEN|UNCONN/'
echo "## firewall";             sudo -n ufw status verbose 2>/dev/null || echo "(ufw precisa de sudo)"
echo "## vmstat 1s x5 (us/sy/id/wa)"; vmstat 1 5
