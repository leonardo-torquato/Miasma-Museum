// frontend/src/api/ArtService.ts

export interface ArtPiece {
    id: string;
    title: string;
    imageUrl: string;
    width: number;   // largura original da imagem (para calcular proporção do frame)
    height: number;  // altura original da imagem (para calcular proporção do frame)
}

/**
 * ArtPool: gerencia o lote de obras de arte do jogo.
 *
 * Responsabilidades:
 *  - Buscar obras do backend em lotes (batch prefetching)
 *  - Garantir que nenhuma obra se repita ao longo dos corredores
 *  - Disparar recarga em background quando o pool estiver quase vazio
 */
export class ArtPool {
    private static readonly BASE_URL = '/api/artes';
    // Limiar mínimo de obras restantes para disparar recarga silenciosa
    private static readonly LOW_THRESHOLD = 8;

    // Fila de obras disponíveis para consumo
    private pool: ArtPiece[] = [];
    // IDs de obras já exibidas — garante unicidade entre corredores
    private usedIds: Set<string> = new Set();
    private isFetching = false;

    /**
     * Deve ser chamado uma única vez antes de gerar o primeiro corredor.
     * Bloqueia até o primeiro lote estar disponível.
     */
    public async initialize(): Promise<void> {
        await this.refill();
    }

    /**
     * Retira `count` obras do pool e as consome (sem possibilidade de repetição).
     * Se o pool estiver quase vazio, dispara recarga em background sem bloquear o jogo.
     */
    public acquire(count: number): ArtPiece[] {
        const acquired: ArtPiece[] = [];

        for (let i = 0; i < count && this.pool.length > 0; i++) {
            // shift() remove e retorna o primeiro elemento — FIFO
            acquired.push(this.pool.shift()!);
        }

        // Recarga silenciosa: fire-and-forget, não bloqueia o loop do jogo
        if (this.pool.length < ArtPool.LOW_THRESHOLD && !this.isFetching) {
            this.refill();
        }

        return acquired;
    }

    public get size(): number {
        return this.pool.length;
    }

    private async refill(): Promise<void> {
        this.isFetching = true;
        try {
            const response = await fetch(ArtPool.BASE_URL);
            if (!response.ok) throw new Error(`Status: ${response.status}`);

            const data: ArtPiece[] = await response.json();

            // Adiciona ao pool apenas obras ainda não exibidas
            const fresh = data.filter(art => !this.usedIds.has(art.id));
            fresh.forEach(art => {
                this.usedIds.add(art.id);
                this.pool.push(art);
            });

            console.log(`[ArtPool] Pool reabastecido. +${fresh.length} obras novas. Disponíveis: ${this.pool.length}`);
        } catch (error) {
            console.error('[ArtPool] Falha ao reabastecer. O corredor atual pode ter menos quadros.', error);
        } finally {
            this.isFetching = false;
        }
    }
}
