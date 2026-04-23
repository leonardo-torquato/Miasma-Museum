# Arquitetura e Tech Stack

## 1. Estrutura Geral
O projeto é um sistema web escalável estruturado como um **Monorepo** e orquestrado inteiramente via **Docker Compose**. O isolamento de serviços garante que o motor 3D no cliente não sofra gargalos de requisições externas.

## 2. Stack Tecnológica
* **Frontend (Motor do Jogo):** Vite + TypeScript + Three.js
    * *Justificativa:* O Three.js fornece renderização 3D nativa no navegador de forma extremamente leve, dispensando exportações pesadas de motores como Unity. O TypeScript garante a segurança na tipagem dos dados recebidos do backend.
* **Backend (Proxy de Dados):** Node.js + Express + TypeScript
    * *Justificativa:* Atua como um "Meio de Campo". Impede que o frontend faça chamadas diretas a APIs públicas, evitando erros de CORS, lentidão de rede no cliente e exposição de chaves de API.
* **Camada de Cache:** Redis
    * *Justificativa:* Armazena temporariamente (em memória) as listas de URLs e metadados das obras de arte consumidas da API do museu. Garante tempo de resposta na casa dos milissegundos para o motor do jogo e evita bloqueios por limite de requisições (*Rate Limiting*) das APIs públicas.
* **Servidor Web e Roteamento:** Nginx
    * *Justificativa:* Lida com o roteamento reverso em produção. O Nginx escuta a porta 80, serve os arquivos estáticos pesados (texturas, áudios e bundle do Vite) diretamente e roteia qualquer requisição `/api/*` para o container do Node.js.

## 3. Padrão de Comunicação (Fluxo de Dados)
1.  Jogo (Three.js) faz requisição GET para a rota local `localhost/api/artes`.
2.  Nginx intercepta e roteia para o container Backend (Node.js).
3.  Backend consulta o Redis.
4.  Se `HIT` (dados existem), retorna imediatamente ao jogo.
5.  Se `MISS` (dados não existem), Backend consome a API do Museu, padroniza o JSON, salva no Redis e retorna ao jogo.