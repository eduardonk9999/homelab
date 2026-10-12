# ADR 0001 — Sistema operacional: Ubuntu Server 24.04 LTS

- **Status:** aceito
- **Data:** 2026-10-12

## Contexto

Um único nó (Athlon 3000G, 16 GB, SSD 240 GB) vai rodar Docker, depois k3s e a stack de observabilidade.
Precisa ser estável por anos, leve, administrado só por SSH e parecido com o que se encontra em produção.

## Opções

| | Ubuntu Server 24.04 LTS | Debian 13 | Ubuntu 26.04 LTS |
|---|---|---|---|
| Suporte | até 2029 (padrão) | ~2028 + LTS | até 2031 |
| Consumo em idle | ~350 MB | ~250 MB | ~350 MB |
| Docs de k3s/Docker/Ansible e cursos | o mais coberto | bem coberto | ainda amadurecendo |
| Paridade com nuvem (AMIs, runners do GitHub) | alta | média | média |

## Decisão

**Ubuntu Server 24.04 LTS**, instalação limpa, **sem GUI**, com LVM.
A diferença de RAM pro Debian (~100 MB) é irrelevante com 16 GB; o que pesa é a compatibilidade com tutoriais,
cursos e imagens de nuvem. A 26.04 fica pra um upgrade documentado depois (é um bom exercício de runbook).

## Consequências

- Snaps vêm por padrão; não instalar Docker via snap (usar o repositório oficial da Docker).
- O instalador com LVM aloca ~100 GB pro `/` e deixa o resto livre no volume group: **manter assim**.
  O espaço livre serve pra crescer `/var/lib` quando k3s e Prometheus pedirem, e pra snapshots LVM antes de mudanças arriscadas.
