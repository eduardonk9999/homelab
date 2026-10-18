#!/usr/bin/env bash
# ADR 0002: toda porta publicada em compose precisa declarar o IP de bind.
# Falha se encontrar algo como "8080:80" ou - 3000:3000 sem IP na frente.
set -euo pipefail

bad=$(grep -rnE '^\s*-\s*"?[0-9]+:[0-9]+(/(tcp|udp))?"?\s*$' --include='compose*.y*ml' apps/ || true)

if [[ -n "$bad" ]]; then
  echo "Porta publicada sem IP de bind (viola ADR 0002):"
  echo "$bad"
  exit 1
fi
echo "ok: todas as portas publicadas declaram IP de bind"
