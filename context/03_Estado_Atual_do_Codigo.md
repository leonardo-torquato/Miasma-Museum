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
│       │   ├── art.controller.ts   # Lógica de obras de arte (Cache HIT/MISS + graceful degradation)
│       │   └── image.controller.ts # Proxy genérico de imagens externas (anti-CORS)
│       ├── /routes                 # Definição de rotas
│       │   ├── art.routes.ts       # Rota GET /api/artes
│       │   └── image.routes.ts     # Rota GET /api/imagens?src=<url>
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
    * *Definições:* Instancia o Express, aplica `express.json()`, registra `/api/artes` (artRoutes) e `/api/imagens` (imageRoutes). Listener na porta definida pelo ambiente (ou 3000).

* **`backend/src/routes/art.routes.ts`**
    * *Responsabilidade:* Roteamento específico do domínio de obras de arte.
    * *Exportações:* Exporta o objeto `Router` do Express.
    * *Definições:* Registra um único endpoint GET no caminho base (`/`), apontando para o método `getArts` do controller.

* **`backend/src/controllers/art.controller.ts`**
    * *Responsabilidade:* Lógica de controle de requisições de obras de arte.
    * *Definições:* Fluxo Cache HIT/MISS com Redis (`arts_cache_v3`). Fallback com 4 imagens Unsplash roteadas pelo proxy interno (`/api/imagens?src=...`) para evitar CORS mesmo no fallback. Retorna sempre HTTP 200 (graceful degradation) para não quebrar o motor 3D.

* **`backend/src/controllers/image.controller.ts`**
    * *Responsabilidade:* Proxy genérico de imagens externas.
    * *Definições:* Aceita `GET /api/imagens?src=<url-encoded>`. Faz a requisição server-to-server ao servidor externo com headers `User-Agent` e `Accept` adequados, retorna o JPEG com `Cache-Control: public, max-age=86400`. Elimina restrições de CORS no browser para qualquer URL de imagem.

* **`backend/src/routes/image.routes.ts`**
    * *Responsabilidade:* Definição da rota do proxy de imagens.
    * *Definições:* Registra `GET /` (montada em `/api/imagens`) apontando para `getImage`.

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
    * *Responsabilidade:* Consumir a API pública do Metropolitan Museum of Art.
    * *Definições:* API migrada de ARTIC para Met (ARTIC exige pagamento por imagens — 402). Fluxo em 2 etapas: (1) `GET /objects?departmentIds=11&isPublicDomain=true` retorna 2644 IDs de Pinturas Europeias; (2) `randomSample(IDs, limit*2)` seguido de `Promise.allSettled` para buscar objetos em paralelo. Filtra por `isPublicDomain && primaryImageSmall`. `imageUrl` retorna `/api/imagens?src=<url-encoded>` (passa pelo proxy interno). `width/height` são placeholders 843×843 — proporção real lida de `texture.image.naturalWidth/Height` no `Frame.ts`.

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
    * *Definições:* Contém a classe `GameEngine` responsável por inicializar a arquitetura do Three.js (Cena, Câmera, Renderer, Fog, PlayerControls). Instancia `ArtPool`, chama `initialize()` para carregar o primeiro lote e passa `artPool.acquire(20)` para `corridor.populateWalls()`. A iluminação ambiente e de teto é gerenciada pela própria entidade `Corridor`.

* **`frontend/src/controls/PlayerControls.ts`** 
    * *Responsabilidade:* Responsável por encapsular a lógica de movimentação em primeira pessoa (WASD) e bloqueio de cursor (PointerLockControls).
    * *Definições:* Gerencia a física de inércia e velocidade de forma independente de framerate utilizando tempo delta.

* **`frontend/src/entities/Corridor.ts`** 
    * *Responsabilidade:* Define a classe base do corredor do museu, construindo piso, teto, paredes e quadros.
    * *Definições:* Gera procedimentalmente texturas PSX (64x64, NearestFilter). Instancia lâmpadas de teto (PointLight + BoxGeometry). Método `populateWalls(arts)` substitui o antigo `addArtPieces`: divide as obras entre parede esquerda e direita, calcula o layout via `computeSalonLayout` (Rejection Sampling com AABB), depois carrega as texturas em paralelo via `Promise.all` (fire-and-forget). Interface interna `FrameLayout` descreve posição e dimensões pré-computadas de cada quadro no plano 2D da parede (`u` = eixo Z do corredor, `v` = altura Y).

* **`frontend/src/entities/Frame.ts`**
    * *Responsabilidade:* Representa um quadro físico na parede do museu.
    * *Definições:* Factory assíncrona estática `Frame.create(art, maxSize)` carrega a textura e monta o mesh 3D. `Frame.computeDimensions(art, maxSize)` é síncrono e estático — permite que `Corridor` calcule o layout AABB antes do carregamento das texturas. Formas disponíveis: retângulo (~86%) e oval (~14%), escolhidas deterministicamente pelo hash do ID da obra. Falha silenciosa: quadro escuro em caso de erro de rede. Expõe `mesh.userData` (`isArt`, `id`, `title`) para o futuro Raycaster.

* **`frontend/src/api/ArtService.ts`** 
    * *Responsabilidade:* Pool de obras de arte do jogo — gerencia distribuição sem repetição entre corredores.
    * *Definições:* Exporta a classe `ArtPool` e a interface `ArtPiece` (`{ id, title, imageUrl, width, height }`). `ArtPool` implementa fila FIFO (`pool: ArtPiece[]`), `Set` de IDs consumidos para garantir unicidade entre corredores, e recarga em background (batch prefetching) quando o pool cai abaixo de 8 obras. Método `initialize()` carrega o primeiro lote. Método `acquire(count)` retira obras da fila e as consome.

* **Pastas e Arquivos Estruturais Pendentes:**