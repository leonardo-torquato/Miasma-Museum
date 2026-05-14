# Roadmap e Próximos Passos

## 1. O Que Já Foi Concluído
* [x] **Arquitetura Base:** Monorepo definido e orquestração configurada via `docker-compose.yml` abrangendo Nginx, Frontend, Backend e Redis.
* [x] **Esqueleto do Backend:** Ponto de entrada (`server.ts`), estrutura de rotas e o controlador básico de obras de arte (`art.controller.ts`) criados.
* [x] **Mock de Dados:** Controlador do backend configurado para retornar dados estáticos falsos para garantir que o contêiner de roteamento responda sem quebrar.
* [x] **Configuração de segurança e versionamento base:** criação do `.gitignore` mapeando as necessidades do monorepo.
* [x] **Infraestrutura de Backend e Dados Concluída:** Configuração de package.json, Dockerfile, criação do serviço de cache (Redis), serviço de consumo da API externa do Museu e integração da lógica de Cache HIT/MISS no `art.controller.ts`.
* [x] **Motor Three.js Inicializado:** Inicialização do Three.js no `frontend/src/main.ts` com Cena, Câmera em Primeira Pessoa e WebGLRenderer configurados.
* [x] **Controles do Jogador:** Implementação dos controles de primeira pessoa (`PointerLockControls`) e captura de teclas WASD para movimentação.
* [x] **Classe do Corredor:** Construção da classe básica "Corredor" em `frontend/src/entities/` com piso, teto e paredes laterais onde os quadros serão afixados.
* [x] **Serviço de Consumo de API:** Criação do serviço em `frontend/src/api/` para requisições assíncronas ao backend com tipagem em TypeScript.

## 2. A Fazer (Em Andamento)
O foco atual deve permanecer em validar a infraestrutura básica e preparar o motor 3D, iterando de forma atômica, uma tarefa por vez.

**Frente de Direção de Arte e Interação**
* `[x]` Criar e aplicar texturas estilo PSX (baixa resolução, pixeladas) nas superfícies do `Corridor.ts`.
* `[x]` Implementar iluminação orgânica no teto do museu e gerar texturas procedurais com NearestFilter para estética PSX em Corridor.ts.
* `[ ]` Criar a entidade do "Quadro" (ArtPiece) no Three.js e anexar dinamicamente os dados recebidos pelo `ArtService`.
* `[ ]` Implementar Raycaster para detectar quando o jogador está olhando para uma obra de arte e exibir seus detalhes na UI.

## 3. Fila de Refinamento (Futuro)
* [ ] Implementação da mecânica do "Labirinto Não-Euclidiano" (Culling matemático e carregamento dinâmico de corredores baseados no vetor de visão da câmera).
* [ ] Implementação de Shaders para o "Miasma" (pós-processamento visual para tensão).
* [ ] Implementação da Web Audio API para som espacial e passos.
* [ ] Transição progressiva das texturas e sprites para a identidade visual da HQ.