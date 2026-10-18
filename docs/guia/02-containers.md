# 2. Containers

A ideia central da fase: **um container deve ter só as permissões, a rede e os recursos de que precisa — e provar isso.**

---

## 2.1 Container, imagem e Compose

**O que é.**
- **Imagem:** um pacote só leitura com a aplicação e tudo de que ela depende (ex.: `nginx-unprivileged:1.31-alpine`).
- **Container:** uma imagem em execução, isolada do resto do sistema pelo kernel (namespaces e cgroups).
- **Docker Compose:** um arquivo YAML (`compose.yaml`) que descreve um ou mais containers, redes e volumes. `docker compose up -d` sobe tudo.

**Por que usamos.** A aplicação roda igual em qualquer máquina, e cada uma fica no seu "cercadinho".

**Como está no r2d2.** Dois stacks: [`apps/homepage`](../../apps/homepage) e [`apps/vuln-lab`](../../apps/vuln-lab).
O repo é clonado em `~/homelab` no servidor e o Compose roda de lá.

---

## 2.2 Configuração do engine (`daemon.json`)

**Como está no r2d2.** [`host/docker/daemon.json`](../../host/docker/daemon.json):

| Opção | Problema que resolve |
|---|---|
| `log-opts: max-size 10m, max-file 3` | sem isso, o log de um container cresce até encher o disco de 240 GB |
| `live-restore: true` | sem isso, toda atualização do Docker reinicia todos os containers |
| `metrics-addr: 127.0.0.1:9323` | métricas do Docker pro Prometheus (Fase 6), visíveis só no próprio servidor |

**Como provar o live-restore.** Anotamos o horário de início de cada container, rodamos `sudo systemctl restart docker`
e comparamos: o Docker reiniciou às 11:44, e os containers continuaram com o início de 11:30 e 11:41. Nenhum caiu.

---

## 2.3 O Docker ignora o firewall

**O que é.** Quando você publica uma porta (`ports: ["8080:80"]`), o Docker cria regras próprias de iptables, que são
avaliadas **antes** das do ufw. A porta fica aberta pra rede mesmo com o ufw bloqueando tudo.

**Por que importa.** É uma das pegadinhas mais comuns em servidor com Docker. Num lab com app vulnerável, seria grave.

**Como está no r2d2.** Regra do [ADR 0002](../adr/0002-docker-portas-logs.md): **toda porta declara o IP**.

| Bind | Quem acessa |
|---|---|
| `127.0.0.1:8080:8080` | só o próprio servidor (e você, por túnel SSH) |
| `0.0.0.0:8080` ou `8080:8080` | **qualquer um na rede** — proibido |

O CI barra violações com [`scripts/check-ports.sh`](../../scripts/check-ports.sh) (ver capítulo 3).

**Pergunta de entrevista.** *"Você tem ufw bloqueando tudo e mesmo assim a porta do container está acessível. Por quê?"*

---

## 2.4 Endurecimento do container

**Como está no r2d2.** Na homepage:

| Controle | O que faz | Prova |
|---|---|---|
| imagem `nginx-unprivileged` | o processo roda como uid **101**, não root | `docker exec homepage-web-1 id -u` |
| `read_only: true` + `tmpfs: /tmp` | o sistema de arquivos não aceita escrita (só `/tmp`, em memória) | tentar `touch` dá `Read-only file system` |
| `cap_drop: ALL` | tira todos os "superpoderes" do kernel que o root teria | — |
| `no-new-privileges` | impede que um programa ganhe privilégio (ex.: via setuid) | — |
| `deploy.resources.limits` | teto de 0,25 CPU e 64 MB de RAM | `docker stats` → `/ 64MiB` |
| headers de segurança no nginx | CSP, `X-Frame-Options`, `nosniff` | `curl -sI 127.0.0.1:8080` |

**Por que usamos.** **Defesa em profundidade:** se alguém achar uma falha no nginx, cai num processo sem root,
sem poder escrever em disco, sem porta exposta e com recursos limitados.

---

## 2.5 Health check e reinício automático

**O que é.** Um **health check** é um comando que o Docker roda periodicamente pra saber se a aplicação está
respondendo de verdade, e não só "o processo existe". `restart: unless-stopped` religa o container se ele cair ou se o servidor reiniciar.

**Como está no r2d2.** A homepage tem a rota `/healthz`, que responde `ok`. No Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/healthz"]
```

**Como provar.** `docker compose ps` → `Up … (healthy)`.

---

## 2.6 Túnel SSH

**O que é.** O SSH consegue "puxar" uma porta do servidor pra dentro do seu Mac:

```bash
ssh -N -L 18080:127.0.0.1:8080 r2d2
```

Lê-se: "a porta 18080 do Mac leva à porta 8080 do localhost **do servidor**". O tráfego vai criptografado pela porta 22.

**Por que usamos.** Acessar serviços internos sem abrir nenhuma porta. Em empresas, é assim que se acessa banco de dados e painéis internos.

**Como está no r2d2.** `127.0.0.1:18080` no Mac → homepage; `127.0.0.1:13000` → Juice Shop.

---

## 2.7 Isolamento do lab vulnerável

**O que é.** O OWASP Juice Shop é um site **cheio de falhas de propósito**, pra treinar bug bounty: injeção, SSRF,
upload de arquivo, execução remota.

**Por que precisa de cuidado.** Se alguém (ou você, testando) conseguir executar código dentro dele, o container
não pode virar ponte pra internet, pra sua rede de casa ou pros outros serviços.

**Como está no r2d2.** [ADR 0003](../adr/0003-isolamento-vuln-lab.md):

```
Mac ──túnel──► 127.0.0.1:3000 ──► gateway (nginx) ──► rede "isolated" (internal: true) ──► Juice Shop
                                   (redes edge + isolated)                                  (só a rede isolated)
```

- A rede `isolated` tem `internal: true`: **sem gateway, sem NAT**. Nada lá dentro alcança a internet nem a LAN.
- O gateway é o único que enxerga as duas redes. É nele que o **WAF** vai entrar na Fase 6.

**Como provar.** Um container de teste dentro da rede do lab tenta sair:

```bash
docker run --rm --network vuln-lab_isolated busybox:1.37 \
  sh -c "wget -T 4 http://example.com; ping -c1 192.168.15.1"
```

Resultado: `internet bloqueada` e `LAN bloqueada`. E o CI (capítulo 3) barra qualquer mudança que tire o isolamento.

**Pergunta de entrevista.** *"Como você hospedaria uma aplicação sabidamente vulnerável sem colocar o resto em risco?"*

---

## Teste-se

1. Qual a diferença entre imagem e container?
2. O que acontece com os containers quando o Docker é atualizado, com e sem `live-restore`?
3. Por que `"8080:80"` no compose é perigoso mesmo com o ufw ligado?
4. Cite quatro camadas de proteção da homepage e o que cada uma impede.
5. Qual a diferença entre "o container está rodando" e "o container está healthy"?
6. Explique, sem jargão, o que o comando `ssh -N -L 18080:127.0.0.1:8080 r2d2` faz.
7. Por que o Juice Shop não publica porta própria e precisa de um gateway na frente?
8. Como você provaria pra alguém que o lab não alcança a internet?
