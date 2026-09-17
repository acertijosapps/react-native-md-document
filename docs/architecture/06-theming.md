# Tema claro / oscuro

## Modelo

Dos paletas completas, `lightTheme` y `darkTheme`, con los mismos campos de no-color
(tamaños, espaciado). El consumidor elige con el prop `colorScheme`:

- `'light'` / `'dark'` — fuerza la paleta.
- `'auto'` (default) — sigue el tema del SO vía `useColorScheme()`.

Resolución en `useDocTheme(colorScheme, override)`:

    mode  = colorScheme === 'auto' ? (useColorScheme() ?? 'light') : colorScheme
    base  = mode === 'dark' ? darkTheme : lightTheme
    return mergeTheme(override, base)

El override `theme?: Partial<DocTheme>` se aplica **encima** de la base resuelta, así se puede
ajustar un color puntual sin perder el resto de la paleta del modo activo.

`MarkdownView`, `PaginatedDocument` y `DocumentViewer` aceptan `colorScheme` y `theme`.

## Notas

- `mergeTheme(override, base?)` toma la base como segundo argumento (default `lightTheme`),
  por eso el comportamiento previo (sin `colorScheme`) no cambia.
- La página es opaca (`colors.pageBackground`) en ambos modos, requisito del flip.
- El example trae un botón que cicla `auto → light → dark` y tiñe también su propio chrome
  (header/fondo) con la misma resolución, como referencia de integración.
