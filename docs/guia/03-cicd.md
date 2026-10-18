# 3. CI/CD: do commit à produção

A ideia central da fase: **toda mudança passa por checagens automáticas antes de chegar no servidor, e o servidor se atualiza sozinho sem dar acesso a ninguém.**

---

## 3.1 CI e CD

**O que é.**
- **CI (integração contínua):** a cada commit, um robô testa e valida o código.
- **CD (entrega/deploy contínuo):** se passou, a versão nova chega no servidor sem trabalho manual.

**Como está no r2d2.**

```
git push → GitHub Actions ─┬─ gitleaks (segredos)        ─┐
                           ├─ hadolint (Dockerfile)       │ se tudo passar
                           ├─ check-ports (ADR 0002)      │
                           ├─ build da imagem             │
                           └─ Trivy (vulnerabilidades)   ─┴─► push pro GHCR ──► r2d2 puxa em até 2 min
```

Arquivos: [`.github/workflows/homepage.yml`](../../.github/workflows/homepage.yml) e
[`.github/workflows/compose.yml`](../../.github/workflows/compose.yml).

**Resultado medido:** **84 segundos** do `git push` à página nova no ar.

---

## 3.2 As checagens do pipeline

| Ferramenta | O que procura | Por que importa |
|---|---|---|
| **gitleaks** | senhas, tokens e chaves no histórico do Git | um segredo commitado num repo público é vazado na hora |
| **hadolint** | más práticas no Dockerfile | pegou o `HEALTHCHECK` em formato shell e o `USER root` não numérico |
| **check-ports** | porta publicada sem IP | evita a pegadinha do Docker × firewall (capítulo 2) |
| **compose config** | erro de sintaxe nos compose | não deixa um YAML quebrado chegar no servidor |
| **checagem do vuln-lab** | se o Juice Shop continua em rede `internal` | ninguém tira o isolamento por engano |
| **Trivy** | vulnerabilidades conhecidas (CVEs) nos pacotes da imagem | falha em HIGH/CRITICAL que já têm correção |

**Shift-left:** encontrar o problema o mais cedo possível (no PR), em vez de em produção.

**O que deu errado (e foi bom).** O pipeline só ficou verde na 5ª tentativa:

| # | Barrado por | Causa |
|---|---|---|
| 1 | hadolint | `HEALTHCHECK` em formato shell |
| 2 | Trivy | **43 vulnerabilidades HIGH**: a base nginx 1.29 parou de receber patches |
| 3 | Trivy | 1 HIGH no libexpat: corrigido no Alpine, ainda não na imagem base |
| 4 | hadolint | `USER root` em vez de `USER 0` |

Sem o Trivy, a imagem com 43 falhas conhecidas teria ido pra produção sem ninguém perceber.

**Como provar que a regra de portas funciona.** O PR #3 expôs a homepage em `0.0.0.0` de propósito.
O pipeline reprovou: `Porta publicada sem IP de bind (viola ADR 0002)`. Fechado sem merge; a evidência fica no GitHub.

---

## 3.3 Registry de imagens (GHCR)

**O que é.** Um "depósito" de imagens Docker. O GHCR é o do GitHub, gratuito pra pacotes públicos.

**Como está no r2d2.** `ghcr.io/eduardonk9999/homelab-homepage`, com duas tags:
- `sha-<commit>`: imutável, aponta pra um commit exato (bom pra rollback);
- `main`: sempre a última versão da branch principal.

O pacote é público porque herda a visibilidade do repo. O r2d2 baixa **sem login**.

---

## 3.4 Deploy por pull

**O que é.** Em vez de o pipeline **empurrar** a versão nova pro servidor (push), o servidor **busca** sozinho (pull).

**Por que usamos.** O r2d2 não tem porta aberta pra internet, e não queríamos guardar no GitHub uma credencial de acesso a ele.

| Opção | Problema |
|---|---|
| runner do Actions instalado no r2d2 | em repo público, um PR de qualquer pessoa pode executar código no servidor |
| Actions entra por SSH (via Tailscale) | o GitHub passa a guardar uma chave que dá shell no servidor |
| **pull (escolhido)** | até ~2 min de atraso entre a imagem publicada e o deploy |

**Como está no r2d2.** [ADR 0004](../adr/0004-deploy-por-pull.md). Um **systemd timer** roda a cada 2 minutos o script
[`host/deploy/homelab-deploy.sh`](../../host/deploy/homelab-deploy.sh):

```bash
git pull --ff-only          # pega os compose novos
docker compose pull         # baixa imagem nova, se houver
docker compose up -d        # recria só o que mudou
```

**Como provar.**

```bash
systemctl list-timers homelab-deploy.timer                  # próxima execução
journalctl -u homelab-deploy.service | grep "deploy:"       # histórico de deploys
```

**Pergunta de entrevista.** *"Push ou pull pra deploy? Qual a diferença de segurança?"*
É o mesmo princípio do **GitOps** (ArgoCD, Flux), que vamos usar na Fase 5.

---

## 3.5 Cadeia de suprimentos (supply chain)

**O que é.** Tudo que o seu software usa e que você não escreveu: imagens base, actions do GitHub, bibliotecas.
Se uma dessas peças for comprometida, você também é.

**Como está no r2d2.**
- **Actions fixadas por SHA do commit**, não por tag: `actions/checkout@3d3c42e…  # v7.0.1`.
  Uma tag pode ser movida pra apontar pra código malicioso (aconteceu com a `tj-actions/changed-files` em 2025); um SHA não.
- **Dependabot** ([`.github/dependabot.yml`](../../.github/dependabot.yml)) abre PR semanal quando sai versão nova de action ou de imagem.
  Os PRs passam pelo pipeline antes do merge.
- **Rebuild semanal** (toda segunda) com `apk upgrade`, pra correções do Alpine entrarem mesmo sem commit.
- **Permissões mínimas** no workflow: `contents: read` por padrão; só o job de build pede `packages: write`.

**O que aconteceu na prática.** O Dependabot propôs nginx 1.31 (mainline). O PR da homepage passou no pipeline.
O do vuln-lab **não tinha CI nenhum** cobrindo, então criamos o workflow `compose` antes de aceitar.
Depois do merge, os dois stacks foram atualizados no r2d2 sozinhos, e o isolamento foi testado de novo.

---

## Teste-se

1. Qual a diferença entre CI e CD?
2. O que é "shift-left" e qual exemplo real aconteceu neste projeto?
3. Por que publicar duas tags (`sha-…` e `main`) da mesma imagem?
4. Cite dois motivos pra não instalar um runner self-hosted num repo público.
5. Por que fixar uma action por SHA em vez de por tag?
6. O Dependabot abriu um PR. O que garante que aceitar não quebra nada?
7. Como você faria rollback se a versão nova da homepage estivesse quebrada?
8. Em que ponto do fluxo o servidor recebe alguma credencial do GitHub? (pegadinha)
