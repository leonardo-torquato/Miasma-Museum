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
│   ├── Dockerfile                  # (Vazio) Dockerfile do frontend
│   ├── package.json                # (Vazio) package.json do frontend
│   ├── /public                     # (Vazio) Assets estáticos
│   └── /src
│       ├── main.ts                 # Ponto de entrada do jogo
│       ├── /api                    # (Vazio) Funções para consumir nosso Backend (não a API pública)
│       ├── /controls               # Controles de jogo (WASD, PointerLock)
│       │   └── PlayerControls.ts   # Encapsula lógica de movimentação em primeira pessoa
│       ├── /core                   # (Vazio) Lógica matemática do Three.js (Câmera, Render, Controles)
│       └── /entities               # (Vazio) Classes dos objetos (Corredor, Quadros, Sensor de Miasma)
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
    * *Definições:* Contém a classe GameEngine responsável por inicializar a arquitetura do `Three.js`, a Cena, a Câmara e o Renderizador. Agora inclui um THREE.Clock e orquestra a atualização quadro a quadro da classe PlayerControls.

* **`frontend/src/controls/PlayerControls.ts`** 
    * *Responsabilidade:* Responsável por encapsular a lógica de movimentação em primeira pessoa (WASD) e bloqueio de cursor (PointerLockControls).
    * *Definições:* Gerencia a física de inércia e velocidade de forma independente de framerate utilizando tempo delta.

* **Pastas e Arquivos Estruturais Pendentes:**