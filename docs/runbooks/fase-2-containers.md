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

## 2.2 Homepage

O repo é clonado no servidor e o Compose roda de lá (na Fase 3 o pull vira automático):

```bash
# no r2d2
git clone https://github.com/eduardonk9999/homelab.git ~/homelab   # só na primeira vez
cd ~/homelab && git pull && cd apps/homepage && docker compose up -d --build
docker compose ps        # STATUS deve mostrar (healthy)
```

Ver no navegador do Mac **sem abrir porta**, com túnel SSH:

```bash
# no Mac
ssh -N -L 18080:127.0.0.1:8080 r2d2      # deixe rodando; abra http://127.0.0.1:18080
```

Endurecimento do container, e como provar cada item:

| Controle | Prova |
|---|---|
| usuário sem privilégio | `docker exec homepage-web-1 id -u` → `101` |
| sistema de arquivos só leitura | `docker exec homepage-web-1 touch /usr/share/nginx/html/x` → `Read-only file system` |
| sem capabilities, sem escalada | `cap_drop: ALL` + `no-new-privileges` no compose |
| limite de recursos | `docker stats` → `/ 64MiB` |
| porta só em localhost | `ss -tln` → `127.0.0.1:8080`; da LAN, `curl 192.168.15.15:8080` não responde |
| headers de segurança | `curl -sI 127.0.0.1:8080` → CSP, X-Frame-Options, nosniff |

## Critério de pronto da Fase 2

- [x] `daemon.json` aplicado (logs com rotação, live-restore, métricas em localhost)
- [x] homepage rodando em Compose, com health check e limites de CPU/RAM
- [ ] Juice Shop acessível **só** pelo Tailscale; `ss -tlnp` não mostra nenhuma porta de container em `0.0.0.0`
- [ ] teste de reinício: `sudo systemctl restart docker` não derruba os containers
- [ ] teste de reboot: tudo volta sozinho (`restart: unless-stopped`)
- [ ] consumo real medido e registrado em `capacidade.md`
