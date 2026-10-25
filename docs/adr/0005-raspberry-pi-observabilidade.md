# ADR 0005 — Raspberry Pi 5 como nó de observabilidade e confiabilidade

- **Status:** aceito (planejado — hardware ainda não comprado)
- **Data:** 2026-10-25

## Contexto

Até aqui o homelab é um nó só (r2d2, Athlon/x86_64). Em 2026-10-25 o r2d2 ficou fora da rede após um
reboot e **ninguém foi avisado** — o problema só apareceu ao tentar acessá-lo (ver
[postmortem](../postmortems/2026-10-25-wifi-sumiu-apos-reboot.md)). Se a stack de observabilidade (Fase 6)
rodar dentro do r2d2, ela cai junto com ele: não se vigia uma máquina de dentro dela mesma.

Vai entrar um Raspberry Pi 5 (ARM64) no lab.

## Decisão

O Pi 5 será o **nó de confiabilidade**, separado dos workloads do r2d2:

1. **Observabilidade (Fase 6) roda no Pi**, não no r2d2: Prometheus, Grafana, Loki, Alertmanager.
2. **Monitoração de fora:** Blackbox exporter no Pi faz check de ICMP/HTTP contra o r2d2 e os labs;
   quando o r2d2 some, o Alertmanager notifica (Telegram) — funciona mesmo com o r2d2 morto.
3. **Alvo de backup (Fase 6):** repositório restic/borg num SSD no Pi — backup do r2d2 **fora** do r2d2.
4. O r2d2 roda `node_exporter` + cAdvisor e expõe as métricas do Docker (já habilitadas em `127.0.0.1:9323`,
   ADR 0002) para o Pi coletar.

## Consequências

- **Cluster de duas arquiteturas** (x86_64 + ARM64). Imagens próprias passam a exigir build multi-arch
  (`docker buildx`, `linux/amd64,linux/arm64`) — entra no pipeline na Fase 5/6.
- Quando o k3s chegar (Fase 5), o Pi pode também virar um segundo nó do cluster; a observabilidade
  continua sendo seu papel principal.
- O "nó que vigia" não pode depender do "nó vigiado": Prometheus e alertas ficam no Pi; o r2d2 só expõe métricas.

## Hardware (requisitos ao comprar)

- **SSD NVMe** (HAT/base M.2) — nunca cartão SD como disco do Prometheus (escrita constante mata o SD).
- Fonte oficial 27 W; cooler ativo oficial (fica ligado 24/7).
- 8 GB de RAM bastam; 16 GB para folga se também virar nó k3s.
- Rede por cabo (de novo a lição do postmortem: Wi-Fi USB é ponto único de falha).

## Pendências que isto não substitui
Reserva de IP no roteador e "Restore on AC Power Loss" na BIOS do r2d2 (Fase 1) continuam valendo —
inclusive para o próprio Pi quando entrar.
