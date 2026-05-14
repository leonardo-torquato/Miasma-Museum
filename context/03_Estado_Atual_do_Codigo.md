# Estado Atual do Código (Dossiê da Aplicação)

## 1. Árvore de Diretórios Atual
```text
/mi_sm_
├── docker-compose.yml              # Orquestração dos 4 serviços (nginx, frontend, backend, cache)
├── README.MD                       # Documentação principal
├── .gitignore                      # Arquivo de configuração do versionamento
│
├── /backend                        # API Gateway (Node.js + Express)
│   ├── Dockerfile                  # Dockerfile do backend
│   ├── package.json                # package.json do backend
│   └── /src
│       ├── server.ts               # Ponto de entrada (App configurado na porta 3000)
│       ├── /controllers            # Controladores
│       │   └── art.controller.ts   # Lógica (Atualmente com mock de obras de arte)
│       ├── /routes                 # Definição de rotas
│       │   └── art.routes.ts       # Rota configurada (/api/artes)
│       └── /services               # Futura integração com Redis e API do Museu
│           └── redis.service.ts    # [Adicione descrição] 
│
├── /frontend                       # Motor Visual (Vite + Three.js)
│   ├── Dockerfile                  # Dockerfile do frontend
│   ├── package.json                # package.json do frontend
│   ├── /public                     # Assets estáticos
│   └── /src
│       ├── main.ts                 # Ponto de entrada do jogo
│       ├── /api                    # Funções para consumir nosso Backend (não a API pública)
│       │   └── ArtService.ts       # Serviço encapsulado para requisições assíncronas ao backend
│       ├── /controls               # Controles de jogo (WASD, PointerLock)
│       │   └── PlayerControls.ts   # Encapsula lógica de movimentação em primeira pessoa
│       ├── /core                   # (Vazio) Lógica matemática do Three.js (Câmera, Render, Controles)
│       └── /entities               # Classes dos objetos 3D do cenário
│           └── Corridor.ts         # Classe base do corredor do museu (piso, teto, paredes)
│
└── /nginx                          # Servidor Web e Proxy Reverso
    └── default.conf                # (Vazio) Redireciona :80 pro front e /api pro back
```

## 2. Dossiê de Arquivos e Responsabilidades (Backend)

* **`docker-compose.yml`**
    * *Responsabilidade:* Orquestrador principal.
    * *Definições:* Cria 4 serviços isolados (`nginx` exposto na porta 80, `frontend` construindo o Vite localmente, `backend` rodando Node.js na porta 3000 e conectando ao `cache` Redis na porta 6379). Mapeia volumes locais para permitir Hot-Reload no desenvolvimento.

* **`backend/src/server.ts`**
    * *Responsabilidade:* Ponto de entrada do serviço de API.
    * *Importações:* Importa `express` e o roteador de artes (`art.routes.ts`).
    * *Definições:* Instancia o Express, aplica middleware para parseamento de JSON (`express.json()`), registra o prefixo `/api/artes` para as rotas e inicia o listener na porta definida pelo ambiente (ou 3000).

* **`backend/src/routes/art.routes.ts`**
    * *Responsabilidade:* Roteamento específico do domínio de obras de arte.
    * *Exportações:* Exporta o objeto `Router` do Express.
    * *Definições:* Registra um único endpoint GET no caminho base (`/`), apontando para o método `getArts` do controller.

* **`backend/src/controllers/art.controller.ts`**
    * *Responsabilidade:* Responsável pela lógica de controle de requisições de obras de arte.
    * *Definições:* Importa e utiliza `redis.service` e `museum.service`; implementa fluxo de Cache HIT (retorna dados do Redis) e Cache MISS (busca na API externa via `museum.service`, persiste no Redis e retorna os dados). Possui tratamento de erros com retorno de status HTTP 500 em caso de falhas.

* **`backend/src/services/redis.service.ts:`** 
    * *Responsabilidade:* Gerenciar a conexão com o banco de dados Redis em memória utilizando o padrão Singleton. 
    * *Métodos:* Possui métodos encapsulados de leitura (get) e escrita com tempo de expiração (set), e método de conexão (connect) garantindo a resiliência do cache do servidor.

* **`backend/package.json`**
    * *Responsabilidade:* Declarar dependências, devDependencies e scripts do backend.
    * *Definições:* Lista dependências como `express` e `ioredis`, inclui pacotes de tipagem TypeScript (ex.: `@types/express`) e scripts de inicialização/teste para facilitar o desenvolvimento e evitar erros de linting no editor.

* **`backend/Dockerfile`**
    * *Responsabilidade:* Definir a imagem Docker e o processo de build do backend.
    * *Definições:* Base recomendada `node:18-alpine`; define diretório de trabalho, copia o código, instala dependências, expõe a porta da aplicação e configura o comando de inicialização do container.

* **`backend/src/services/museum.service.ts`**
    * *Responsabilidade:* Consumir a API pública do museu (Art Institute of Chicago).
    * *Definições:* Filtra obras de domínio público, aplica formatação/compressão na URL da imagem e retorna um array padronizado de objetos (`{ id, title, imageUrl }`).

* **`backend/src/services/redis.service.ts`**
    * *Responsabilidade:* Gerenciar a conexão com o banco de dados Redis em memória utilizando o padrão Singleton.
    * *Métodos:* Possui métodos encapsulados de leitura (get) e escrita com tempo de expiração (set), e método de conexão (connect) garantindo a resiliência do cache do servidor.

## 3. Dossiê de Arquivos (Frontend & Infraestrutura)

* **`nginx/default.conf`**
    * *Responsabilidade:* Proxy Reverso.
    * *Definições:* Intercepta requisições. O que cai na raiz (`/`) é servido pelo container do frontend. O que cai em `/api` é redirecionado para o container do backend.
    * *Estado Atual:* Vazio.

* **`.gitignore`**
    * *Responsabilidade:* Arquivo de configuração na raiz do monorepo.
    * *Definições:* Evita o versionamento de dependências (`node_modules`), arquivos de build, variáveis de ambiente sensíveis (`.env`) e lixo de sistema/IDE.

* **`frontend/src/main.ts`** 
    * *Responsabilidade:* Ponto de entrada do cliente (Vite). 
    * *Definições:* Ponto de entrada do cliente (Vite). Contém a classe GameEngine responsável por inicializar a arquitetura do Three.js. Agora instancia a entidade Corridor para compor o cenário físico. A responsabilidade da iluminação do ambiente foi transferida para a entidade Corridor, removendo a luz pontual de teste anterior.

* **`frontend/src/controls/PlayerControls.ts`** 
    * *Responsabilidade:* Responsável por encapsular a lógica de movimentação em primeira pessoa (WASD) e bloqueio de cursor (PointerLockControls).
    * *Definições:* Gerencia a física de inércia e velocidade de forma independente de framerate utilizando tempo delta.

* **`frontend/src/entities/Corridor.ts`** 
    * *Responsabilidade:* Define a classe base do corredor do museu, construindo piso, teto e paredes utilizando geometria básica do Three.js e materiais sensíveis a fontes de luz, visando encapsular o espaço físico da cena.
    * *Atualizações:* Gera procedimentalmente texturas de baixa resolução (64x64) com ruído, mapeadas usando THREE.NearestFilter para criar a estética PSX estourada sem uso de assets externos. Também possui lógica própria para instanciar as lâmpadas do teto do museu (PointLight e geometrias básicas).

* **`frontend/src/api/ArtService.ts`** 
    * *Responsabilidade:* Serviço encapsulado responsável por realizar requisições assíncronas via fetch para o nosso próprio backend (/api/artes).
    * *Definições:* Define a interface ArtPiece para tipagem estrita no TypeScript e trata falhas de rede de forma silenciosa para proteger o ciclo de vida do motor 3D.

* **Pastas e Arquivos Estruturais Pendentes:**