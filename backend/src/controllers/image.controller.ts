// backend/src/controllers/image.controller.ts
import { Request, Response } from 'express';

/**
 * Proxy genérico de imagens externas.
 *
 * Recebe a URL de destino como query param `src` (URL-encoded) e a busca
 * server-side, eliminando restrições de CORS no browser.
 *
 * Rota: GET /api/imagens?src=<url-encoded>
 * Exemplo: /api/imagens?src=https%3A%2F%2Fimages.metmuseum.org%2F...
 */
export const getImage = async (req: Request, res: Response): Promise<void> => {
    const src = req.query.src as string;

    if (!src) {
        res.status(400).send('Parâmetro obrigatório ausente: src');
        return;
    }

    let imageUrl: string;
    try {
        imageUrl = decodeURIComponent(src);
    } catch {
        res.status(400).send('Parâmetro src inválido.');
        return;
    }

    try {
        const upstream = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MiasmaMuseum/1.0)',
                'Accept':     'image/jpeg,image/*,*/*',
            },
        });

        if (!upstream.ok) {
            res.status(upstream.status).send('Imagem não encontrada no servidor externo.');
            return;
        }

        const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
        const buffer      = await upstream.arrayBuffer();

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h no browser
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error(`[Image Proxy] Falha ao buscar: ${imageUrl}`, error);
        res.status(502).send('Falha ao recuperar a imagem do servidor externo.');
    }
};
