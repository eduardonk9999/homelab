# Arquitetura alvo

Onde o lab quer chegar ao fim da Fase 7. Cada fase acende um pedaço; nada sobe antes de caber em
[`capacidade.md`](capacidade.md).

## Onde as coisas vivem

```mermaid
flowchart TB
  you[Você · MacBook<br/>SSH e kubectl]
  visitors[Visitantes]
  gh[GitHub<br/>código, Actions, GHCR]

  you -- Tailscale --> r2d2
  visitors -- Cloudflare Tunnel<br/>só a homepage --> homepage
  gh -- Flux puxa manifests<br/>e imagens --> platform

  subgraph r2d2[r2d2 · Ubuntu 26.04 headless · ufw · backup restic]
    subgraph k3s[Cluster k3s single-node]
      platform[platform<br/>Traefik, Flux, cert-manager]
      homepage[homepage<br/>staging + prod]
      obs[observability<br/>Prometheus, Grafana, Loki]
      vuln[vuln-lab<br/>Juice Shop + WAF<br/>sem saída de rede]:::danger
    end
    subgraph demand[Perfis sob demanda]
      ollama[Ollama ~3–4 GB]:::ondemand
      k3d[k3d multi-nó ~2 GB]:::ondemand
      localstack[LocalStack ~1 GB]:::ondemand
    end
  end

  classDef danger fill:#FAECE7,stroke:#993C1D,color:#712B13
  classDef ondemand stroke-dasharray:4 3
```

Regras:

- **vuln-lab nunca é exposto na internet.** Acesso só pelo Tailscale. NetworkPolicy bloqueia qualquer saída e o tráfego vindo de outros namespaces.
- Visitantes chegam **só** à homepage, por túnel de saída. Nenhuma porta é aberta no roteador.
- Perfis sob demanda não rodam ao mesmo tempo que build ou outro perfil pesado.

## Como uma mudança chega lá

```mermaid
flowchart LR
  push[git push<br/>main ou tag] --> ci[GitHub Actions<br/>teste, Trivy, gitleaks]
  ci --> ghcr[GHCR<br/>imagem versionada]
  ghcr --> flux[Flux no r2d2<br/>puxa e aplica]
  flux --> app[homepage<br/>main → staging<br/>tag → prod]

  ansible[Ansible<br/>configura o host]:::infra
  tf[Terraform<br/>Cloudflare, GitHub, Helm]:::infra

  app -.-> o11y[Prometheus · Loki · Grafana<br/>Alertmanager → Telegram]

  classDef infra fill:#F1EFE8,stroke:#5F5E5A
```

- **Pull, não push.** O CI nunca recebe credencial do cluster. É o Flux, dentro do r2d2, que puxa o estado desejado do Git.
- **O build roda na nuvem.** A CPU de 2 núcleos do r2d2 só baixa e executa imagens prontas.
- **Infraestrutura é rodada por você.** Ansible e Terraform saem do Mac, com plano revisado antes de aplicar.

## Fases × componentes

| Fase | Acende |
|---|---|
| 1 | host: SSH, ufw, updates, Tailscale |
| 2 | Docker Compose: homepage e Juice Shop rodando como containers |
| 3 | GitHub Actions + GHCR + deploy automático (ainda em Compose) |
| 4 | Ansible reproduz o host; Terraform cria túnel/DNS e repositórios |
| 5 | migração Compose → k3s, namespaces, Helm, Flux |
| 6 | observability, WAF + painel de ataques, backup + restauração, falhas simuladas |
| 7 | polimento: postmortems, dashboards públicos, demo de commit → produção |
