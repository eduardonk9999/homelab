# ADR 0001 — Sistema operacional: manter o Ubuntu 26.04.1 LTS existente, convertido para headless

- **Status:** aceito (substitui a proposta inicial de reinstalar com 24.04)
- **Data:** 2026-10-12

## Contexto

O r2d2 já roda **Ubuntu 26.04.1 LTS** (kernel 7.0), instalado como desktop (GNOME, `ubuntu-desktop-minimal`),
com Docker CE do repositório oficial, Tailscale e Ollama. Disco sem LVM: uma partição ext4 de 218 GB (14% usado).

## Opções

| | Manter o sistema atual | Reinstalar Ubuntu Server 24.04 |
|---|---|---|
| Suporte | até 2031 | até 2029 |
| Esforço | auditar + hardening | tarde de reinstalação + restaurar arquivos |
| Docker CE / Tailscale | já instalados pelo repositório oficial | reinstalar |
| LVM / snapshots | não tem | teria |
| GUI | presente, desligável (`multi-user.target`) | não teria |

## Decisão

**Manter o 26.04.1 LTS** e converter para headless (boot em `multi-user.target`). O suporte é maior e
o Docker já tem pacote oficial pra 26.04. Assumir e endurecer um servidor que já existe também é uma situação mais próxima do trabalho real
do que instalar do zero.

## Consequências

- Sem LVM: nada de snapshot antes de mudança arriscada. A rede de segurança passa a ser backup (Fase 6).
- Ferramentas mais novas que o 26.04 (k3s com kernel 7.0) precisam de validação na Fase 5, antes de qualquer outra coisa.
- Pacotes de desktop ficam instalados por ora; removê-los é um item opcional de limpeza.
