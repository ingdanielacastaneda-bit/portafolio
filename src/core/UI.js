/**
 * UI
 * Maneja interacciones de UI y comportamientos de interfaz
 * Mantiene la experiencia sobria y contenida
 */
export class UI {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    this.setupSmoothScroll();
    this.setupProjectInteractions();
    this.isInitialized = true;
  }

  setupSmoothScroll() {
    // Smooth scroll nativo del navegador (más performante que JS)
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  setupProjectInteractions() {
    const projects = document.querySelectorAll('.project');
    
    projects.forEach(project => {
      // Hover sutil: solo una ligera elevación de opacidad
      project.addEventListener('mouseenter', () => {
        const visual = project.querySelector('.project-visual');
        if (visual) {
          visual.style.opacity = '0.95';
          visual.style.transition = 'opacity 0.3s ease';
        }
      });

      project.addEventListener('mouseleave', () => {
        const visual = project.querySelector('.project-visual');
        if (visual) {
          visual.style.opacity = '1';
        }
      });
    });
  }
}

