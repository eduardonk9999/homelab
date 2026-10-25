# Capacidade e orçamento de recursos

Regra: **nada entra no r2d2 sem caber neste orçamento.** Os números estimados são substituídos por medições
(`host/scripts/baseline.sh`) conforme cada fase entra.

## RAM (16 GB)

| Camada | Estimado | Medido | Fase |
|---|---|---|---|
| Ubuntu idle, headless (com dockerd, Tailscale e Ollama ociosos) | ~350 MB | **709 MB** (2026-10-12) | 1 |
| Docker engine | ~100 MB | | 2 |
| Homepage (nginx, limite 64 MB) | ~20 MB | **5 MB** (2026-10-17) | 2 |
| Juice Shop + gateway nginx (limites 512 MB + 64 MB) | ~300 MB | **94 MB** (2026-10-17) | 2 |
| Apps de demo (2–3 APIs + Postgres) | ~1 GB | | 2–3 |
| k3s server (com Traefik, CoreDNS, metrics-server) | ~700 MB–1 GB | | 5 |
| Prometheus (retenção 7 dias, scrape 30 s) | ~400–700 MB | | 6 |
| Grafana | ~150 MB | | 6 |
| Loki + Promtail/Alloy | ~300 MB | | 6 |
| Ollama com modelo 3B carregado | ~3–4 GB | | sob demanda |
| **Reserva (cache de página / folga)** | **≥ 4 GB** | | — |

## CPU (2C/4T)

O maior gargalo. Decisões que saem daqui:
- **Build de imagens roda no GitHub Actions**, não no r2d2. O r2d2 só faz `pull` (GHCR é grátis pra repo público).
- Ollama e build não rodam ao mesmo tempo.
- Toda carga recebe `cpus:` / `resources.limits` antes de subir.

## Disco (240 GB)

| Uso | Limite |
|---|---|
| `/` (LV `ubuntu-lv`) | ~100 GB alocados; o restante do VG fica livre |
| Imagens Docker/containerd | `docker system prune` agendado; alerta acima de 70% |
| Prometheus | retenção por tempo **e** tamanho (`--storage.tsdb.retention.size`) |
| Modelos do Ollama | no máximo 2 baixados |

## Sinais de que um upgrade é necessário (e qual)

| Sintoma medido | Upgrade justificado |
|---|---|
| load average > 4 sustentado, `%steal`/`iowait` baixos | CPU (Ryzen 5 5600G) |
| uso de swap > 0 de forma persistente, OOM kills | RAM |
| disco > 80% mesmo com limpeza/retenção | SSD extra |

## Segundo nó: Raspberry Pi 5 (planejado — ADR 0005)

Nó de **observabilidade e confiabilidade**, separado do r2d2. Orçamento próprio quando chegar:

| Camada | Estimado | Fase |
|---|---|---|
| SO ARM64 idle (headless) | ~300 MB | — |
| Prometheus (retenção por tempo+tamanho) | ~400–700 MB | 6 |
| Grafana | ~150 MB | 6 |
| Loki + coletor | ~300 MB | 6 |
| Alertmanager + Blackbox exporter | ~100 MB | 6 |
| Backup (restic/borg, sob demanda) | pico de CPU/IO | 6 |

Disco: **SSD NVMe**, nunca cartão SD (escrita constante do Prometheus). Métricas do r2d2 chegam via node_exporter + cAdvisor + endpoint do Docker (127.0.0.1:9323, ADR 0002).
