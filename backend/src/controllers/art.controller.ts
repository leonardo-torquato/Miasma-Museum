import { Request, Response } from 'express';
import { redisService } from '../services/redis.service';
import { museumService } from '../services/museum.service';

export const getArts = async (req: Request, res: Response): Promise<void> => {
    try {
        // Permite customizar a quantidade de obras via query param (ex: /api/artes?limit=15)
        const limit = parseInt(req.query.limit as string) || 10;
        const cacheKey = `artworks_limit_${limit}`;

        // 1. Tenta buscar no Cache (Redis)
        const cachedData = await redisService.get(cacheKey);

        if (cachedData) {
            console.log(`🟢 [Art Controller] Cache HIT para a chave: ${cacheKey}`);
            res.status(200).json(JSON.parse(cachedData));
            return;
        }

        console.log(`🟡 [Art Controller] Cache MISS para a chave: ${cacheKey}. Buscando na API externa...`);

        // 2. Busca na API Externa (Art Institute of Chicago)
        const artworks = await museumService.fetchArts(limit);

        // 3. Salva no Cache para requisições futuras (TTL de 1 hora = 3600 segundos)
        await redisService.set(cacheKey, JSON.stringify(artworks), 3600);

        // 4. Retorna os dados padronizados ao cliente (Vite/Three.js)
        res.status(200).json(artworks);
    } catch (error) {
        console.error('🔴 [Art Controller] Erro ao buscar obras de arte:', error);
        res.status(500).json({ error: 'Erro interno ao processar requisição de obras de arte.' });
    }
};