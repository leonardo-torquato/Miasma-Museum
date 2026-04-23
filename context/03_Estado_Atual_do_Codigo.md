# Estado Atual do Código (Dossiê da Aplicação)

## 1. Árvore de Diretórios Atual
```text
/mi_sm_
├── docker-compose.yml              # Orquestração dos 4 serviços (nginx, frontend, backend, cache)
├── README.MD                       # Documentação principal
│
├── /backend                        # API Gateway (Node.js + Express)
│   ├── Dockerfile                  # (Vazio) Dockerfile do backend
│   ├── package.json                # (Vazio) package.json do backend
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
│       ├── main.ts                 # (Vazio) Ponto de entrada do jogo
│       ├── /api                    # (Vazio) Funções para consumir nosso Backend (não a API pública)
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
    * *Responsabilidade:* Lógica de controle de requisições de obras de arte.
    * *Métodos:* `getArts(req, res)` - Uma função assíncrona.
    * *Estado Atual:* Atualmente, não se conecta ao Redis nem à API externa. Possui uma implementação *Mock* (dados falsos) que retorna um array fixo de objetos (`{ id, title, imageUrl }`) e um status `200` para validar se a comunicação Nginx -> Backend está operante. Contém um bloco `try/catch` para tratamento de erros genéricos (retornando `500`).

* **`backend/src/services/redis.service.ts:`** 
    * *Responsabilidade:* Gerenciar a conexão com o banco de dados Redis em memória utilizando o padrão Singleton. 
    * *Métodos:* Possui métodos encapsulados de leitura (get) e escrita com tempo de expiração (set), e método de conexão (connect) garantindo a resiliência do cache do servidor.

* **`backend/package.json`**
    * *Responsabilidade:* Declarar dependências, devDependencies e scripts do backend.
    * *Definições:* Lista dependências como `express` e `ioredis`, inclui pacotes de tipagem TypeScript (ex.: `@types/express`) e scripts de inicialização/teste para facilitar o desenvolvimento e evitar erros de linting no editor.

* **`backend/Dockerfile`**
    * *Responsabilidade:* Definir a imagem Docker e o processo de build do backend.
    * *Definições:* Base recomendada `node:18-alpine`; define diretório de trabalho, copia o código, instala dependências, expõe a porta da aplicação e configura o comando de inicialização do container.

## 3. Dossiê de Arquivos (Frontend & Infraestrutura)

* **`nginx/default.conf`**
    * *Responsabilidade:* Proxy Reverso.
    * *Definições:* Intercepta requisições. O que cai na raiz (`/`) é servido pelo container do frontend. O que cai em `/api` é redirecionado para o container do backend.
    * *Estado Atual:* Vazio.

* **Pastas e Arquivos Estruturais Pendentes:**
    * `frontend/src/main.ts`: Ponto de entrada do Vite. Atualmente em branco, aguardando a instanciação da cena, câmera e renderizador do Three.js.  