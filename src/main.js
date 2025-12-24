/**
 * Main entry point
 * Orquesta la inicialización de todos los módulos
 */
import './styles/main.css';
import { Scene3D } from './core/Scene3D.js';
import { ScrollController } from './core/ScrollController.js';
import { UI } from './core/UI.js';

class App {
  constructor() {
    this.scene3D = null;
    this.scrollController = null;
    this.ui = null;
  }

  init() {
    // Inicializar escena 3D
    this.scene3D = new Scene3D();
    this.scene3D.init();

    // Inicializar controlador de scroll
    this.scrollController = new ScrollController(this.scene3D);
    this.scrollController.init();

    // Inicializar UI
    this.ui = new UI();
    this.ui.init();

    // Manejar resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    if (this.scene3D) {
      this.scene3D.handleResize();
    }
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

