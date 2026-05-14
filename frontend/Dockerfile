FROM node:18-alpine

WORKDIR /app

# Copia os manifestos de dependência primeiro (otimização de camada de cache do Docker)
COPY package*.json ./

# Instala as dependências (Three.js, Vite, TypeScript)
RUN npm install

# O código fonte será sobrescrito pelo mapeamento de volume no docker-compose (para hot-reload),
# mas copiamos aqui para garantir a estrutura base na imagem.
COPY . .

# Expõe a porta padrão do Vite
EXPOSE 5173

# Executa o servidor de desenvolvimento expondo para a rede interna do Docker
CMD ["npm", "run", "dev"]