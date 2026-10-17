# Runbook — Fase 1: bootstrap do r2d2

Objetivo: servidor headless, acessível só por chave SSH, com firewall e atualizações de segurança automáticas,
e uma medição de base (baseline) commitada.

## 0. Antes de formatar: inventário do que existe

Se o PC já tem um sistema instalado, olhe o que há nele antes de apagar (no próprio PC, com monitor e teclado):

```bash
lsb_release -ds; systemctl get-default          # versão e se tem GUI (graphical.target)
df -h /; du -sh /home/* 2>/dev/null
docker ps -a; ollama list 2>/dev/null
ls ~/                                           # algo que não dá pra baixar de novo? copie pro Mac
```

Modelos do Ollama e imagens Docker se baixam de novo, não precisa salvar. Arquivos seus, sim.

## 1. BIOS (Biostar A320MH)

- **Restore on AC Power Loss → Power On**: o servidor volta sozinho depois de uma queda de luz.
- Boot pelo pendrive (F9 abre o menu de boot na Biostar).
- Se a BIOS tiver a opção, reserve só 512 MB pra iGPU (UMA Frame Buffer): sobra RAM pro sistema.

## 2. Pendrive do instalador (no Mac)

```bash
# ISO: https://ubuntu.com/download/server  → ubuntu-24.04.x-live-server-amd64.iso
shasum -a 256 ~/Downloads/ubuntu-24.04*-live-server-amd64.iso   # compare com SHA256SUMS do site
diskutil list                        # descubra o pendrive (ex.: /dev/disk4). CUIDADO pra não errar o disco.
diskutil unmountDisk /dev/diskN
sudo dd if=~/Downloads/ubuntu-24.04.x-live-server-amd64.iso of=/dev/rdiskN bs=4m status=progress
diskutil eject /dev/diskN
```

## 3. Instalação: escolhas no instalador

| Tela | Escolha | Por quê |
|---|---|---|
| Tipo | Ubuntu Server (**não** o "minimized") | o minimized não traz ferramentas básicas de diagnóstico |
| Rede | DHCP por enquanto | o IP fixo vem por reserva no roteador (passo 5) |
| Disco | Use entire disk + **Set up as LVM group**, sem criptografia | sem LUKS: servidor headless precisa voltar sozinho após reboot |
| Tamanho do `ubuntu-lv` | deixe o padrão (~100 GB) | o resto fica livre no VG (ver ADR 0001) |
| Perfil | hostname `r2d2`, usuário `duzera` | |
| SSH | **Install OpenSSH server**; "Import SSH key" do GitHub se a `id_pessoal.pub` estiver lá | |
| Snaps | nenhum | Docker vem do repositório oficial na Fase 2 |

## 4. Primeiro boot (no console do PC)

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y vim curl git htop btop iotop sysstat ncdu net-tools ufw unattended-upgrades
sudo timedatectl set-timezone America/Sao_Paulo
timedatectl                       # "System clock synchronized: yes"
ip -br a                          # anote o IP e o MAC da placa de rede (enp...)
```

## 5. IP fixo (roteador Vivo)

Em `http://192.168.15.1` → Rede local / DHCP → reserva de endereço: MAC do r2d2 → **192.168.15.20**
(fora da faixa onde o DHCP costuma distribuir). Depois `sudo reboot` e confirme com `ip -br a`.

**Por que reserva e não netplan estático:** um lugar só pra configurar, e o servidor continua funcionando se você trocar de roteador.

## 6. SSH a partir do Mac

```bash
# ~/.ssh/config no Mac: atualize o Host existente
Host r2d2 llm-pc
    HostName r2d2.local
    User duzera
    IdentityFile ~/.ssh/id_pessoal
    IdentitiesOnly yes

ssh-copy-id -i ~/.ssh/id_pessoal.pub r2d2     # pede a senha UMA última vez
ssh r2d2 'echo ok'                            # sem pedir senha = chave funcionando
```

Hardening (do Mac, a partir da raiz deste repo):

```bash
scp host/ssh/10-hardening.conf r2d2:/tmp/
ssh -t r2d2 'sudo install -m 644 /tmp/10-hardening.conf /etc/ssh/sshd_config.d/ && sudo sshd -t && sudo systemctl restart ssh'
```

> **Mantenha uma sessão SSH aberta** enquanto testa. Se errar o sshd, você ainda tem por onde corrigir.

Testes:

```bash
ssh r2d2 'echo ok'                                                  # tem que funcionar
ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password r2d2   # tem que dar "Permission denied (publickey)"
ssh -t r2d2 'sudo sshd -T | grep -E "^(passwordauth|permitroot|kbdinteractive)"'
```

## 7. Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 192.168.15.0/24 to any port 22 proto tcp comment 'ssh LAN'
sudo ufw allow in on tailscale0 comment 'tailnet'     # só se usar Tailscale
sudo ufw enable
sudo ufw status verbose
```

Atenção pra Fase 2: **o Docker ignora o ufw nas portas publicadas** (`-p 8080:80` fica aberta mesmo com `deny`).
Vamos tratar isso publicando em `127.0.0.1` e/ou usando a chain `DOCKER-USER`.

## 8. Atualizações automáticas de segurança

```bash
sudo dpkg-reconfigure -plow unattended-upgrades       # responder Yes
systemctl status unattended-upgrades --no-pager
sudo unattended-upgrade --dry-run --debug 2>&1 | tail -5
```

Reboot automático fica **desligado** por enquanto. Kernel novo = reboot manual e consciente (`cat /var/run/reboot-required`).

## 9. Acesso remoto (opcional): Tailscale

O pacote já esteve instalado nesse PC. Numa instalação limpa:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh=false
```

No Mac, faça login no app do Tailscale. **Nunca** abra a porta 22 no roteador.

## 10. Baseline

```bash
# no Mac, raiz do repo
ssh r2d2 'bash -s' < host/scripts/baseline.sh > docs/evidencias/baseline-fase1-$(date +%F).txt
```

Preencha a coluna "Medido" de `docs/capacidade.md` com o idle do sistema.

## Critério de pronto (Definition of Done)

- [ ] `ssh r2d2` entra sem senha; login por senha é recusado; login de root é recusado
- [ ] `ufw status` mostra só a 22/tcp liberada pra LAN (+ tailscale0)
- [ ] `unattended-upgrades` ativo
- [ ] IP fixo: após `sudo reboot`, o `ssh r2d2` volta a funcionar sem mexer em nada
- [ ] (bônus) tirar da tomada e religar: o PC liga sozinho e o SSH volta
- [ ] baseline commitado e `capacidade.md` atualizado
- [ ] repo publicado no GitHub (`eduardonk9999/homelab`)

## 11. Faxina de pacotes do desktop (feito em 2026-10-17)

O sistema veio de uma instalação desktop. Serviços sem função num servidor aumentam a superfície de ataque
(o `cups-browsed` teve falha crítica de execução remota em 2024, CVE-2024-47176).

```bash
sudo apt purge -y cups cups-browsed modemmanager && sudo apt autoremove -y
```

**Pegadinha:** os drivers de impressora (`hplip`, `printer-driver-*`, `bluez-cups`) dependem de "algum cups",
e o apt instalou o `legacy-printer-app` no lugar, com a porta **8000 aberta em 0.0.0.0**. Antes de remover o resto,
proteja o gerenciador de rede, que estava marcado como automático (um `autoremove` futuro derrubaria o Wi-Fi):

```bash
sudo apt-mark manual network-manager
sudo apt purge -y legacy-printer-app hplip printer-driver-splix printer-driver-hpcups bluez-cups
sudo apt autoremove        # sem -y: ler a lista antes de confirmar
```

Verificação: `ss -tln` sem a porta 8000; `apt-mark showmanual network-manager` retorna o pacote.
