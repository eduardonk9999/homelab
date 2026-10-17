# ADR 0003 — Isolamento do lab vulnerável (Juice Shop)

- **Status:** aceito
- **Data:** 2026-10-17

## Contexto

O OWASP Juice Shop é vulnerável de propósito: tem RCE, SSRF, injeção e upload de arquivo. Se um atacante
(ou eu mesmo, testando) conseguir executar código dentro dele, o container não pode virar ponte para a
internet, para a minha LAN ou para os outros serviços do r2d2.

## Decisão

1. **Rede `internal: true`** para o Juice Shop: sem gateway, sem NAT. Um SSRF ou reverse shell lá de dentro não sai.
2. **Gateway nginx** como única porta de entrada, ligado nas duas redes e publicado só em `127.0.0.1:3000`.
   Acesso pelo Mac via túnel SSH (`ssh -N -L 13000:127.0.0.1:3000 r2d2`).
3. **Nunca** exposto na internet (Cloudflare Tunnel não aponta para cá) nem na LAN.
4. Container sem capabilities, `no-new-privileges`, limite de 1 CPU e 512 MB.
5. O gateway é o ponto onde o **WAF** (Coraza + OWASP CRS) entra na Fase 6.

## Alternativas descartadas

- **Publicar a porta do Juice Shop direto em 127.0.0.1:** funcionaria, mas exigiria uma rede com saída para a internet.
- **Tailscale:** fica para quando houver necessidade de acesso fora de casa; o túnel SSH não depende de mais nada.

## Consequências

- O Juice Shop não consegue buscar nada externo; desafios que dependem de internet não funcionam (poucos, aceitável).
- Prova obrigatória a cada mudança: um container de teste na rede `isolated` **não** pode alcançar a internet.
