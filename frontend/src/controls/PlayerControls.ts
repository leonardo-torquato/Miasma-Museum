import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class PlayerControls {
    public controls: PointerLockControls;
    
    // Estados de movimentação
    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    
    // Vetores de física
    private velocity = new THREE.Vector3();
    private direction = new THREE.Vector3();
    
    // Parâmetros de calibração
    private speed = 40.0;
    private friction = 10.0;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.controls = new PointerLockControls(camera, domElement);
        this.initListeners();
    }

    private initListeners(): void {
        // Bloqueia o cursor ao clicar na tela (padrão de jogos FPS)
        document.body.addEventListener('click', () => {
            this.controls.lock();
        });

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    private onKeyDown(event: KeyboardEvent): void {
        switch (event.code) {
            case 'KeyW': this.moveForward = true; break;
            case 'KeyA': this.moveLeft = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyD': this.moveRight = true; break;
        }
    }

    private onKeyUp(event: KeyboardEvent): void {
        switch (event.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyD': this.moveRight = false; break;
        }
    }

    public update(delta: number): void {
        if (!this.controls.isLocked) return;

        // Aplica atrito para desaceleração suave (efeito de inércia)
        this.velocity.x -= this.velocity.x * this.friction * delta;
        this.velocity.z -= this.velocity.z * this.friction * delta;

        // Calcula a direção baseada nas teclas pressionadas
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize(); // Garante movimento consistente nas diagonais

        // Aplica a aceleração
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * delta;

        // Move a câmera com base na velocidade e no tempo (delta)
        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);
    }
}