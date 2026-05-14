// backend/src/services/museum.service.ts

export interface ArtWork {
    id: string;
    title: string;
    imageUrl: string;
    width: number;   // largura original da imagem (para calcular proporção do frame)
    height: number;  // altura original da imagem (para calcular proporção do frame)
}

class MuseumService {
    private readonly API_URL = 'https://api.artic.edu/api/v1/artworks/search';
    private readonly IMAGE_BASE_URL = 'https://www.artic.edu/iiif/2';

    /**
     * Busca obras de arte na API do museu e formata os dados para o padrão do jogo.
     * @param limit Quantidade de obras a serem retornadas (padrão 30 para o batch do ArtPool).
     */
    public async fetchArts(limit: number = 30): Promise<ArtWork[]> {
        try {
            const queryParams = new URLSearchParams({
                'query[term][is_public_domain]': 'true',
                'query[exists][field]': 'image_id',
                'limit': String(limit),
                // 'thumbnail' incluído para obter as dimensões originais da imagem
                'fields': 'id,title,image_id,thumbnail'
            });

            const response = await fetch(`${this.API_URL}?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error(`Erro na API do Museu: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();

            const artworks: ArtWork[] = data.data
                // Filtra obras sem imagem ou sem dimensões válidas no thumbnail
                .filter((art: any) => art.image_id && art.thumbnail?.width && art.thumbnail?.height)
                .map((art: any) => ({
                    id: String(art.id),
                    title: art.title,
                    imageUrl: `${this.IMAGE_BASE_URL}/${art.image_id}/full/843,/0/default.jpg`,
                    // Proporção original da imagem: usada pelo frontend para dimensionar o frame
                    width: art.thumbnail.width,
                    height: art.thumbnail.height,
                }));

            console.log(`🖼️ [Museum Service] ${artworks.length} obras recuperadas e tratadas.`);
            return artworks;

        } catch (error) {
            console.error('❌ [Museum Service] Falha ao buscar obras na API externa:', error);
            throw error;
        }
    }
}

export const museumService = new MuseumService();
