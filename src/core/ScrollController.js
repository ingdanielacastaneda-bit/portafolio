/**
 * ScrollController
 * Maneja las transiciones de scroll con GSAP ScrollTrigger
 * Control preciso y suave de la experiencia
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollController {
  constructor(scene3D) {
    this.scene3D = scene3D;
    this.sections = [];
    this.scrollProgress = 0;
  }

  init() {
    this.setupSections();
    this.setupScrollAnimations();
  }

  setupSections() {
    // Obtener todas las secciones
    this.sections = document.querySelectorAll('[data-section]');
  }

  setupScrollAnimations() {
    // Animación del texto de landing (fade out al hacer scroll)
    const landingText = document.querySelector('.landing-text');
    if (landingText) {
      gsap.to(landingText, {
        opacity: 0,
        y: -50,
        scrollTrigger: {
          trigger: '.landing',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            // Actualizar progreso global de scroll
            this.updateScrollProgress(self.progress);
          }
        }
      });
    }

    // Animación de entrada de secciones (fade in controlado)
    this.sections.forEach((section, index) => {
      if (index === 0) return; // Skip landing section

      const sectionContent = section.querySelector('.section-content');
      if (!sectionContent) return;

      gsap.fromTo(
        sectionContent,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
            once: true
          }
        }
      );
    });

    // Control de cámara 3D basado en scroll
    if (this.scene3D) {
      ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          this.scene3D.updateCameraOnScroll(self.progress);
        }
      });
    }

    // Animación de proyectos (entrada escalonada y controlada)
    const projects = document.querySelectorAll('.project');
    projects.forEach((project, index) => {
      const visual = project.querySelector('.project-visual');
      const info = project.querySelector('.project-info');

      if (visual && info) {
        // Visual aparece primero, luego info
        gsap.fromTo(
          visual,
          {
            opacity: 0,
            scale: 0.95
          },
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: project,
              start: 'top 85%',
              end: 'top 60%',
              scrub: 1
            }
          }
        );

        gsap.fromTo(
          info,
          {
            opacity: 0,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: project,
              start: 'top 75%',
              end: 'top 50%',
              scrub: 1
            }
          }
        );
      }
    });
  }

  updateScrollProgress(progress) {
    this.scrollProgress = progress;
    // Se puede usar este progreso para sincronizar otros elementos
  }

  destroy() {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
}
