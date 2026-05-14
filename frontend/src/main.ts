import * as THREE from 'three';
import { PlayerControls } from './controls/PlayerControls';
import { Corridor } from './entities/Corridor';
import { ArtPool } from './api/ArtService';

class GameEngine {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private clock!: THREE.Clock;
    private playerControls!: PlayerControls;

    constructor() {
        this.init();
        this.animate();
    }

    private init(): void {
        this.clock = new THREE.Clock();

        // 1. Cena e Atmosfera Base
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);
        this.scene.fog = new THREE.Fog(0x050505, 0.1, 12); 

        // 2. Iluminação do Museu (Baixa e Atmosférica)
        const ambientLight = new THREE.AmbientLight(0x202020, 1.0); // Luz ambiente quase nula
        this.scene.add(ambientLight);

        // 3. Câmara em Primeira Pessoa
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.6, 0); 

        // 4. Renderizador WebGL
        this.renderer = new THREE.WebGLRenderer({ antialias: false }); 
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(this.renderer.domElement);

        // 5. Instanciação do Cenário e Injeção Dinâmica de Obras de Arte
        const initialCorridor = new Corridor();
        this.scene.add(initialCorridor.mesh);

        // Inicializa o pool, adquire 20 obras (≈10 por parede) e popula o corredor
        const artPool = new ArtPool();
        artPool.initialize().then(() => {
            initialCorridor.populateWalls(artPool.acquire(20));
        });

        // 6. Instanciação dos Controles do Jogador
        this.playerControls = new PlayerControls(this.camera, document.body);
        this.scene.add(this.playerControls.controls.getObject());

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        
        const delta = this.clock.getDelta();
        this.playerControls.update(delta);
        
        this.renderer.render(this.scene, this.camera);
    }
}

new GameEngine();