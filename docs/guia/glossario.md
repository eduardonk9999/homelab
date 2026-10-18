# Glossário

| Termo | Em uma frase |
|---|---|
| **ADR** | *Architecture Decision Record*: documento curto que registra uma decisão técnica, as alternativas e o porquê. |
| **Baseline** | medição de recursos num momento conhecido, usada como referência pra comparar depois. |
| **Bind (IP de bind)** | o endereço em que um serviço escuta; `127.0.0.1` = só a própria máquina, `0.0.0.0` = todas as interfaces. |
| **Capabilities** | "superpoderes" do kernel divididos em partes (abrir porta baixa, mudar dono de arquivo…); `cap_drop: ALL` remove todos. |
| **cgroups** | recurso do kernel que limita CPU e memória de um grupo de processos; é o que faz o limite do container funcionar. |
| **CI/CD** | integração contínua (testar a cada commit) e entrega/deploy contínuo (publicar automaticamente). |
| **Container** | processo isolado do resto do sistema, rodando a partir de uma imagem. |
| **CVE** | identificador público de uma vulnerabilidade conhecida (ex.: CVE-2024-47176). |
| **Defesa em profundidade** | várias camadas de proteção, pra que a falha de uma não comprometa tudo. |
| **Dependabot** | robô do GitHub que abre PRs atualizando dependências. |
| **Digest** | hash (`sha256:…`) que identifica uma imagem exata; muda sempre que o conteúdo muda. |
| **Fingerprint** | impressão digital da chave de um servidor SSH; confirma que você fala com a máquina certa. |
| **GHCR** | GitHub Container Registry, onde ficam as imagens publicadas pelo pipeline. |
| **GitOps** | o estado do sistema fica descrito no Git, e um agente no servidor puxa e aplica esse estado. |
| **Headless** | sem interface gráfica, administrado só por terminal. |
| **Health check** | comando periódico que verifica se a aplicação responde de verdade. |
| **Imagem** | pacote só leitura com a aplicação e suas dependências. |
| **internal (rede Docker)** | rede sem gateway: os containers conversam entre si, mas não saem pra internet nem pra LAN. |
| **Least privilege (menor privilégio)** | dar a cada coisa só as permissões de que ela precisa. |
| **live-restore** | opção do Docker que mantém os containers rodando enquanto o próprio Docker reinicia. |
| **NAT** | tradução de endereços do roteador; em IPv4 "esconde" os dispositivos da casa atrás de um IP só. Não existe em IPv6. |
| **Phased update** | atualização liberada aos poucos pelo Ubuntu, pra detectar pacote quebrado antes de chegar em todos. |
| **Pull vs push (deploy)** | no push, o pipeline entra no servidor; no pull, o servidor busca a versão nova sozinho. |
| **Registry** | servidor que armazena e distribui imagens de container. |
| **Runner** | a máquina que executa os jobs do GitHub Actions. |
| **SHA (pinning)** | fixar uma dependência pelo hash do commit, que não pode ser alterado depois. |
| **Shift-left** | mover as checagens pra mais cedo no processo (no PR), em vez de descobrir em produção. |
| **SSH** | protocolo de acesso remoto ao terminal, criptografado. |
| **Superfície de ataque** | tudo que um atacante pode tentar usar: portas, serviços, programas instalados. |
| **Supply chain** | cadeia de tudo que o seu software usa sem você ter escrito (imagens, actions, bibliotecas). |
| **systemd timer** | o "cron" do systemd: roda um serviço em intervalos definidos. |
| **Túnel SSH** | encaminhamento de uma porta do servidor pra sua máquina, pela conexão SSH. |
| **ufw** | *Uncomplicated Firewall*: interface simples para as regras de firewall do Linux. |
| **WAF** | *Web Application Firewall*: filtro na frente de um site que bloqueia ataques conhecidos (SQLi, XSS…). |
