// frontend/src/entities/Frame.ts
import * as THREE from 'three';
import { ArtPiece } from '../api/ArtService';

type FrameShape = 'rectangle' | 'oval';

export interface FrameDimensions {
    width: number;
    height: number;
}

/**
 * Frame: representa um quadro físico na parede do museu.
 *
 * Construção é assíncrona (factory `Frame.create`) porque precisamos carregar
 * a textura antes de criar o material. As dimensões físicas, no entanto, são
 * derivadas sincronamente da proporção da obra (art.width / art.height),
 * permitindo que o Corridor calcule o layout ANTES do carregamento terminar.
 *
 * Formas disponíveis: retângulo (~86%) e oval (~14%), escolhidas de forma
 * determinística pelo ID da obra (mesma obra = mesma forma sempre).
 */
export class Frame {
    public readonly mesh: THREE.Group;
    public readonly dimensions: FrameDimensions;

    // Assinatura para o futuro Raycaster de interação
    public readonly artData: ArtPiece;

    private constructor(mesh: THREE.Group, dimensions: FrameDimensions, art: ArtPiece) {
        this.mesh = mesh;
        this.dimensions = dimensions;
        this.artData = art;
        this.mesh.userData = { isArt: true, id: art.id, title: art.title };
    }

    /**
     * Factory assíncrona: carrega a textura e monta o mesh 3D do quadro.
     * @param art     Obra de arte com URL e dimensões originais da imagem.
     * @param maxSize Dimensão máxima do frame em unidades de mundo (a maior aresta).
     */
    public static async create(art: ArtPiece, maxSize: number): Promise<Frame> {
        const dimensions = Frame.computeDimensions(art, maxSize);
        const shape = Frame.pickShape(art);
        const group = new THREE.Group();

        return new Promise((resolve) => {
            new THREE.TextureLoader().load(
                art.imageUrl,
                (texture) => {
                    // LinearFilter para imagens reais (diferente do NearestFilter PSX do corredor)
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearMipmapLinearFilter;
                    texture.generateMipmaps = true;

                    Frame.buildGeometry(group, texture, dimensions, shape);
                    resolve(new Frame(group, dimensions, art));
                },
                undefined,
                () => {
                    // Falha silenciosa: quadro escuro no lugar da obra perdida
                    Frame.buildPlaceholder(group, dimensions);
                    resolve(new Frame(group, dimensions, art));
                }
            );
        });
    }

    /**
     * Calcula dimensões do frame preservando a proporção original da imagem.
     * Pode ser chamado antes do carregamento da textura (é síncrono).
     */
    public static computeDimensions(art: ArtPiece, maxSize: number): FrameDimensions {
        const aspectRatio = art.width / art.height;
        if (aspectRatio >= 1) {
            return { width: maxSize, height: maxSize / aspectRatio };
        } else {
            return { width: maxSize * aspectRatio, height: maxSize };
        }
    }

    /**
     * Escolhe a forma de forma determinística pelo ID: mesma obra = mesma forma sempre.
     * Distribuição: ~14% oval, ~86% retângulo.
     */
    private static pickShape(art: ArtPiece): FrameShape {
        const hash = art.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return hash % 7 === 0 ? 'oval' : 'rectangle';
    }

    private static buildGeometry(
        group: THREE.Group,
        texture: THREE.Texture,
        dim: FrameDimensions,
        shape: FrameShape
    ): void {
        const BORDER = 0.05;
        if (shape === 'oval') {
            Frame.buildOval(group, texture, dim, BORDER);
        } else {
            Frame.buildRect(group, texture, dim, BORDER);
        }
    }

    private static buildRect(
        group: THREE.Group,
        texture: THREE.Texture,
        dim: FrameDimensions,
        border: number
    ): void {
        // Tela: plano que exibe a imagem
        const canvasGeo = new THREE.PlaneGeometry(dim.width, dim.height);
        group.add(new THREE.Mesh(canvasGeo, new THREE.MeshStandardMaterial({ map: texture })));

        // Moldura: plano maior e ligeiramente atrás da tela
        const frameGeo = new THREE.PlaneGeometry(dim.width + border * 2, dim.height + border * 2);
        const frameMesh = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: 0x2c1a0e, roughness: 0.95 }));
        frameMesh.position.z = -0.008;
        group.add(frameMesh);
    }

    private static buildOval(
        group: THREE.Group,
        texture: THREE.Texture,
        dim: FrameDimensions,
        border: number
    ): void {
        const rx = dim.width / 2;
        const ry = dim.height / 2;

        // Tela oval: ShapeGeometry a partir de uma curva elíptica
        const canvasShape = new THREE.Shape();
        canvasShape.setFromPoints(
            new THREE.EllipseCurve(0, 0, rx, ry, 0, Math.PI * 2, false, 0).getPoints(64)
        );
        const canvasGeo = new THREE.ShapeGeometry(canvasShape);
        Frame.remapShapeUVs(canvasGeo, rx, ry);
        group.add(new THREE.Mesh(canvasGeo, new THREE.MeshStandardMaterial({ map: texture })));

        // Moldura oval: anel gerado com shape externo + hole interno
        const outerShape = new THREE.Shape();
        outerShape.setFromPoints(
            new THREE.EllipseCurve(0, 0, rx + border, ry + border, 0, Math.PI * 2, false, 0).getPoints(64)
        );
        const hole = new THREE.Path();
        hole.setFromPoints(
            new THREE.EllipseCurve(0, 0, rx, ry, 0, Math.PI * 2, false, 0).getPoints(64)
        );
        outerShape.holes.push(hole);

        const frameGeo = new THREE.ShapeGeometry(outerShape);
        const frameMesh = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: 0x2c1a0e, roughness: 0.95 }));
        frameMesh.position.z = -0.008;
        group.add(frameMesh);
    }

    /**
     * ShapeGeometry gera UVs baseados nas coordenadas locais do shape (não normalizados 0-1).
     * Este método remapeia para que a textura cubra corretamente toda a elipse.
     */
    private static remapShapeUVs(geo: THREE.ShapeGeometry, rx: number, ry: number): void {
        const pos = geo.attributes.position;
        const uv = geo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
            uv.setXY(i, pos.getX(i) / (rx * 2) + 0.5, pos.getY(i) / (ry * 2) + 0.5);
        }
        uv.needsUpdate = true;
    }

    private static buildPlaceholder(group: THREE.Group, dim: FrameDimensions): void {
        const geo = new THREE.PlaneGeometry(dim.width, dim.height);
        group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1.0 })));
    }
}
