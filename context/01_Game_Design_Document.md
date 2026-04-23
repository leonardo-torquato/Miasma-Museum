# Game Design Document (GDD) - Jogo da HQ Indie

## 1. Premissa e Conceito
Um jogo web em primeira pessoa projetado para ser leve, imersivo e atuar como um funil interativo para o e-commerce de uma revista em quadrinhos independente. O jogador explora um museu de arte que, gradativamente, se transforma em um pesadelo "não-euclidiano", culminando na revelação da identidade visual da HQ.

## 2. Estética e Atmosfera
* **Visual:** "Retro 3D" ou "PSX Horror". Uso de modelos *low-poly*, texturas pixeladas e névoa volumétrica densa para mascarar o carregamento e induzir o "vale da estranheza".
* **Áudio:** Foco intenso no design de som espacial. Passos ecoando, zumbidos ambientes de baixa frequência e alterações de áudio dependendo da direção do olhar do jogador.

## 3. Mecânicas Principais
* **Movimentação:** Controles padrão de PC (WASD + Mouse/PointerLock) para visão em primeira pessoa.
* **O Labirinto Dinâmico (Looping Espacial):** O mapa não é estático. Conforme o jogador entra em corredores sem saída e é forçado a desviar o olhar ou virar para trás, o motor do jogo substitui os segmentos de corredor fora de sua visão. Os corredores se alongam, encolhem ou mudam completamente, criando desorientação intencional.
* **O Sensor de Miasma:** Uma mecânica de radar/proximidade. O jogador percebe indicações audiovisuais (ex: zumbido ou distorção visual na tela) que indicam a direção correta ou a aproximação da "fonte" da anomalia.

## 4. Progressão e Funil
* **Fase 1 (Realidade):** Corredores limpos de museu. Quadros exibem obras de arte clássicas consumidas de uma API pública real.
* **Fase 2 (Transição):** A anomalia se instala. Corredores quebram as leis da física. As pinturas clássicas começam a falhar ou serem substituídas por *sprites*, painéis e artes conceituais da revista em quadrinhos.
* **Fase 3 (Clímax/Call to Action):** O jogador encontra a fonte do Miasma: um ícone flutuante da HQ. Ao interagir, o jogo é concluído com uma mensagem de congratulação e exibe o botão/link para a plataforma da revista.