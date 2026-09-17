# HTML embebido en Markdown

## Por qué

Algunos documentos (p. ej. `A-001.md`, conversión de un `.docx`) usan **HTML con estilos
inline** para lograr fidelidad visual que el Markdown puro no da: barra de color de fondo,
texto centrado, celdas con color, tamaños de fuente. El visor detecta y parsea ese subconjunto
de HTML, mapeándolo al mismo IR con offsets (highlight y TTS siguen funcionando).

## Detección

`looksLikeHtml(source)` (tras quitar comentarios y espacios) devuelve `true` si el documento
empieza con un tag de bloque (`<div>`, `<table>`, `<p>`, `<section>`, `<h1..6>`, …). En ese
caso `parse()` usa `parseHtml`; si no, el parser Markdown/GFM de siempre.

## Subconjunto soportado

- **Bloques**: `div`/`section`/`article`/`header`/`footer`/`main` → contenedor;
  `p` → párrafo; `h1..h6` → encabezado; `table`/`colgroup`/`col`/`tr`/`td`/`th` → tabla;
  `hr`, `blockquote`.
- **Inline**: `strong`/`b`, `em`/`i`, `code`, `span`, `a`, `u`, `small`, `br`.
- **Comentarios** `<!-- … -->` se ignoran; entidades comunes se decodifican.

## Estilos inline mapeados

Del atributo `style` se leen: `text-align`, `color`, `background`/`background-color`,
`font-size` (pt/px → número), `font-weight` (bold), `font-style` (italic),
`text-transform`, y `width` en `<col>` (porcentaje → fracción para el ancho de columna).

Se guardan en `BlockStyle` (bloques) e `InlineStyle` (spans). El render los aplica:
fondo/margen en el `View`, y color/tamaño/peso/alineación/uppercase en el texto.

## Herencia de estilo de texto

CSS hereda color/alineación/fuente a los descendientes; el IR no. Para reproducir la barra de
título (un `<div>` con fondo y color y **texto directo**), `blocksFrom` propaga los campos de
texto (`textInherit`) del contenedor a los párrafos que crea de su texto directo y a las celdas.
El fondo y el margen **no** se heredan (son caja, no texto).

## Límites conocidos (v1)

- No es un motor HTML completo: sin `float`, `flex`, imágenes, `colspan`/`rowspan`, ni CSS
  externo. Cubre el subconjunto que producen estas conversiones docx→HTML.
- Padding/anchos absolutos y márgenes negativos se aproximan; el ancho de columna sí se honra.
