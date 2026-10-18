# Runbook — Fase 3: CI/CD

Ver ADR 0004. Commit em `main` → GitHub Actions (checks, build, Trivy, push GHCR) → timer no r2d2 puxa e aplica.

## 3.1 Pipeline

Arquivo: `.github/workflows/homepage.yml`. Roda em push/PR que mexa em `apps/homepage/**`.

O pacote herda a visibilidade do repo (público) pelo label `org.opencontainers.image.source`
que o `metadata-action` coloca na imagem. Prova: `docker logout ghcr.io && docker pull ghcr.io/eduardonk9999/homelab-homepage:main`
funciona sem login.

**O que o pipeline barrou na primeira semana (2026-10-18)**, na ordem:

| Tentativa | Barrado por | Causa | Correção |
|---|---|---|---|
| 1 | hadolint DL3025 | `HEALTHCHECK` em formato shell | formato JSON |
| 2 | Trivy | 43 HIGH: base `nginx 1.29` parou de receber patches | base `1.30` (ramo estável) + Dependabot |
| 3 | Trivy | 1 HIGH: libexpat corrigido no Alpine, ainda não na base | `apk upgrade` no build + rebuild semanal |
| 4 | hadolint DL3066 | `USER root` não numérico | `USER 0` |
| 5 | — | verde | imagem publicada |

## 3.2 Agente de deploy no r2d2

```bash
# no r2d2
cd ~/homelab && git pull
sudo install -m 644 host/deploy/homelab-deploy.service host/deploy/homelab-deploy.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now homelab-deploy.timer
systemctl list-timers homelab-deploy.timer        # próxima execução
journalctl -u homelab-deploy.service -n 20       # histórico de deploys
```

## 3.3 Demo: do commit à produção

1. Editar `apps/homepage/site/index.html` e fazer push.
2. Acompanhar o pipeline: `gh run watch`.
3. Em até ~2 min depois do push da imagem, `journalctl -u homelab-deploy.service` mostra `deploy: apps/homepage atualizado`.
4. A página nova aparece em http://127.0.0.1:18080 (túnel SSH).

## Critério de pronto da Fase 3

- [x] pipeline verde (gitleaks, hadolint, portas, Trivy, push) — na 5ª tentativa, ver tabela acima
- [x] pacote `homelab-homepage` público no GHCR (pull anônimo ok)
- [x] timer ativo no r2d2, homepage rodando a imagem do GHCR (primeiro deploy 2026-10-18 09:43, commit 9314ac2)
- [x] demo: mudança no HTML chega ao r2d2 sem nenhum comando manual — **84 s** do `git push` (09:44:26) ao deploy (09:45:50), commit 8216dff; CI levou ~80 s
- [ ] PR com porta sem IP de bind é barrado pelo pipeline
