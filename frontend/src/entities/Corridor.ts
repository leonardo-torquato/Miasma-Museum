import * as THREE from 'three';
import { Frame } from './Frame';
import { ArtPiece } from '../api/ArtService';

// Posição e dimensões pré-computadas de um quadro no plano 2D da parede
interface FrameLayout {
    art: ArtPiece;
    u: number;      // posição ao longo do comprimento do corredor (eixo Z)
    v: number;      // altura do centro do quadro (eixo Y)
    width: number;  // largura do frame em unidades de mundo
    height: number; // altura do frame em unidades de mundo
}

export class Corridor {
    public mesh: THREE.Group;
    private length: number;
    private width: number;
    private height: number;

    constructor(width = 4, height = 3, length = 40) { // Aumentei o comprimento para dar profundidade ao museu
        this.width = width;
        this.height = height;
        this.length = length;
        this.mesh = new THREE.Group();
        this.buildCorridor();
        this.buildLighting();
    }

    // Gera uma textura procedural ruidosa em baixa resolução (PSX Style)
    private createPSXTexture(baseColor: string, detailColor: string): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 64; 
        canvas.height = 64;
        const context = canvas.getContext('2d')!;
        
        context.fillStyle = baseColor;
        context.fillRect(0, 0, 64, 64);
        
        context.fillStyle = detailColor;
        for (let i = 0; i < 200; i++) {
            const x = Math.floor(Math.random() * 64);
            const y = Math.floor(Math.random() * 64);
            const size = Math.random() > 0.5 ? 2 : 4;
            context.fillRect(x, y, size, size);
        }

        const texture = new THREE.CanvasTexture(canvas);
        // NearestFilter é o segredo para a textura não borrar e ficar pixelada
        texture.magFilter = THREE.NearestFilter; 
        texture.minFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Salon Hanging: distribui os quadros nas duas paredes com posicionamento
     * orgânico e variado, usando Rejection Sampling para evitar sobreposições.
     *
     * O layout (posições e dimensões) é calculado sincronamente antes do
     * carregamento das texturas, que ocorre em paralelo via Promise.all.
     */
    public populateWalls(arts: ArtPiece[]): void {
        if (arts.length === 0) return;

        const half = Math.ceil(arts.length / 2);
        const leftLayouts  = this.computeSalonLayout(arts.slice(0, half));
        const rightLayouts = this.computeSalonLayout(arts.slice(half));

        // Constrói e posiciona os frames de cada parede em paralelo (fire-and-forget)
        this.buildAndPlace(leftLayouts,  'left');
        this.buildAndPlace(rightLayouts, 'right');
    }

    private async buildAndPlace(
        layouts: FrameLayout[],
        side: 'left' | 'right'
    ): Promise<void> {
        const xPos = side === 'left' ? -this.width / 2 + 0.06 : this.width / 2 - 0.06;
        const rotY  = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

        // Carrega todas as texturas do lote em paralelo
        const frames = await Promise.all(
            layouts.map(layout => Frame.create(layout.art, Math.max(layout.width, layout.height)))
        );

        frames.forEach((frame, i) => {
            const { u, v } = layouts[i];
            frame.mesh.position.set(xPos, v, u);
            frame.mesh.rotation.y = rotY;
            this.mesh.add(frame.mesh);
        });
    }

    /**
     * Calcula o layout 2D dos quadros na parede usando Rejection Sampling.
     *
     * Coordenadas do "canvas" da parede:
     *   u = posição ao longo do eixo Z do corredor (comprimento)
     *   v = posição no eixo Y (altura do chão até o teto)
     *
     * Colisão AABB: dois quadros se sobrepõem se há sobreposição simultaneamente
     * em ambos os eixos (u e v), considerando um padding de respiro entre eles.
     */
    private computeSalonLayout(arts: ArtPiece[]): FrameLayout[] {
        const MARGIN      = 2.0;  // espaço vazio nas extremidades do corredor
        const PADDING     = 0.2;  // respiro mínimo entre molduras vizinhas
        const MAX_RETRIES = 60;
        const SIZE_MIN    = 0.5;  // menor maxSize possível (unidades de mundo)
        const SIZE_MAX    = 1.4;  // maior maxSize possível
        const V_MIN       = 0.4;  // altura mínima do centro do quadro
        const V_MAX       = this.height - 0.35; // altura máxima do centro

        const placed: FrameLayout[] = [];

        for (const art of arts) {
            // Sorteia um tamanho aleatório para este quadro
            const maxSize = SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN);
            const { width, height } = Frame.computeDimensions(art, maxSize);

            let positioned = false;

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                // Posição aleatória dentro dos limites seguros da parede
                const u = -this.length / 2 + MARGIN + Math.random() * (this.length - MARGIN * 2);
                const v = V_MIN + height / 2 + Math.random() * (V_MAX - V_MIN - height);

                // Checa AABB contra todos os quadros já posicionados
                const overlaps = placed.some(p =>
                    Math.abs(p.u - u) < (p.width  + width)  / 2 + PADDING &&
                    Math.abs(p.v - v) < (p.height + height) / 2 + PADDING
                );

                if (!overlaps) {
                    placed.push({ art, u, v, width, height });
                    positioned = true;
                    break;
                }
            }

            if (!positioned) {
                console.warn(`[Corridor] Quadro não encaixado após ${MAX_RETRIES} tentativas: "${art.title}"`);
            }
        }

        return placed;
    }

    private buildCorridor(): void {
        const floorTex = this.createPSXTexture('#2a2a2a', '#1a1a1a');
        floorTex.repeat.set(this.width / 2, this.length / 2);

        const wallTex = this.createPSXTexture('#3a3a3a', '#222222');
        wallTex.repeat.set(this.length / 2, this.height / 2);

        const ceilingTex = this.createPSXTexture('#111111', '#050505');
        ceilingTex.repeat.set(this.width / 2, this.length / 2);

        const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });
        const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 1.0 });
        const ceilingMaterial = new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 1.0 });

        // Piso
        const floorGeo = new THREE.PlaneGeometry(this.width, this.length);
        const floor = new THREE.Mesh(floorGeo, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        this.mesh.add(floor);

        // Teto
        const ceilingGeo = new THREE.PlaneGeometry(this.width, this.length);
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = this.height;
        this.mesh.add(ceiling);

        // Parede Esquerda
        const wallLeftGeo = new THREE.PlaneGeometry(this.length, this.height);
        const wallLeft = new THREE.Mesh(wallLeftGeo, wallMaterial);
        wallLeft.rotation.y = Math.PI / 2;
        wallLeft.position.set(-this.width / 2, this.height / 2, 0);
        this.mesh.add(wallLeft);

        // Parede Direita
        const wallRightGeo = new THREE.PlaneGeometry(this.length, this.height);
        const wallRight = new THREE.Mesh(wallRightGeo, wallMaterial);
        wallRight.rotation.y = -Math.PI / 2;
        wallRight.position.set(this.width / 2, this.height / 2, 0);
        this.mesh.add(wallRight);
    }

    private buildLighting(): void {
        const spacing = 10; // Distância entre as lâmpadas no teto
        const startZ = -this.length / 2 + 5;
        const endZ = this.length / 2 - 5;

        for (let z = startZ; z <= endZ; z += spacing) {
            // Luz principal da lâmpada
            const light = new THREE.PointLight(0xffddaa, 1.5, 15);
            light.position.set(0, this.height - 0.2, z);
            this.mesh.add(light);

            // Mesh visível para simular a lâmpada no teto
            const bulbGeo = new THREE.BoxGeometry(0.4, 0.1, 0.4);
            const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffee }); // BasicMaterial não sofre sombra
            const bulb = new THREE.Mesh(bulbGeo, bulbMat);
            bulb.position.set(0, this.height - 0.05, z);
            this.mesh.add(bulb);
        }
    }
}