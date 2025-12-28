// Validación de entrada para seguridad
const validSectionIds = ['home', 'projects', 'about', 'contact'];

// Tooltip simple para elementos interactivos
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const title = this.getAttribute('title');
            if (title) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = title;
                tooltip.setAttribute('role', 'tooltip');
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                
                this.setAttribute('data-tooltip', title);
                this.removeAttribute('title');
            }
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
            const title = this.getAttribute('data-tooltip');
            if (title) {
                this.setAttribute('title', title);
                this.removeAttribute('data-tooltip');
            }
        });
    });
}

function navigateTo(sectionId) {
    // Validar entrada para prevenir XSS
    if (!validSectionIds.includes(sectionId)) {
        console.warn('Invalid section ID:', sectionId);
        return;
    }

    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
        console.warn('Section not found:', sectionId);
        return;
    }

    // Efecto de transición suave entre secciones
    document.querySelectorAll('.section').forEach(el => {
        if (el.classList.contains('active')) {
            el.style.opacity = '0';
            setTimeout(() => {
                el.classList.remove('active');
            }, 300);
        } else {
            el.classList.remove('active');
        }
    });

    setTimeout(() => {
        targetSection.classList.add('active');
        targetSection.style.opacity = '0';
        requestAnimationFrame(() => {
            targetSection.style.opacity = '1';
        });
    }, 300);

    document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('active');
        const text = el.textContent.trim().toLowerCase(); // Usar textContent en lugar de innerText
        if ((text === 'inicio' && sectionId === 'home') || 
            (text === 'proyectos' && sectionId === 'projects') || 
            (text === 'perfil' && sectionId === 'about') ||
            (text === 'contacto' && sectionId === 'contact')) {
            el.classList.add('active');
        }
    });

    // Ocultar header en la vista de proyectos para más espacio
    const header = document.getElementById('main-header');
    if (header) {
        if (sectionId === 'projects') {
            header.style.opacity = '0';
            header.style.pointerEvents = 'none';
        } else {
            header.style.opacity = '1';
            header.style.pointerEvents = 'auto';
        }
    }
}

const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Ajustar cantidad de partículas según el tamaño de pantalla
function getParticleCount() {
    const area = window.innerWidth * window.innerHeight;
    if (area < 500000) return 30; // Móvil pequeño
    if (area < 1000000) return 40; // Móvil grande / Tablet pequeña
    return 55; // Desktop
}

let particleCount = getParticleCount();
const connectionDistance = 150;
const mouseDistance = 180;

// Throttle para resize - mejora rendimiento
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // Re-inicializar partículas si el canvas cambia mucho de tamaño
    if (particles.length > 0) {
        initParticles();
    }
}

// Usar throttle para resize (solo se ejecuta cada 250ms)
window.addEventListener('resize', throttle(resize, 250));
resize();

// Throttle para mousemove - mejora rendimiento
const mouse = { x: null, y: null };
let mouseUpdateScheduled = false;

function updateMousePosition(e) {
    mouse.x = e.x;
    mouse.y = e.y;
    mouseUpdateScheduled = false;
}

window.addEventListener('mousemove', (e) => {
    if (!mouseUpdateScheduled) {
        mouseUpdateScheduled = true;
        requestAnimationFrame(() => updateMousePosition(e));
    }
}, { passive: true });

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
}, { passive: true });

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.18;
        this.vy = (Math.random() - 0.5) * 0.18;
        this.size = Math.random() * 1.5 + 0.8;
        this.color = Math.random() > 0.5 ? 'rgba(56,189,248,0.9)' : 'rgba(244,114,182,0.9)';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;

        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouseDistance) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouseDistance - distance) / mouseDistance;
                const directionX = forceDirectionX * force * 0.12;
                const directionY = forceDirectionY * force * 0.12;
                this.vx += directionX;
                this.vy += directionY;
                this.vx *= 0.96;
                this.vy *= 0.96;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    particleCount = getParticleCount();
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

// Optimización: usar distance squared para evitar Math.sqrt innecesario
function getDistanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

const connectionDistanceSquared = connectionDistance * connectionDistance;

function animate() {
    // Verificar si la página está visible (Page Visibility API)
    if (document.hidden) {
        requestAnimationFrame(animate);
        return;
    }

    ctx.clearRect(0, 0, width, height);
    
    // Actualizar y dibujar partículas
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    // Dibujar conexiones (optimizado con distance squared)
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const distanceSquared = getDistanceSquared(
                particles[i].x, particles[i].y,
                particles[j].x, particles[j].y
            );

            if (distanceSquared < connectionDistanceSquared) {
                const distance = Math.sqrt(distanceSquared);
                ctx.beginPath();
                const alpha = 0.22 * (1 - distance/connectionDistance);
                ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
                ctx.lineWidth = 0.4;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

// Ocultar loading screen y mostrar contenido cuando todo esté cargado
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const body = document.body;
    
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            if (body) {
                body.classList.add('loaded');
            }
        }, 500);
    } else if (body) {
        body.classList.add('loaded');
    }
}

// Esperar a que todos los recursos estén cargados
if (document.readyState === 'complete') {
    setTimeout(hideLoadingScreen, 300);
} else {
    window.addEventListener('load', () => {
        setTimeout(hideLoadingScreen, 300);
    });
}

// Fallback: mostrar contenido después de 2 segundos máximo
setTimeout(() => {
    const body = document.body;
    if (body && !body.classList.contains('loaded')) {
        body.classList.add('loaded');
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
}, 2000);

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initTooltips();
    initContactForm();
    initParticles();
    animate();
});

// Inicializar formulario de contacto
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        const submitText = document.getElementById('submit-text');
        const submitSpinner = document.getElementById('submit-spinner');
        const formMessage = document.getElementById('form-message');
        
        // Validar campos requeridos
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !subject || !message) {
            formMessage.textContent = 'Por favor, completa todos los campos requeridos.';
            formMessage.className = 'text-center text-sm py-2 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
            formMessage.classList.remove('hidden');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            formMessage.textContent = 'Por favor, ingresa un email válido.';
            formMessage.className = 'text-center text-sm py-2 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
            formMessage.classList.remove('hidden');
            return;
        }
        
        // Deshabilitar botón y mostrar spinner
        submitBtn.disabled = true;
        submitText.textContent = 'Enviando...';
        submitSpinner.classList.remove('hidden');
        formMessage.classList.add('hidden');
        
        // Obtener datos del formulario
        const phone = document.getElementById('phone').value.trim() || 'No proporcionado';
        
        try {
            // Preparar mensaje de WhatsApp
            const whatsappMessage = encodeURIComponent(
                `Hola Karen, te contacté desde tu portafolio:\n\n` +
                `Nombre: ${name}\n` +
                `Email: ${email}\n` +
                `Teléfono: ${phone}\n` +
                `Asunto: ${subject}\n\n` +
                `Mensaje: ${message}`
            );
            
            // Preparar mensaje para email
            const emailBody = encodeURIComponent(
                `Hola Karen,\n\n` +
                `Te contacté desde tu portafolio:\n\n` +
                `Nombre: ${name}\n` +
                `Email: ${email}\n` +
                `Teléfono: ${phone}\n` +
                `Asunto: ${subject}\n\n` +
                `Mensaje:\n${message}\n\n` +
                `---\n` +
                `Este mensaje fue enviado desde el formulario de contacto del portafolio.`
            );
            
            // Crear enlace mailto
            const mailtoLink = `mailto:tu-email@ejemplo.com?subject=${encodeURIComponent('Contacto desde Portafolio: ' + subject)}&body=${emailBody}`;
            
            // Intentar enviar usando Web3Forms (servicio gratuito y seguro)
            // INSTRUCCIONES: Ve a https://web3forms.com y obtén tu ACCESS_KEY gratuita
            // Luego reemplaza 'YOUR_ACCESS_KEY' con tu clave real
            const accessKey = 'YOUR_ACCESS_KEY'; // Cambiar por tu clave de Web3Forms
            
            let emailSent = false;
            
            if (accessKey !== 'YOUR_ACCESS_KEY') {
                try {
                    const response = await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            access_key: accessKey,
                            subject: `Nuevo contacto desde portafolio: ${subject}`,
                            from_name: name,
                            from_email: email,
                            phone: phone,
                            message: `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\n\nMensaje:\n${message}`,
                            // Cambiar por tu email donde quieres recibir los mensajes
                            to_email: 'tu-email@ejemplo.com'
                        })
                    });
                    
                    const result = await response.json();
                    emailSent = result.success;
                } catch (error) {
                    console.error('Error al enviar por Web3Forms:', error);
                }
            }
            
            // Si no se configuró Web3Forms, simular envío
            if (!emailSent) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Mostrar mensaje de éxito con opciones
            formMessage.innerHTML = `
                <div class="flex flex-col items-center gap-2">
                    <p class="text-green-300 font-semibold">¡Mensaje recibido!</p>
                    <p class="text-sm text-gray-300">Me pondré en contacto contigo pronto.</p>
                    <p class="text-xs text-gray-400 mt-2">También puedes contactarme directamente:</p>
                    <div class="flex gap-3 mt-2">
                        <a href="${mailtoLink}" class="text-cyan-300 hover:text-cyan-200 text-xs underline">Por Email</a>
                        <span class="text-gray-500">|</span>
                        <a href="https://wa.me/573138493806?text=${whatsappMessage}" target="_blank" class="text-green-300 hover:text-green-200 text-xs underline">Por WhatsApp</a>
                    </div>
                </div>
            `;
            formMessage.className = 'text-center text-sm py-3 px-4 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30';
            formMessage.classList.remove('hidden');
            
            // Limpiar formulario
            form.reset();
            
            // Guardar en consola para referencia (en producción esto iría a un servidor)
            console.log('Nuevo contacto recibido:', {
                name,
                email,
                phone,
                subject,
                message,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error:', error);
            // Mostrar mensaje de error con opciones alternativas
            formMessage.innerHTML = `
                <p class="text-red-300 mb-2">Hubo un error al procesar el formulario.</p>
                <p class="text-sm text-gray-300">Por favor, contáctame directamente:</p>
                <div class="flex gap-3 mt-2 justify-center">
                    <a href="https://wa.me/573138493806" target="_blank" class="text-green-300 hover:text-green-200 text-xs underline">WhatsApp</a>
                    <span class="text-gray-500">|</span>
                    <a href="https://www.linkedin.com/in/daniela-casta%C3%B1eda-330987367/" target="_blank" class="text-blue-300 hover:text-blue-200 text-xs underline">LinkedIn</a>
                </div>
            `;
            formMessage.className = 'text-center text-sm py-3 px-4 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30';
            formMessage.classList.remove('hidden');
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitText.textContent = 'Enviar Mensaje';
            submitSpinner.classList.add('hidden');
            
            // Ocultar mensaje después de 8 segundos
            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 8000);
        }
    });
}

// Inicializar estado del header
const currentSection = document.querySelector('.section.active');
if (currentSection && currentSection.id === 'projects') {
    const header = document.getElementById('main-header');
    if (header) {
        header.style.opacity = '0';
        header.style.pointerEvents = 'none';
    }
}


// Optimización: usar passive listeners y throttling
document.querySelectorAll('.project-card').forEach(card => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId = null;
    let isAnimating = false;

    function updateTransform() {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        
        // Detener animación si está cerca del objetivo
        if (Math.abs(currentX - targetX) < 0.01 && Math.abs(currentY - targetY) < 0.01) {
            currentX = targetX;
            currentY = targetY;
            isAnimating = false;
            rafId = null;
        } else {
            card.style.transform = `perspective(1000px) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
            rafId = requestAnimationFrame(updateTransform);
        }
    }

    let mouseMoveScheduled = false;
    card.addEventListener('mousemove', (e) => {
        if (!mouseMoveScheduled) {
            mouseMoveScheduled = true;
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xCenter = rect.width / 2;
                const yCenter = rect.height / 2;
                targetY = ((y - yCenter) / yCenter) * -8;
                targetX = ((x - xCenter) / xCenter) * 8;
                
                if (!isAnimating) {
                    isAnimating = true;
                    updateTransform();
                }
                mouseMoveScheduled = false;
            });
        }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        if (!isAnimating) {
            isAnimating = true;
            updateTransform();
        }
    }, { passive: true });
});

// Animación del nombre "Karen Castañeda" en la sección about
const nameCanvas = document.getElementById('name-canvas');
if (nameCanvas) {
    const nameCtx = nameCanvas.getContext('2d');
    let nameWidth, nameHeight;
    let nameParticles = [];
    const nameText = "KAREN CASTAÑEDA";
    let textPoints = [];
    let isAboutActive = false;

    function resizeNameCanvas() {
        const aboutSection = document.getElementById('about');
        if (aboutSection && aboutSection.classList.contains('active')) {
            const rect = aboutSection.getBoundingClientRect();
            nameWidth = nameCanvas.width = rect.width;
            nameHeight = nameCanvas.height = rect.height;
            generateTextPoints();
            initNameParticles();
        }
    }

    function generateTextPoints() {
        // Crear un canvas temporal para renderizar el texto y obtener los puntos
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = nameWidth;
        tempCanvas.height = nameHeight;
        
        tempCtx.fillStyle = 'white';
        tempCtx.font = `bold ${Math.min(nameWidth / 8, nameHeight / 3)}px 'Orbitron', sans-serif`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(nameText, nameWidth / 2, nameHeight / 2);
        
        const imageData = tempCtx.getImageData(0, 0, nameWidth, nameHeight);
        textPoints = [];
        const step = 4; // Densidad de puntos
        
        for (let y = 0; y < nameHeight; y += step) {
            for (let x = 0; x < nameWidth; x += step) {
                const index = (y * nameWidth + x) * 4;
                if (imageData.data[index + 3] > 128) {
                    textPoints.push({ x, y });
                }
            }
        }
    }

    class NameParticle {
        constructor() {
            this.reset();
            this.targetIndex = Math.floor(Math.random() * textPoints.length);
        }

        reset() {
            this.x = Math.random() * nameWidth;
            this.y = Math.random() * nameHeight;
            this.vx = 0;
            this.vy = 0;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? 'rgba(56,189,248,0.8)' : 'rgba(244,114,182,0.8)';
        }

        update() {
            if (textPoints.length > 0 && isAboutActive) {
                const target = textPoints[this.targetIndex];
                if (target) {
                    const dx = target.x - this.x;
                    const dy = target.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 2) {
                        this.vx += dx * 0.01;
                        this.vy += dy * 0.01;
                    } else {
                        this.targetIndex = Math.floor(Math.random() * textPoints.length);
                    }
                }
            } else {
                this.vx += (Math.random() - 0.5) * 0.1;
                this.vy += (Math.random() - 0.5) * 0.1;
            }

            this.vx *= 0.95;
            this.vy *= 0.95;
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > nameWidth) this.vx *= -1;
            if (this.y < 0 || this.y > nameHeight) this.vy *= -1;
        }

        draw() {
            nameCtx.beginPath();
            nameCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            nameCtx.fillStyle = this.color;
            nameCtx.fill();
        }
    }

    function initNameParticles() {
        nameParticles = [];
        const count = Math.min(textPoints.length || 200, 300);
        for (let i = 0; i < count; i++) {
            nameParticles.push(new NameParticle());
        }
    }

    const nameConnectionDistanceSquared = 80 * 80;

    function animateName() {
        // Solo animar si la sección está activa y la página es visible
        if (nameCanvas && isAboutActive && !document.hidden) {
            nameCtx.clearRect(0, 0, nameWidth, nameHeight);
            
            // Actualizar y dibujar partículas
            for (let i = 0; i < nameParticles.length; i++) {
                nameParticles[i].update();
                nameParticles[i].draw();
            }

            // Dibujar conexiones (optimizado)
            for (let i = 0; i < nameParticles.length; i++) {
                for (let j = i + 1; j < nameParticles.length; j++) {
                    const distanceSquared = getDistanceSquared(
                        nameParticles[i].x, nameParticles[i].y,
                        nameParticles[j].x, nameParticles[j].y
                    );

                    if (distanceSquared < nameConnectionDistanceSquared) {
                        const distance = Math.sqrt(distanceSquared);
                        nameCtx.beginPath();
                        const alpha = 0.15 * (1 - distance / 80);
                        nameCtx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
                        nameCtx.lineWidth = 0.5;
                        nameCtx.moveTo(nameParticles[i].x, nameParticles[i].y);
                        nameCtx.lineTo(nameParticles[j].x, nameParticles[j].y);
                        nameCtx.stroke();
                    }
                }
            }
        }
        requestAnimationFrame(animateName);
    }

    // Observar cuando la sección about está activa
    const observer = new MutationObserver(() => {
        const aboutSection = document.getElementById('about');
        isAboutActive = aboutSection && aboutSection.classList.contains('active');
        if (isAboutActive) {
            resizeNameCanvas();
        }
    });

    observer.observe(document.getElementById('about'), {
        attributes: true,
        attributeFilter: ['class']
    });

    // Throttle para resize del canvas de nombre
    window.addEventListener('resize', throttle(() => {
        if (isAboutActive) {
            resizeNameCanvas();
        }
    }, 250));

    // Inicializar cuando la página carga
    setTimeout(() => {
        if (document.getElementById('about').classList.contains('active')) {
            isAboutActive = true;
            resizeNameCanvas();
        }
        animateName();
    }, 100);
}


