# Roadmap e Próximos Passos

## 1. O Que Já Foi Concluído
* [x] **Arquitetura Base:** Monorepo definido e orquestração configurada via `docker-compose.yml` abrangendo Nginx, Frontend, Backend e Redis.
* [x] **Esqueleto do Backend:** Ponto de entrada (`server.ts`), estrutura de rotas e o controlador básico de obras de arte (`art.controller.ts`) criados.
* [x] **Mock de Dados:** Controlador do backend configurado para retornar dados estáticos falsos para garantir que o contêiner de roteamento responda sem quebrar.
* [x] **Configuração de segurança e versionamento base:** criação do `.gitignore` mapeando as necessidades do monorepo.

## 2. A Fazer (Em Andamento)
O foco atual deve permanecer em validar a infraestrutura básica e preparar o motor 3D, iterando de forma atômica, uma tarefa por vez.

**Frente de Backend (Integração de Dados):**
* [x] Criar o serviço de conexão com o Redis (`backend/src/services/redis.service.ts`).
* [x] Popular os arquivos de infraestrutura, package.json e Dockerfile.
* [x] Criar o serviço de consumo da API externa de museu (ex: Met Museum) e tratamento/compressão de dados.
* [x] Atualizar o `art.controller.ts` para substituir o Mock pela lógica real (Cache `HIT` ou Busca `MISS`).

**Frente de Frontend (Motor do Jogo):**
* [ ] Inicializar o Three.js no `frontend/src/main.ts` (Cena, Câmera em Primeira Pessoa, WebGLRenderer).
* [ ] Implementar os controles do jogador (`PointerLockControls` do Three.js e captura de teclas WASD).
* [ ] Construir a classe básica do "Corredor" em `frontend/src/entities/`, definindo piso, teto e paredes laterais onde os quadros serão afixados.
* [ ] Criar o serviço (`frontend/src/api/`) para consumir o mock de dados do nosso backend.

## 3. Fila de Refinamento (Futuro)
* [ ] Implementação da mecânica do "Labirinto Não-Euclidiano" (Culling matemático e carregamento dinâmico de corredores baseados no vetor de visão da câmera).
* [ ] Implementação de Shaders para o "Miasma" (pós-processamento visual para tensão).
* [ ] Implementação da Web Audio API para som espacial e passos.
* [ ] Transição progressiva das texturas e sprites para a identidade visual da HQ.