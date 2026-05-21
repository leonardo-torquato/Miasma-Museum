import express from 'express';
import artRoutes   from './routes/art.routes';
import imageRoutes from './routes/image.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Proxy de metadados: retorna JSON com lista de obras
app.use('/api/artes', artRoutes);

// Proxy de imagens: busca JPEG no ARTIC IIIF e repassa ao cliente (evita CORS)
app.use('/api/imagens', imageRoutes);

app.listen(PORT, () => {
  console.log(`[Serviço de Artes] Rodando na porta ${PORT}`);
});