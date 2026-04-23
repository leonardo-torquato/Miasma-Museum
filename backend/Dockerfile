# Usa uma imagem oficial e leve do Node.js (versão 18+)
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de definição de dependências primeiro
# (Isso otimiza o cache de build do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta 3000, conforme definido na nossa arquitetura
EXPOSE 3000

# Comando padrão de inicialização
CMD ["npm", "run", "dev"]