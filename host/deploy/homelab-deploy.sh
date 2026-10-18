#!/usr/bin/env bash
# Agente de deploy por pull (ADR 0004). Roda no r2d2 via systemd timer.
# Nenhuma credencial do servidor existe fora dele: é o r2d2 que busca o estado novo.
set -euo pipefail

REPO="$HOME/homelab"
STACKS=(apps/homepage)

cd "$REPO"
git pull --ff-only --quiet

for stack in "${STACKS[@]}"; do
  cd "$REPO/$stack"
  before=$(docker compose images -q 2>/dev/null | sort | tr '\n' ' ')
  docker compose pull --quiet
  docker compose up -d --remove-orphans --quiet-pull
  after=$(docker compose images -q 2>/dev/null | sort | tr '\n' ' ')
  if [[ "$before" != "$after" ]]; then
    echo "deploy: $stack atualizado ($(git -C "$REPO" rev-parse --short HEAD))"
  fi
done
