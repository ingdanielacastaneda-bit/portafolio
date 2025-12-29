# Instrucciones para Configurar el Formulario de Contacto

## Opción 1: Web3Forms (Recomendado - Gratis y Seguro)

1. Ve a https://web3forms.com
2. Ingresa tu email y obtén tu `ACCESS_KEY` gratuita
3. Abre el archivo `script.js`
4. Busca la línea que dice: `const accessKey = 'YOUR_ACCESS_KEY';`
5. Reemplaza `'YOUR_ACCESS_KEY'` con tu clave real de Web3Forms
6. Busca la línea que dice: `to_email: 'tu-email@ejemplo.com'`
7. Reemplaza `'tu-email@ejemplo.com'` con tu email donde quieres recibir los mensajes
8. ¡Listo! El formulario enviará emails directamente a tu bandeja de entrada

## Opción 2: EmailJS (Alternativa)

1. Ve a https://www.emailjs.com y crea una cuenta gratuita
2. Crea un servicio de email (Gmail, Outlook, etc.)
3. Crea una plantilla de email
4. Obtén tu Public Key, Service ID y Template ID
5. Actualiza el código en `script.js` para usar EmailJS en lugar de Web3Forms

## Opción 3: Usar solo WhatsApp (Sin configuración)

Si prefieres recibir los mensajes solo por WhatsApp, el formulario ya está configurado para generar un enlace de WhatsApp con el mensaje prellenado. No necesitas hacer nada adicional.

## Notas de Seguridad

- Web3Forms es seguro y no expone tu email públicamente
- Los mensajes se envían directamente a tu bandeja de entrada
- No se requiere backend propio
- El servicio es gratuito hasta 250 mensajes/mes

## Prueba el Formulario

1. Abre `index.html` en tu navegador
2. Ve a la sección "Perfil"
3. Completa el formulario de contacto
4. Envía el mensaje
5. Verifica que recibas la notificación (si configuraste Web3Forms o EmailJS)








