# El Rinconcito del Sabor · vista previa

Página estática (HTML, CSS y JS) lista para GitHub Pages. Vista previa preparada por Escobar Net.

## Cambiar datos (menú, precios, horario, WhatsApp)
Todo está en **`js/config.js`**: número de WhatsApp, horario por día, minutos de preparación y la lista de platillos con su precio y su foto (`img/menu/<foto>.webp`).
Después de editar, corre `node tools/render.mjs` para copiar el menú y el horario dentro de `index.html` (así se ven sin JavaScript y Google los lee). La página siempre usa lo que dice `config.js`.

## Publicar
1. Sube esta carpeta a un repositorio de GitHub y activa Pages (rama `main`, carpeta raíz).
2. La etiqueta `og:image` ya apunta a `https://escobarnet-software.github.io/El-Rinconcito-del-Sabor/share.jpg`; cámbiala si usas otro dominio.

## Archivos
- `index.html`, `credits.html`: la página y los créditos de las fotos.
- `css/styles.css`: estilos (colores y tipografía sacados del logo: Pacifico, Bricolage Grotesque, Nunito Sans).
- `js/config.js`, `js/app.js`, `js/motion.js`: configuración, lógica del pedido y animaciones (entrada, parallax, aparición al bajar).
- `assets/img/`: fotos de Suchitoto (Wikimedia Commons).
- `img/`: logo y fotos de los platillos (del catálogo de WhatsApp del restaurante).
- `share.jpg`: imagen para cuando se comparte el enlace en WhatsApp.
- `capturas/`: capturas de celular (390 px) y de escritorio de la vista previa.
- `tools/`: script del menú estático y las plantillas de `share.jpg` y de la simulación del mensaje.

Prueba de casos extremos: abre `index.html?datos=peor` (nombre larguísimo, pedido de 73 artículos, emojis).
