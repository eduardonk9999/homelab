# 1. Linux base: servidor seguro

A ideia central da fase: **um servidor deve fazer só o que precisa, aceitar só quem precisa, e se manter atualizado sozinho.**

---

## 1.1 Servidor headless

**O que é.** Um sistema sem interface gráfica, administrado só pelo terminal (SSH).

**Por que usamos.** A interface gráfica (GNOME) gasta RAM e CPU, e cada programa a mais é uma possível falha de segurança.
Num servidor ninguém olha a tela.

**Como está no r2d2.** O Ubuntu veio como desktop. Em vez de reinstalar, mudamos o "alvo" de boot:

```bash
sudo systemctl set-default multi-user.target   # sobe sem interface gráfica
```

A decisão de manter o sistema em vez de reinstalar está no [ADR 0001](../adr/0001-sistema-operacional.md).

**Como provar.** `systemctl get-default` → `multi-user.target`; `systemctl is-active gdm3` → `inactive`.
O uso de RAM em idle caiu de 925 MB pra **~700 MB**.

**Pergunta de entrevista.** *"Você reinstalaria ou aproveitaria um servidor que já existe?"*
Depende do que ele tem. Aqui o sistema era recente (26.04 LTS, suporte até 2031) e o Docker vinha do repositório oficial,
então auditar e endurecer saiu mais barato, e é mais próximo do dia a dia, em que você herda servidores.

---

## 1.2 SSH com chave

**O que é.** SSH é o protocolo de acesso remoto ao terminal. A autenticação por **chave** usa um par:
a chave **privada** fica só no Mac e a **pública** vai pro servidor (`~/.ssh/authorized_keys`).
O servidor desafia, o Mac prova que tem a privada, e **nada secreto trafega**.

**Por que usamos.** Senha pode ser adivinhada por força bruta; uma chave ed25519 não.

**Como está no r2d2.** [`host/ssh/10-hardening.conf`](../../host/ssh/10-hardening.conf):

| Opção | Efeito |
|---|---|
| `PasswordAuthentication no` | senha não entra |
| `PermitRootLogin no` | ninguém entra direto como root |
| `AllowUsers duzera` | só esse usuário pode tentar |
| `MaxAuthTries 3` | 3 tentativas por conexão |

O nome começa com `10-` de propósito: o sshd usa o **primeiro** valor que encontra, e os arquivos de
`sshd_config.d/` são lidos em ordem alfabética. Assim o nosso vence qualquer `50-cloud-init.conf`.

**Como provar.**

```bash
ssh r2d2 'echo ok'                                                    # entra
ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password r2d2   # Permission denied (publickey)
```

**Fingerprint (impressão digital).** Na primeira conexão o SSH mostra a impressão digital da chave do *servidor*.
Ela serve pra você saber que está falando com a máquina certa, e não com alguém no meio do caminho.
Quando o IP do r2d2 mudou, conferimos que a impressão `SHA256:nlFa/QzcpP4q…` era a mesma antes de aceitar.

**O que deu errado.** Rodar `ssh r2d2` *de dentro* do próprio r2d2 dá `Permission denied`: ele tenta entrar nele mesmo.
Olhe sempre o prompt: `duzera@r2d2` é o servidor, `eduardosilva@MacBook` é o Mac.

---

## 1.3 Firewall (ufw)

**O que é.** Regras que decidem quais conexões podem entrar e sair. O `ufw` é uma interface simples para o firewall do kernel (nftables/iptables).

**Por que usamos.** Princípio do **menor privilégio**: bloquear tudo e liberar só o necessário.

**Como está no r2d2.** [`host/firewall/ufw.sh`](../../host/firewall/ufw.sh):

```bash
ufw default deny incoming                                  # bloqueia tudo que entra
ufw allow from 192.168.15.0/24 to any port 22 proto tcp    # SSH só da rede de casa
ufw allow in on tailscale0                                 # e da VPN Tailscale
```

**Como provar.** `sudo ufw status verbose`.

**O que deu errado (duas vezes).**

1. O serviço `ufw` estava "ativo", mas o firewall estava **desligado** (`Estado: inativo`). Serviço rodando ≠ regra aplicada.
2. O r2d2 tem **IPv6 público** (`2804:…`). Em IPv6 não existe NAT: o servidor é endereçável direto da internet,
   e a porta 22 estava aberta nele. Com o ufw ligado, o teste de fora passou a dar *timeout*.

Pegadinha extra: o Mac estava acessando o r2d2 **por IPv6**. Se tivéssemos ativado a regra "só a LAN IPv4" sem
perceber, teríamos ficado trancados do lado de fora. Por isso o `~/.ssh/config` do Mac ganhou `AddressFamily inet`.

**Pergunta de entrevista.** *"Por que NAT não substitui firewall?"*
NAT só existe em IPv4. Com IPv6, cada dispositivo pode ter endereço público, e só o firewall protege.

---

## 1.4 Atualizações automáticas

**O que é.** O `unattended-upgrades` instala sozinho as **atualizações de segurança** do Ubuntu.

**Por que usamos.** A maioria das invasões explora falhas já corrigidas, em sistemas que ninguém atualizou.

**Como está no r2d2.** Ativo, com reboot automático **desligado**. Quando chega kernel novo, o arquivo
`/var/run/reboot-required` aparece, e o reboot é feito de forma consciente.

**O que deu errado.** Depois do `full-upgrade`, 18 pacotes do `sssd` continuaram "pendentes". Não era erro: era
*phased update*, o Ubuntu liberando a atualização aos poucos pra detectar pacote quebrado antes de chegar em todo mundo.

---

## 1.5 Superfície de ataque

**O que é.** O conjunto de tudo que um atacante pode tentar usar: portas abertas, serviços rodando, programas instalados.

**Por que usamos.** Menos coisa rodando = menos coisa pra dar errado.

**Como está no r2d2.** Removemos impressão (`cups`, `cups-browsed`) e modem (`modemmanager`). O `cups-browsed`
teve falha crítica de execução remota em 2024 (CVE-2024-47176).

**O que deu errado.** Ao remover o `cups`, o apt instalou o `legacy-printer-app` no lugar (os drivers de impressora
dependiam de "algum cups"), e ele **abriu a porta 8000** em todas as interfaces. Só descobrimos olhando `ss -tlnp`.
Lição: depois de mexer em pacotes, confira as portas abertas.

E outra: o `network-manager` (que mantém o Wi-Fi) estava marcado como "instalado automaticamente". Um `autoremove`
futuro poderia removê-lo e derrubar a rede. Corrigido com `sudo apt-mark manual network-manager`.

**Como provar.** `ss -tlnp` lista o que escuta em cada porta.

---

## 1.6 Medir antes de decidir

**O que é.** Uma **baseline** é uma foto do consumo de recursos num momento conhecido, pra comparar depois.

**Por que usamos.** Upgrade de hardware sem medição é chute. O r2d2 tem 2 núcleos e 13 GB visíveis; cada serviço
novo precisa caber no orçamento de [`docs/capacidade.md`](../capacidade.md).

**Como está no r2d2.** [`host/scripts/baseline.sh`](../../host/scripts/baseline.sh), com saídas em `docs/evidencias/`.

**O que descobrimos medindo.**
- 16 GB instalados, **13 GB visíveis**: a placa de vídeo integrada reserva o resto (ajuste na BIOS: *UMA Frame Buffer*).
- Memória a 2400 MT/s, quando o processador suporta 2667.
- O SSD é um Kingston A400 sem cache DRAM, e não o modelo que estava anotado.

---

## Teste-se

1. Por que a chave privada nunca sai do Mac, e o que o servidor guarda no lugar dela?
2. O que significa o prefixo `10-` no nome do arquivo de configuração do SSH?
3. O serviço `ufw` estava ativo e mesmo assim nada era bloqueado. Como isso é possível?
4. Por que o IPv6 tornou o firewall indispensável?
5. O que aconteceria se você ativasse a regra "SSH só da LAN IPv4" enquanto conectado por IPv6?
6. Por que o reboot automático ficou desligado?
7. Como você descobriria se um pacote recém-instalado abriu uma porta?
8. Por que o servidor mostra 13 GB se tem 16 GB instalados?
