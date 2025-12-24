/**
 * Scene3D
 * Maneja la escena 3D con Three.js
 * Geometría simple, sin realismo excesivo
 */
import * as THREE from 'three';

export class Scene3D {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.meshes = [];
    
    // Parámetros de cámara para animación controlada
    this.cameraTarget = {
      position: { x: 0, y: 0, z: 5 },
      rotation: { x: 0, y: 0, z: 0 }
    };
  }

  init() {
    this.container = document.getElementById('canvas-container');
    if (!this.container) {
      console.warn('Canvas container not found');
      return;
    }

    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Cámara
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5);
    this.updateCameraTarget(this.camera.position, this.camera.rotation);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // Geometría simple y minimalista
    this.createGeometry();

    // Iniciar loop de renderizado
    this.animate();
  }

  createGeometry() {
    // Geometría simple: plano con grid sutil
    const geometry = new THREE.PlaneGeometry(10, 10, 20, 20);
    const material = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    this.scene.add(plane);
    this.meshes.push(plane);

    // Elemento flotante simple (esfera minimalista)
    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 1, 0);
    this.scene.add(sphere);
    this.meshes.push(sphere);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Animación sutil y controlada de la esfera
    if (this.meshes.length > 1) {
      const sphere = this.meshes[1];
      const time = Date.now() * 0.0005;
      sphere.position.y = 1 + Math.sin(time) * 0.2;
      sphere.rotation.y = time * 0.3;
    }

    // Interpolación suave de cámara hacia target
    this.camera.position.lerp(
      new THREE.Vector3(
        this.cameraTarget.position.x,
        this.cameraTarget.position.y,
        this.cameraTarget.position.z
      ),
      0.05
    );

    this.renderer.render(this.scene, this.camera);
  }

  updateCameraTarget(position, rotation) {
    this.cameraTarget.position = {
      x: position.x || this.cameraTarget.position.x,
      y: position.y || this.cameraTarget.position.y,
      z: position.z || this.cameraTarget.position.z
    };
    this.cameraTarget.rotation = {
      x: rotation.x || this.cameraTarget.rotation.x,
      y: rotation.y || this.cameraTarget.rotation.y,
      z: rotation.z || this.cameraTarget.rotation.z
    };
  }

  handleResize() {
    if (!this.camera || !this.renderer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // Método para controlar la cámara desde el scroll controller
  updateCameraOnScroll(progress) {
    // Movimiento controlado basado en el scroll
    const z = 5 - progress * 2; // Se acerca gradualmente
    const y = progress * 1; // Se mueve hacia arriba suavemente
    
    this.updateCameraTarget(
      { x: 0, y, z },
      { x: 0, y: progress * 0.2, z: 0 }
    );
  }
}

