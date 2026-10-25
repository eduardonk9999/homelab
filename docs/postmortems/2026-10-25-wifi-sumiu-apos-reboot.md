# Postmortem — r2d2 fora da rede após reboot (2026-10-25)

- **Severidade:** total (servidor inacessível; serviços rodando mas sem rede)
- **Duração:** do reboot até a reconexão manual, ~30 min de diagnóstico no console
- **Causa raiz:** remoção acidental do `usb-modeswitch` numa faxina de pacotes em 2026-10-17
- **Formato:** sem culpados; o foco é no processo

## Resumo

Depois de um reboot, o r2d2 sumiu da rede. O SSH dava timeout e nenhum dos MACs conhecidos aparecia na LAN.
O adaptador Wi-Fi USB (Realtek RTL8188GU) ficou preso no modo "CD-ROM de driver" (`0bda:1a2b`), porque o
`usb-modeswitch`, que faz a troca pro modo Wi-Fi no boot, tinha sido removido 8 dias antes por um `apt autoremove -y`.

## Linha do tempo

| Quando | O quê |
|---|---|
| 2026-10-17 | Faxina: `sudo apt purge -y cups cups-browsed modemmanager && sudo apt autoremove -y`. O autoremove levou `usb-modeswitch`, `usb-modeswitch-data` e `tcl` junto. O Wi-Fi seguiu funcionando porque o adaptador já estava trocado desde o boot anterior. |
| 2026-10-17 → 25 | Nenhum reboot. O problema ficou latente. |
| 2026-10-25 | Servidor reiniciado. SSH: timeout. Varredura da LAN: nenhum MAC do r2d2. |
| | Console: `ip -br a` sem nenhuma interface `wlx…`; `lsusb` mostra a Realtek como `(Driver CDROM Mode)`; `dmesg`: `usb-storage 3-2:1.0: device ignored` (o kernel deixa a troca pro usb-modeswitch). |
| | Uma segunda placa (MediaTek MT7612U, a antena de pentest) trocou de modo e apareceu como `wlx8c3d16614917`. Conectada com `nmcli --ask device wifi connect`. SSH de volta. |
| | `apt install usb-modeswitch usb-modeswitch-data` + `apt-mark manual` nos dois. Regras udev conferidas para os dois IDs. |

## O que funcionou bem

- Os containers subiram sozinhos (`restart: unless-stopped`) e estavam `healthy` quando a rede voltou.
- O diagnóstico em camadas (rede → interface → USB → kernel) chegou à causa sem chute.
- `apt-mark manual network-manager` (feito na mesma faxina) evitou um estrago maior.

## O que deu errado

- **`autoremove -y` em servidor.** A lista de remoção não foi lida. O runbook da segunda remoção pedia `autoremove` sem `-y`; o da primeira, não.
- **Nenhum reboot de teste depois de mexer em pacotes.** O defeito ficou escondido 8 dias.
- **Ponto único de falha:** rede só por Wi-Fi USB, com o cabo desconectado.
- **Ninguém foi avisado.** Sem monitoramento, o problema só foi descoberto ao tentar acessar.

## Ações

| Ação | Status |
|---|---|
| Reinstalar `usb-modeswitch` e `usb-modeswitch-data`, marcados como manuais | ✅ feito |
| Regra: `apt autoremove` **sem** `-y` em servidor; ler a lista inteira antes de confirmar | ✅ runbook |
| Reboot de teste depois de qualquer remoção de pacote | ✅ runbook |
| Cabo de rede como caminho principal; Wi-Fi como reserva | ⏳ hardware |
| Devolver a antena MT7612U ao uso de pentest (replug da Realtek antes) | ⏳ |
| Alerta de "host fora do ar" (Blackbox exporter + Alertmanager → Telegram) | ⏳ Fase 6 |
| "Restore on AC Power Loss" na BIOS | ⏳ pendência da Fase 1 |
