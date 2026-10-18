# Guia de estudo do homelab

Material para **entender** o que foi montado no r2d2, não só repetir comandos. Cada conceito segue o mesmo formato:

| Seção | Pergunta que responde |
|---|---|
| **O que é** | do que estamos falando, em uma ou duas frases |
| **Por que usamos** | qual problema resolve no r2d2 |
| **Como está no r2d2** | o que foi configurado, e onde está no repo |
| **Como provar** | o comando que mostra que funciona |
| **O que deu errado** | o problema real que apareceu (quando houve) |
| **Pergunta de entrevista** | como isso costuma ser cobrado |

Ao fim de cada capítulo há um **teste-se**: perguntas sem resposta ao lado, pra revisar sozinho.

## Capítulos

1. [Linux base: servidor seguro](01-linux-base.md)
2. [Containers](02-containers.md)
3. [CI/CD: do commit à produção](03-cicd.md)
4. IaC: Ansible e Terraform *(quando a Fase 4 terminar)*
5. Kubernetes *(Fase 5)*
6. Observabilidade e confiabilidade *(Fase 6)*

[Glossário](glossario.md)

## A história em 30 segundos

> Montei um homelab num PC antigo pra praticar DevOps de verdade. Endureci o servidor Linux, coloquei as aplicações
> em containers com isolamento e limites, e criei um pipeline no GitHub Actions que testa, escaneia vulnerabilidades
> e publica a imagem. O servidor busca a versão nova sozinho: do commit à produção leva uns 80 segundos, sem nenhuma
> porta aberta pra internet e sem o GitHub ter acesso ao servidor.

## O mapa

```
                Mac (você)                                   GitHub
                   │ SSH (só chave) + túneis                    │ Actions: testa, escaneia, publica imagem
                   ▼                                            ▼
┌──────────────── r2d2 · Ubuntu 26.04 sem interface gráfica ─── GHCR (registry de imagens)
│  ufw: bloqueia tudo que entra, exceto SSH da LAN               ▲
│                                                               │ o r2d2 PUXA a cada 2 min
│  homepage ── nginx sem root, só leitura, 127.0.0.1:8080 ◄─────┘ (timer systemd)
│  vuln-lab ── gateway nginx 127.0.0.1:3000 ─► Juice Shop (rede sem saída)
└───────────────────────────────────────────────────────────────
```
