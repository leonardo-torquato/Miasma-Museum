import express from 'express';
import artRoutes from './routes/art.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON (útil se precisarmos enviar configurações no body futuramente)
app.use(express.json());

// Registrando a rota principal do nosso proxy
app.use('/api/artes', artRoutes);

app.listen(PORT, () => {
  console.log(`[Serviço de Artes] Rodando na porta ${PORT}`);
});