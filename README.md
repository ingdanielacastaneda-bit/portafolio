# Portafolio Profesional

Portafolio minimalista y sobrio con Three.js y GSAP ScrollTrigger.

## Stack Tecnológico

- **Vite** - Build tool y dev server
- **Three.js** - Renderizado 3D ligero y controlado
- **GSAP + ScrollTrigger** - Animaciones de scroll precisas

## Estructura del Proyecto

```
├── src/
│   ├── core/
│   │   ├── Scene3D.js      # Manejo de escena 3D (Three.js)
│   │   ├── ScrollController.js  # Control de scroll (GSAP ScrollTrigger)
│   │   └── UI.js           # Interacciones de UI
│   ├── styles/
│   │   └── main.css        # Estilos principales
│   └── main.js             # Punto de entrada principal
├── index.html
├── package.json
└── vite.config.js
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El proyecto se abrirá en `http://localhost:3000`

## Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## Arquitectura

### Scene3D.js
Maneja la escena 3D con geometría simple. La cámara se controla mediante interpolación suave hacia targets definidos externamente.

### ScrollController.js
Orquesta las animaciones basadas en scroll usando GSAP ScrollTrigger. Controla:
- Fade out del texto de landing
- Entrada de secciones
- Movimiento de cámara 3D
- Animaciones de proyectos

### UI.js
Maneja interacciones simples de UI (hover sutil, smooth scroll).

## Decisiones Técnicas

- **Geometría 3D minimalista**: Plano con grid y esfera wireframe simple
- **Animaciones controladas**: Uso de `scrub` en ScrollTrigger para movimiento fluido vinculado al scroll
- **Performance**: Limite de pixel ratio, requestAnimationFrame optimizado
- **Modularidad**: Separación clara de responsabilidades entre módulos
- **Estética sobria**: Paleta oscura, tipografía limpia, espacios generosos

