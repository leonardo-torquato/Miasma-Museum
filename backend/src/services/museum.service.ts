// backend/src/services/museum.service.ts

export interface ArtWork {
    id: string;
    title: string;
    imageUrl: string;
}

class MuseumService {
    private readonly API_URL = 'https://api.artic.edu/api/v1/artworks/search';
    private readonly IMAGE_BASE_URL = 'https://www.artic.edu/iiif/2';

    /**
     * Busca obras de arte na API do museu e formata os dados para o padrão do jogo.
     * @param limit Quantidade de obras a serem retornadas.
     */
    public async fetchArts(limit: number = 10): Promise<ArtWork[]> {
        try {
            // Parâmetros: Domínio público, obrigatoriedade de imagem, limite e campos específicos
            const queryParams = new URLSearchParams({
                'query[term][is_public_domain]': 'true',
                'query[exists][field]': 'image_id',
                'limit': String(limit),
                'fields': 'id,title,image_id'
            });

            const response = await fetch(`${this.API_URL}?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error(`Erro na API do Museu: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();

            // Transformação e padronização dos dados para a nossa interface
            const artworks: ArtWork[] = data.data.map((art: any) => ({
                id: String(art.id),
                title: art.title,
                // Utilizamos a API IIIF do museu limitando a largura a 843px para economizar banda no front-end
                imageUrl: `${this.IMAGE_BASE_URL}/${art.image_id}/full/843,/0/default.jpg`
            }));

            console.log(`🖼️ [Museum Service] ${artworks.length} obras recuperadas e tratadas.`);
            return artworks;

        } catch (error) {
            console.error('❌ [Museum Service] Falha ao buscar obras na API externa:', error);
            // Lançamos o erro para ser tratado pela camada do Controller
            throw error; 
        }
    }
}

// Exportamos um Singleton para uso no Controller
export const museumService = new MuseumService();