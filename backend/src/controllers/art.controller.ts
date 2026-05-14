import { Request, Response } from 'express';
import redisService from '../services/redis.service';
import { museumService } from '../services/museum.service';

export const getArts = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Tenta buscar do Cache (Redis)
        // v2: chave atualizada para invalidar cache antigo sem campo de dimensões
        const cachedArts = await redisService.get('arts_cache_v2');
        if (cachedArts) {
            res.status(200).json(JSON.parse(cachedArts));
            return;
        }

        // 2. Se Cache MISS, tenta buscar da API externa do Museu
        const arts = await museumService.fetchArts();

        // 3. Salva no Cache para as próximas requisições
        await redisService.set('arts_cache_v2', JSON.stringify(arts), 3600);

        res.status(200).json(arts);
    } catch (error) {
        // O erro real é logado no terminal do Docker para debug futuro
        console.error('[ArtController] Falha crítica na fonte de dados. Ativando Graceful Degradation.', error);
        
        // Em vez de retornar res.status(500), retornamos o Fallback Estético
        // Usamos imagens abstratas livres que se encaixam na vibe PSX Horror
        const fallbackArts = [
            { id: 'f1', title: 'Desconexão',  imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&q=80', width: 512, height: 512 },
            { id: 'f2', title: 'Ruído Branco', imageUrl: 'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?w=512&q=80', width: 512, height: 341 },
            { id: 'f3', title: 'O Vazio',      imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=512&q=80', width: 512, height: 512 },
            { id: 'f4', title: 'Fragmento',    imageUrl: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=512&q=80', width: 512, height: 768 }
        ];
        
        // Retorna 200 OK com as obras amaldiçoadas para NÃO quebrar o motor 3D
        res.status(200).json(fallbackArts);
    }
};