# Game Design Document (GDD) - Jogo da HQ Indie

## 1. Premissa e Conceito
Um jogo web em primeira pessoa projetado para ser leve, imersivo e atuar como um funil interativo para o e-commerce de uma revista em quadrinhos independente. O jogador explora um museu de arte que, gradativamente, se transforma em um pesadelo "não-euclidiano", culminando na revelação da identidade visual da HQ.

## 2. Estética e Atmosfera
* **Visual:** "Retro 3D" ou "PSX Horror". Uso de modelos *low-poly*, texturas pixeladas e névoa volumétrica densa para mascarar o carregamento e induzir o "vale da estranheza".
* **Atmosfera:** Iluminação baixa e dinâmica, dependendo das fontes de luz do museu, como os candelabros no teto e a luzes auxiliares em cada quadro. O ambiente deve ser enevoado, passando estranheza e o desconhecido para o usuário.
* **Áudio:** Foco intenso no design de som espacial. Respiração ofegante, passos ecoando, zumbidos ambientes de baixa frequência e alterações de áudio dependendo da direção do olhar do jogador. Além disso música idle (como um loop de música clássica).

## 3. Mecânicas Principais
* **Movimentação:** Controles padrão de PC (WASD + Mouse/PointerLock) para visão em primeira pessoa.
* **O Labirinto Dinâmico (Looping Espacial):** O mapa não é estático. Conforme o jogador entra em corredores sem saída e é forçado a desviar o olhar ou virar para trás, o motor do jogo substitui os segmentos de corredor fora de sua visão. Os corredores se alongam, encolhem ou mudam completamente, criando desorientação intencional. Perto do final do jogo (transição) até a música idle, textura das paredes, do chão e das decorações jogadas pelo mapa vão sendo gradativamente substiuídas por "versões distorcidas" e sinsistras delas.
* **O Sensor de Miasma:** Uma mecânica de radar/proximidade. O jogador percebe indicações audiovisuais (ex: zumbido de contador geiger ou distorção visual na tela) que indicam a direção correta ou a aproximação da "fonte" da anomalia.

## 4. Progressão e Funil
* **Fase 1 (Realidade):** Corredores limpos de museu, música suave tocando no fundo. Quadros exibem obras de arte clássicas consumidas de uma API pública real. O jogador perambula por alguns corredores até encontrar um item numa cupula junto de uma parede, o item "entra no inventário" do usuário, e ele começa a detectar a anomalia (miasma) que vai impulsioná-lo a continuar o jogo.
* **Fase 2 (Transição):** A anomalia se instala. O jogador começa a tentar encontrar a fonte do sinal "Miasma". Os corredores quebram cada vez mais as leis da física. As pinturas clássicas começam a falhar ou serem substituídas por *sprites*, painéis e artes conceituais da revista em quadrinhos. A textura das paredes e do chão começa a transcionar para uma versão sombria de si mesma, com os *sprites* sendo substituídos também. Quanto mais perto o jogador consegue chegar da fonte do sinal, mais os objetos que compoem o cenário ficarão transicionados com o *sprites* sombrios.
* **Fase 3 (Clímax/Call to Action):** O jogador encontra um salão central e mais aberto, com a fonte do Miasma: a própria HQ num pedestal. Ao interagir, o jogo é concluído com uma mensagem de congratulação e redireciona o usuário para a plataforma da revista.
