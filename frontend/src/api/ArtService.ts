// Interface baseada na padronização que definimos no backend (MuseumService)
export interface ArtPiece {
    id: string;
    title: string;
    imageUrl: string;
}

export class ArtService {
    // Caminho relativo interceptado pelo Nginx em ambiente Docker
    private static readonly BASE_URL = '/api/artes';

    /**
     * Busca a lista de obras de arte do nosso backend.
     * O backend se encarregará de verificar o Redis (Cache HIT) 
     * ou buscar na API do museu (Cache MISS).
     */
    public static async fetchArts(): Promise<ArtPiece[]> {
        try {
            const response = await fetch(this.BASE_URL);
            
            if (!response.ok) {
                throw new Error(`Erro de rede: Falha ao buscar obras de arte (Status: ${response.status})`);
            }

            const data: ArtPiece[] = await response.json();
            return data;
            
        } catch (error) {
            console.error('ArtService: Erro ao consumir o backend.', error);
            // Em caso de falha, retornamos um array vazio para não quebrar o motor 3D
            return []; 
        }
    }
}