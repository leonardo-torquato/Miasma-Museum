// backend/src/services/museum.service.ts

export interface ArtWork {
    id: string;
    title: string;
    imageUrl: string; // URL relativa ao nosso proxy (/api/imagens?src=...)
    width: number;    // placeholder — proporção real lida da textura no frontend
    height: number;
}

class MuseumService {
    // API aberta do Metropolitan Museum of Art — sem autenticação, sem paywall
    private readonly MET_OBJECTS_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
    private readonly MET_OBJECT_URL  = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';

    /**
     * Busca obras de arte do Metropolitan Museum of Art.
     *
     * Fluxo em duas etapas:
     *  1. Busca a lista de IDs do departamento de Pinturas Europeias (2644 obras).
     *  2. Sorteia aleatoriamente e busca objetos em paralelo (Promise.allSettled).
     *
     * Por que Met em vez de ARTIC?
     * O servidor IIIF do ARTIC passou a exigir pagamento (402 Payment Required)
     * para acesso a imagens. O Met oferece acesso irrestrito às suas imagens.
     *
     * @param limit Quantidade de obras a retornar.
     */
    public async fetchArts(limit: number = 30): Promise<ArtWork[]> {
        // ── Etapa 1: obter lista de IDs ──────────────────────────────────────
        // departmentIds=11 = Pinturas Europeias (óleo sobre tela, retratos, paisagens)
        // isPublicDomain=true = sem restrição de direitos autorais
        const listUrl = `${this.MET_OBJECTS_URL}?departmentIds=11&isPublicDomain=true`;

        console.log(`[Museum Service] Buscando lista de obras no Met Museum...`);
        const listResponse = await fetch(listUrl);

        if (!listResponse.ok) {
            throw new Error(`Erro na API do Met: ${listResponse.status} - ${listResponse.statusText}`);
        }

        const { objectIDs } = await listResponse.json() as { total: number; objectIDs: number[] };

        // ── Etapa 2: sortear e buscar objetos em paralelo ────────────────────
        // Buscamos limit*2 para ter margem caso algum objeto não tenha imagem
        const sample = this.randomSample(objectIDs, limit * 2);

        console.log(`[Museum Service] Buscando ${sample.length} objetos em paralelo...`);

        const fetches = sample.map(id =>
            fetch(`${this.MET_OBJECT_URL}/${id}`).then(r => r.json())
        );

        const results = await Promise.allSettled(fetches);

        // ── Etapa 3: filtrar e formatar ──────────────────────────────────────
        const artworks: ArtWork[] = results
            .filter((r): r is PromiseFulfilledResult<any> =>
                r.status === 'fulfilled' &&
                r.value.isPublicDomain === true &&
                typeof r.value.primaryImageSmall === 'string' &&
                r.value.primaryImageSmall.length > 0
            )
            .slice(0, limit)
            .map(r => ({
                id:       String(r.value.objectID),
                title:    r.value.title || 'Obra sem título',
                // Roteamos a imagem pelo nosso proxy para evitar CORS no frontend
                imageUrl: `/api/imagens?src=${encodeURIComponent(r.value.primaryImageSmall)}`,
                width:    843,
                height:   843,
            }));

        console.log(`🖼️ [Museum Service] ${artworks.length} obras recuperadas do Met Museum.`);
        return artworks;
    }

    /** Retorna `n` elementos aleatórios de um array sem repetição. */
    private randomSample<T>(arr: T[], n: number): T[] {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(0, n);
    }
}

export const museumService = new MuseumService();
