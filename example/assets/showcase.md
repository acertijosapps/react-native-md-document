<!--
  showcase.md — Documento genérico de demostración.
  Recorre todo lo que el visor sabe renderizar: encabezado de marca, títulos,
  estilos inline (negrita, cursiva, subrayado, tachado, código, enlace, color,
  resaltado), tablas con celdas de color y anchos por columna, cita, separador,
  bloque de código y pie de página.
  Todos los colores usan var(--token) para adaptarse a claro/oscuro. Los tokens
  base (page-bg, text, heading, rule, link, code, highlight) los da la librería;
  los de marca (accent, on-accent, accent-text) vienen del prop colorTokens.
-->

<div style="font-family: Arial, Helvetica, sans-serif; max-width: 7.08in; margin: 0 auto; color: var(--text);">

<div style="background: var(--accent); color: var(--on-accent); text-align: center; font-size: 18pt; text-transform: uppercase; padding: 10px 24px; margin: 0 0 12px;">react-native-document</div>

<p style="text-align: center; font-size: 13pt; font-style: italic; color: var(--accent-text); margin: 0 0 18px;">Documento de demostración · Markdown como PDF</p>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">1. Qué muestra este documento</h2>

<p style="text-align: justify; margin: 0 0 10px;">Este archivo ejercita cada capacidad del visor en una sola página fuente. El contenido es <strong>inmutable</strong>: no se edita, solo se lee, se pagina y se navega con gesto de <em>page-flip</em>. Toca cualquier palabra para resaltarla; el subrayado <span style="background: var(--highlight);">persiste entre sesiones</span> porque se guarda por offset estable.</p>

<p style="text-align: justify; margin: 0 0 16px;">Usa <strong>Leer</strong> para escuchar el texto con voz nativa del sistema: la palabra activa se resalta y la página avanza sola para seguir el marcador. <strong>Pausa</strong> conserva la posición y <strong>Reanudar</strong> continúa donde se detuvo.</p>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">2. Estilos de texto inline</h2>

<p style="text-align: justify; margin: 0 0 10px;">El visor entiende <strong>negrita</strong>, <em>cursiva</em>, <u>subrayado</u>, <s>tachado</s>, <code>código monoespaciado</code> y <a href="https://reactnative.dev">enlaces</a>. También color por token de marca: <span style="color: var(--accent-text);">este fragmento va en color de acento</span>. Y resaltado de fondo: <span style="background: var(--highlight);">texto sobre el color de resaltado del tema</span>.</p>

<p style="text-align: justify; margin: 0 0 16px;">Los estilos se combinan: <strong><em>negrita en cursiva</em></strong>, o <strong>negrita con <code>código</code> dentro</strong>. Cada palabra conserva su offset en el texto plano, así el resaltado manual y el marcador de lectura comparten el mismo espacio de coordenadas.</p>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">3. Tabla con celdas de color</h2>

<table style="width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; border: 3px solid var(--page-bg); margin-bottom: 16px;">
  <colgroup>
    <col style="width: 30%;">
    <col style="width: 70%;">
  </colgroup>
  <tr>
    <td style="background: var(--accent); color: var(--on-accent); font-weight: bold; font-size: 12pt; text-align: center; vertical-align: middle; padding: 8px 6px; border: 3px solid var(--page-bg);">
      <p style="margin: 0; text-align: center;">Capacidad</p>
    </td>
    <td style="background: var(--accent); color: var(--on-accent); font-weight: bold; font-size: 12pt; text-align: center; vertical-align: middle; padding: 8px 6px; border: 3px solid var(--page-bg);">
      <p style="margin: 0; text-align: center;">Detalle</p>
    </td>
  </tr>
  <tr>
    <td style="font-weight: bold; font-size: 11pt; text-align: left; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Paginación</p>
    </td>
    <td style="font-size: 11pt; text-align: justify; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Medición real de alturas y empaquetado en páginas; se recalcula al cambiar de tamaño u orientación.</p>
    </td>
  </tr>
  <tr>
    <td style="font-weight: bold; font-size: 11pt; text-align: left; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Zoom</p>
    </td>
    <td style="font-size: 11pt; text-align: justify; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Pellizco para acercar y arrastre para desplazar; el gesto de cambio de página se bloquea mientras hay zoom.</p>
    </td>
  </tr>
  <tr>
    <td style="font-weight: bold; font-size: 11pt; text-align: left; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Tema</p>
    </td>
    <td style="font-size: 11pt; text-align: justify; vertical-align: top; padding: 6px 8px; border: 3px solid var(--page-bg);">
      <p style="margin: 0;">Claro, oscuro o automático. Los colores del documento son tokens que el visor resuelve por tema.</p>
    </td>
  </tr>
</table>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">4. Cita y separador</h2>

<blockquote style="border-left: 4px solid var(--accent); padding-left: 12px; margin: 0 0 12px; font-style: italic; color: var(--accent-text);">
<p style="margin: 0;">La fidelidad de un PDF sin dejar de ser texto vivo: seleccionable, legible por voz y adaptable al tema.</p>
</blockquote>

<hr />

<h2 style="color: var(--heading); font-size: 16pt; margin: 12px 0 6px;">5. Muestra de código</h2>

<p style="text-align: justify; margin: 0 0 8px;">El texto puede incluir código monoespaciado embebido, por ejemplo el punto de entrada del visor:</p>

<div style="background: var(--highlight); padding: 8px 10px; margin: 0 0 16px;">
<p style="margin: 0;"><code>useDocumentSource({ markdown: SHOWCASE_MD })</code></p>
</div>

<h2 style="color: var(--heading); font-size: 16pt; margin: 0 0 6px;">6. Contenido largo para paginar</h2>

<p style="text-align: justify; margin: 0 0 10px;">A partir de aquí el texto es suficiente para llenar varias páginas y así probar el cambio de página, el auto-avance durante la lectura y el resaltado que se conserva al volver. Cada párrafo mantiene su posición en el texto plano; al paginar no se pierde ni el marcador de lectura ni los subrayados guardados.</p>

<p style="text-align: justify; margin: 0 0 10px;">Un documento se trata como una fuente inmutable. Esa inmutabilidad da un espacio de offsets estable: el resaltado que guardas hoy sigue apuntando a las mismas palabras mañana, aunque cambie el tamaño de la pantalla, la orientación o el tema. La paginación es una vista sobre ese texto, no una modificación de él.</p>

<p style="text-align: justify; margin: 0 0 10px;">La lectura por voz usa el motor del sistema operativo a través de un módulo nativo propio, sin dependencias de terceros. Mientras habla, informa el rango de la palabra en curso; el visor traduce ese rango a la palabra y a la página correspondiente, resalta la palabra y, si está en otra página, avanza para seguirla.</p>

<p style="text-align: justify; margin: 0 0 10px;">Los gestos se componen: un toque resalta una palabra, un arrastre horizontal cambia de página con animación de volteo, y el pellizco hace zoom. Cuando hay zoom activo, el arrastre desplaza el contenido en lugar de cambiar de página, para que el acercamiento sea utilizable.</p>

<p style="text-align: justify; margin: 0 0 16px;">Todo lo visual descansa sobre dos dependencias: Reanimated y Gesture Handler. El almacenamiento, la fuente del documento y el motor de voz son puertos inyectables: puedes conectar el que prefieras o usar los que trae la librería.</p>

<div style="border-top: 2px solid var(--rule); margin-top: 20px; padding-top: 6px; text-align: right; font-size: 9pt; color: var(--accent-text);">Documento de demostración · Página generada por el visor</div>

</div>
