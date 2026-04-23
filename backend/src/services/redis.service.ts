import Redis from 'ioredis';

class RedisService {
    private client: Redis | null = null;

    constructor() {
        this.connect();
    }

    private connect() {
        // Conecta utilizando as variáveis de ambiente ou os padrões do docker-compose
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: Number(process.env.REDIS_PORT) || 6379,
            retryStrategy: (times) => {
                // Tenta reconectar com um delay progressivo (máx 2 segundos)
                return Math.min(times * 50, 2000);
            }
        });

        this.client.on('connect', () => {
            console.log('🔗 [Redis] Conexão estabelecida com sucesso.');
        });

        this.client.on('error', (err) => {
            console.error('❌ [Redis] Erro de conexão:', err);
        });
    }

    /**
     * Busca um valor no cache.
     */
    public async get(key: string): Promise<string | null> {
        if (!this.client) return null;
        return await this.client.get(key);
    }

    /**
     * Salva um valor no cache com tempo de expiração (TTL).
     * O padrão é 3600 segundos (1 hora).
     */
    public async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
        if (!this.client) return;
        await this.client.set(key, value, 'EX', ttlSeconds);
    }
}

// Exportamos um Singleton para reaproveitar a mesma conexão na aplicação
export const redisService = new RedisService();