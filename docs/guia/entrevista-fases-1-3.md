# Resumo para entrevista — Fases 1 a 3

Como contar o homelab numa entrevista de DevOps. Cada fase tem: **o pitch** (30s), **como foi feito**,
e os **pontos fortes** (as decisões que mostram profundidade).

## Abertura (o contexto, 20s)

> "Montei um homelab num PC antigo — um Athlon de 2 núcleos, sem comprar nada — pra praticar DevOps
> de ponta a ponta. A regra do projeto é que toda decisão técnica é documentada num ADR e cada fase
> tem um critério de pronto verificável. Está tudo num repositório público no GitHub."

Números pra ter na ponta da língua: **do commit à produção em 84s**, **43 CVEs barrados pelo pipeline**,
**0 portas abertas pra internet**, **~700 MB de RAM em idle**.

---

## Fase 1 — Linux base (servidor seguro)

**Pitch:** "Peguei um Ubuntu desktop e transformei num servidor endurecido: SSH só com chave, firewall
negando tudo por padrão e atualizações de segurança automáticas."

**Como foi feito:**
- Converti pra headless (`systemctl set-default multi-user.target`) — caiu de 925 MB pra ~700 MB de RAM.
- SSH: desliguei senha e login de root; só chave ed25519 (arquivo `10-hardening.conf`, com prefixo numérico
  pra vencer a ordem de leitura do sshd).
- ufw: `deny incoming` por padrão, liberando a porta 22 só pra LAN e pro Tailscale.
- `unattended-upgrades` pra correções de segurança.

**Pontos fortes (o que mostra profundidade):**
- "Descobri que o ufw estava **ativo como serviço mas desligado como regra** — serviço rodando não é regra
  aplicada. Confirmei com `ufw status verbose`."
- "O servidor tinha **IPv6 público**: sem NAT, a porta 22 estava exposta direto na internet. O firewall
  fechou isso. NAT não é firewall — só existe em IPv4."
- "Reduzi a **superfície de ataque** removendo serviços sem uso (impressão, modem). Um deles, o cups-browsed,
  tinha um CVE crítico de RCE de 2024."

---

## Fase 2 — Containers (Docker Compose)

**Pitch:** "Subi as aplicações em containers com isolamento e limites: rodando sem root, sistema de arquivos
só leitura, teto de CPU e RAM, e nenhuma porta publicada pra rede sem necessidade."

**Como foi feito:**
- Docker CE do repositório oficial (não snap). `daemon.json` com rotação de logs e `live-restore`.
- Cada serviço com `read_only`, `cap_drop: ALL`, `no-new-privileges`, `deploy.resources.limits` e health check.
- Uma app pública (homepage) e uma app propositalmente vulnerável (Juice Shop) pra treino.

**Pontos fortes:**
- "O **Docker ignora o ufw**: uma porta publicada com `-p 8080:80` fura o firewall porque o Docker escreve
  as próprias regras de iptables antes do ufw. Por isso minha regra é **sempre declarar o IP no bind**
  (`127.0.0.1:...`), registrada num ADR, e o acesso externo é por **túnel SSH**."
- "A app vulnerável fica numa **rede Docker `internal`**, sem rota de saída — provei com um container de teste
  que não alcança nem a internet nem a LAN. Se alguém a explorar, não vira ponte pro resto."
- "Testei o `live-restore`: reiniciei o Docker e os containers **não caíram** (comparei o StartedAt)."
- "Defesa em profundidade: mesmo com uma falha no nginx, o atacante cai num processo sem root, sem escrita
  em disco e sem porta exposta."

---

## Fase 3 — CI/CD (do commit à produção)

**Pitch:** "Montei um pipeline no GitHub Actions que, a cada commit, roda segurança e testes, publica a imagem
no registry, e o servidor **puxa** a versão nova sozinho. Do push à produção são 84 segundos, sem abrir porta
nem dar credencial do servidor pro GitHub."

**Como foi feito:**
- Pipeline: gitleaks (segredos) → hadolint (Dockerfile) → checagem de portas (ADR 0002) → build → Trivy
  (CVEs) → push pro GHCR, com tags `sha-<commit>` e `main`.
- **Deploy por pull:** um systemd timer no servidor roda `git pull` + `docker compose pull/up` a cada 2 min.
- Actions **fixadas por SHA** de commit; Dependabot pra atualizar imagens e actions; rebuild semanal.

**Pontos fortes:**
- "Escolhi **pull em vez de push** porque o servidor não tem porta aberta e eu não queria guardar no GitHub
  uma credencial que dá shell nele. É o princípio do GitOps (Flux/ArgoCD)."
- "O pipeline **só ficou verde na 5ª tentativa** — e isso é bom: o Trivy barrou 43 vulnerabilidades HIGH
  porque a imagem base do nginx tinha parado de receber patches. Sem o scan, isso teria ido pra produção.
  É o 'shift-left' na prática."
- "Fixo actions por **SHA e não por tag** porque tag pode ser movida pra código malicioso — aconteceu com a
  tj-actions/changed-files em 2025."
- "Fiz um PR de teste **expondo uma porta de propósito** e o pipeline barrou — tenho a evidência no histórico."

---

## Perguntas que provavelmente vêm (e a resposta curta)

- **"Por que o servidor puxa em vez de o CI enviar?"** → nenhuma credencial do servidor sai de casa, nenhuma
  porta aberta. GitOps.
- **"Como você garante que a imagem é segura?"** → Trivy no pipeline falha em CVE HIGH/CRITICAL com correção;
  Dependabot + rebuild semanal mantêm a base nova.
- **"Por que Compose e não Kubernetes direto?"** → medir antes de escalar. É um PC de 2 núcleos; comecei com
  Compose, medi o consumo, e o k3s entra numa fase seguinte sabendo quanto sobra.
- **"Já teve algum incidente?"** → sim: o servidor sumiu da rede depois de um reboot porque uma faxina de
  pacotes removeu uma dependência invisível do adaptador Wi-Fi. Escrevi um postmortem com causa raiz,
  linha do tempo e ações (nunca `autoremove -y` em servidor; reboot de teste; monitorar de fora).

## O que dizer sobre o que ainda falta (honestidade = maturidade)

> "A observabilidade e o cluster Kubernetes são as próximas fases. O incidente me mostrou que monitoramento
> tem que rodar **fora** da máquina monitorada, então vou colocar Prometheus/Grafana/alertas num segundo nó
> (um Raspberry Pi), formando um cluster de duas arquiteturas."
