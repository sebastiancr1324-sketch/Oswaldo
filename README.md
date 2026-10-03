# Oswaldo Traslados

Sitio de una sola página para los traslados particulares de Oswaldo José Valecillos Silva: viajes de CABA al Aeropuerto de Ezeiza, retiro en arribos y viajes dentro de la Ciudad. Las reservas se hacen por WhatsApp.

HTML, CSS y JavaScript sin dependencias ni build. Se publica tal cual en GitHub Pages.

## Estructura

```
index.html          Página principal (la escena del hero es SVG en línea: ciudad, autopista, aeropuerto, el Sandero y el avión)
404.html            Página de error (GitHub Pages; rutas absolutas /Oswaldo/)
css/style.css       Estilos (claro/oscuro según el sistema)
js/main.js          Escena del hero por scroll, menú móvil, visor 360°, armado y validación del mensaje de WhatsApp
assets/
  favicon.svg, favicon-32.png, apple-touch-icon.png
  img/              car-0…7.webp (8 vistas del Sandero para el visor 360°), og-image.png (1200×630, para redes)
robots.txt, sitemap.xml
```

## Datos que hay que cambiar en un solo lugar

- **WhatsApp / teléfono:** `5491126142293` aparece en `index.html` (links `wa.me` y `tel:`), en `404.html` y en `js/main.js` (`WA_NUMBER`, `PHONE_DISPLAY`).
- **Dominio:** las URL absolutas usan `https://sebastiancr1324-sketch.github.io/Oswaldo/`. Si el repositorio se llama distinto o se usa un dominio propio, actualizar `canonical`, `og:url`, `og:image`, `twitter:image` y el JSON-LD en `index.html`, las rutas `/Oswaldo/` de `404.html`, `robots.txt` y `sitemap.xml`.

## Pendiente

- El auto es un **Renault Sandero 1.6** blanco (hatchback, baúl de 320 L). Las 8 fotos del visor 360° son imágenes de referencia del modelo, repintadas de blanco y sin patente; por eso el visor dice "Imagen de referencia". Si se consiguen fotos reales del auto de Oswaldo, reemplazarlas con el mismo tamaño (900×381) y el mismo orden de giro (0° frente tres cuartos, de a 45° hacia la izquierda).
- `og-image.png` se generó con Chrome sin ventana a partir de la escena del hero. Si cambia el dibujo del auto o el texto, conviene regenerarla.
- Faltan datos que solo puede dar Oswaldo: foto suya, reseñas reales de clientes, una tarifa de referencia, medios de pago, horario de trabajo, tiempo de espera si el vuelo se atrasa y con cuánta anticipación conviene reservar. Con eso se puede sumar una sección de preguntas frecuentes.
- La página ya no nombra a Uber en las ventajas (dice "aplicaciones"). Si Oswaldo sigue manejando en apps, conviene que revise sus términos antes de promocionar viajes directos.
