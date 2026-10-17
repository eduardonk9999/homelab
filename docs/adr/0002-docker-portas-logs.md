# ADR 0002 — Docker: nenhuma porta em 0.0.0.0, logs com rotação, live-restore

- **Status:** aceito
- **Data:** 2026-10-17

## Contexto

O Docker escreve as próprias regras de iptables. Uma porta publicada com `-p 8080:80` (ou `ports: ["8080:80"]`)
fica acessível pela rede **mesmo com o ufw em `deny incoming`**, porque o tráfego passa pela chain `FORWARD`/`DOCKER`
antes das regras do ufw. Num lab que vai hospedar uma aplicação propositalmente vulnerável, isso é inaceitável.

Além disso, o padrão do Docker não rotaciona logs (o SSD tem 240 GB) e reinicia todos os containers
sempre que o próprio daemon reinicia, o que acontece a cada atualização automática do pacote.

## Decisão

1. **Toda porta publicada declara o IP de bind**, nunca o padrão `0.0.0.0`:
   - `127.0.0.1:PORTA` para o que só o próprio host acessa (ex.: métricas, bancos);
   - `100.101.202.16:PORTA` (IP do Tailscale) para o que só eu acesso de fora (ex.: vuln-lab);
   - **nada** para o que é público: a homepage sai por **Cloudflare Tunnel**, que é uma conexão de *saída* e não precisa de porta publicada.
2. `daemon.json` com logs `json-file` limitados a 10 MB × 3 por container e `live-restore: true`.
3. Métricas do engine em `127.0.0.1:9323`, já prontas pro Prometheus na Fase 6.

## Alternativas descartadas

- **Regras na chain `DOCKER-USER`:** funcionam, mas são fáceis de esquecer e de quebrar; a regra de bind é visível no próprio `compose.yaml` e pode ser checada no CI.
- **`"iptables": false` no daemon:** quebra a rede dos containers e exige NAT manual.

## Consequências

- Revisão obrigatória: `ports:` sem IP na frente é erro. Na Fase 3 isso vira uma checagem automática no pipeline.
- O usuário `duzera` está no grupo `docker`, o que equivale a acesso root. Aceito num lab com um único administrador e SSH só por chave; registrado aqui para não passar despercebido.
