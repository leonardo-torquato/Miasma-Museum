import * as THREE from 'three';

export class Corridor {
    public mesh: THREE.Group;
    private length: number;
    private width: number;
    private height: number;

    constructor(width = 4, height = 3, length = 20) {
        this.width = width;
        this.height = height;
        this.length = length;
        this.mesh = new THREE.Group();
        this.buildCorridor();
    }

    private buildCorridor(): void {
        // Materiais base (temporários até implementarmos texturas PSX)
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1.0 });

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
}