# Runbook — Fase 3: CI/CD

Ver ADR 0004. Commit em `main` → GitHub Actions (checks, build, Trivy, push GHCR) → timer no r2d2 puxa e aplica.

## 3.1 Pipeline

Arquivo: `.github/workflows/homepage.yml`. Roda em push/PR que mexa em `apps/homepage/**`.

Depois do **primeiro** push bem-sucedido, tornar o pacote público (uma vez só):
GitHub → perfil → **Packages** → `homelab-homepage` → **Package settings** → *Change visibility* → **Public**.

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

- [ ] pipeline verde no primeiro push (gitleaks, hadolint, portas, Trivy, push)
- [ ] pacote `homelab-homepage` público no GHCR
- [ ] timer ativo no r2d2, homepage rodando a imagem do GHCR
- [ ] demo: mudança no HTML chega ao r2d2 sem nenhum comando manual; tempo medido e registrado
- [ ] PR com porta sem IP de bind é barrado pelo pipeline
