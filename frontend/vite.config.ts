import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Expõe o servidor para a rede do Docker
    host: '0.0.0.0', 
    port: 5173,
    // Configuração do Proxy Reverso de Desenvolvimento
    proxy: {
      '/api': {
        // 'backend' é o exato nome do serviço definido no docker-compose.yml
        // '3000' é a porta interna onde o Node.js está rodando
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});