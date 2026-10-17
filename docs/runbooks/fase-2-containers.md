# Runbook — Fase 2: containers

Objetivo: homepage e Juice Shop rodando em Docker Compose, com limites de recurso, health checks, volumes
persistentes e nenhuma porta exposta além do necessário (ver ADR 0002).

## 2.1 Configuração do engine

Do Mac, na raiz do repo:

```bash
scp host/docker/daemon.json r2d2:/tmp/
ssh -t r2d2 'sudo install -m 644 /tmp/daemon.json /etc/docker/daemon.json && sudo systemctl restart docker'
```

Verificação:

```bash
ssh r2d2 'docker info --format "live-restore={{.LiveRestoreEnabled}} logging={{.LoggingDriver}}"'
ssh r2d2 'curl -s 127.0.0.1:9323/metrics | head -3'
```

Esperado: `live-restore=true logging=json-file` e linhas de métricas do engine.

## Critério de pronto da Fase 2

- [x] `daemon.json` aplicado (logs com rotação, live-restore, métricas em localhost)
- [ ] homepage rodando em Compose, com health check e limites de CPU/RAM
- [ ] Juice Shop acessível **só** pelo Tailscale; `ss -tlnp` não mostra nenhuma porta de container em `0.0.0.0`
- [ ] teste de reinício: `sudo systemctl restart docker` não derruba os containers
- [ ] teste de reboot: tudo volta sozinho (`restart: unless-stopped`)
- [ ] consumo real medido e registrado em `capacidade.md`
