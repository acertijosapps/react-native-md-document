# Paginación

## Por qué es dirigida por medición

Markdown es un flujo continuo sin páginas. En React Native la altura real de un bloque
solo se conoce **después** del layout, así que la paginación no puede calcularse desde el
texto: hay que medir y luego empacar.

## Dos capas separadas

- **`paginate(heights, pageHeight)`** — algoritmo puro. Empaca índices de bloque en páginas
  de forma greedy hasta exceder `pageHeight`. Es determinista y se prueba en Node sin RN
  (`src/pagination/__tests__/paginate.test.ts`).
- **`usePagination` + `PaginatedDocument`** — la parte RN: una capa de medición oculta
  (posición absoluta, `opacity: 0`) renderiza cada bloque top-level con `onLayout`, junta
  las alturas y, cuando están todas, corre `paginate`. Luego desmonta la capa y renderiza
  solo la página actual.

## Contrato de alturas

Cada bloque se mide envuelto en un `View` con `onLayout`; yoga incluye el `marginBottom`
del bloque en la altura del envoltorio, así que la altura medida **ya incorpora el
espaciado** entre bloques. Por eso `paginate` no vuelve a sumar espaciado. La capa de
medición y la de página usan el **mismo ancho de contenido** y el mismo padding, condición
para que las alturas coincidan.

## Límites conocidos (v1)

- **El bloque es atómico**: un bloque más alto que la página ocupa su propia página y se
  desborda. Cortar un párrafo entre páginas requiere medición por línea
  (`onTextLayout` de `Text` devuelve `lines[]` con `y`/`height`); queda para v2.
- Al cambiar tamaño de viewport o tema, se re-mide desde cero (efecto en `usePagination`).

## Siguiente

`PaginatedDocument` expone `pageIndex` controlado y `onPagesChange`. El **flip** montará
sobre esto: anima la transición entre `pageIndex` y `pageIndex ± 1` con Reanimated + RNGH,
sin tocar el cálculo de páginas.
