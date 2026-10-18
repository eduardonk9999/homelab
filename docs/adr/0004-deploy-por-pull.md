# ADR 0004 — CI no GitHub Actions, deploy por pull no r2d2

- **Status:** aceito
- **Data:** 2026-10-18

## Contexto

O r2d2 não aceita nenhuma conexão vinda da internet (Fase 1). O GitHub Actions precisa publicar a homepage
a cada commit sem que isso abra uma porta ou entregue ao GitHub uma credencial de acesso ao servidor.
A CPU do r2d2 (2C/4T) também não deve gastar tempo com build.

## Opções

| Opção | Problema |
|---|---|
| Runner *self-hosted* no r2d2 | em repo público, um PR de qualquer pessoa pode executar código no servidor |
| Actions → Tailscale → SSH | o GitHub passa a guardar uma chave que dá shell no servidor |
| **Pull: o r2d2 busca a imagem nova** | latência de até ~2 min entre o push e o deploy |

## Decisão

- **CI no GitHub Actions** (runners hospedados): gitleaks, hadolint, checagem de portas (ADR 0002),
  build, **Trivy** (falha em CRITICAL/HIGH com correção disponível) e push para o **GHCR** com tags
  `sha-<commit>` e `main`. Pull requests rodam tudo menos o push.
- Actions **fixadas por SHA** de commit, não por tag (tags podem ser movidas para código malicioso).
- **Deploy por pull**: um `systemd timer` no r2d2 roda `host/deploy/homelab-deploy.sh` a cada 2 minutos:
  `git pull --ff-only`, `docker compose pull`, `docker compose up -d`. O Compose só recria o container se o digest mudou.
- O pacote no GHCR é **público** (a imagem contém só o site estático), então o r2d2 não precisa de token.

## Consequências

- Nenhum segredo do servidor existe fora dele; o único segredo do pipeline é o `GITHUB_TOKEN` efêmero.
- Rollback = reverter o commit (o timer reaplica) ou fixar `image: ...:sha-<anterior>` no compose.
- Mesmo princípio do Flux na Fase 5, o que torna a migração para GitOps natural.
