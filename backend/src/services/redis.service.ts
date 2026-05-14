import Redis from 'ioredis';

class RedisService {
    // Declaração estrita da propriedade (Resolve TS2339)
    private client: Redis;

    constructor() {
        // Inicialização imediata no construtor (Resolve TS2564)
        // O host 'cache' mapeia estritamente para o contêiner do docker-compose
        this.client = new Redis({
            host: 'cache',
            port: 6379,
        });

        this.client.on('connect', () => {
            console.log('✅ [Redis] Conectado com sucesso ao cache');
        });

        // Tipagem explícita para evitar o Implicit Any (Resolve TS7006)
        this.client.on('error', (err: any) => {
            console.error('❌ [Redis] Erro de conexão:', err);
        });
    }

    public async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    public async set(key: string, value: string, expirationInSeconds: number = 3600): Promise<void> {
        await this.client.set(key, value, 'EX', expirationInSeconds);
    }
}

// Exporta uma instância única (Singleton) para ser usada no controller
export default new RedisService();