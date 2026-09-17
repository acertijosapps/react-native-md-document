# Parser · IR y espacio de offsets

## Por qué existe la proyección (`plainText`)

El documento es **inmutable** (no editable). Esa propiedad se explota para unificar
highlight y text-to-speech bajo un mismo sistema de coordenadas.

El parser produce, además del árbol de bloques, una **proyección**: `plainText`, la
concatenación de todo carácter visible en orden de lectura. Cada token de texto lleva
`[start, end)` en ese espacio.

## Invariante keystone

Para todo nodo que carga `start`/`end` (`TextToken` y `CodeBlock`):

    node.text === document.plainText.slice(node.start, node.end)

La prueba vive en `src/parser/__tests__/parser.test.ts` y se corre en cada gate.

## Consecuencias de diseño

- **Highlight**: se persiste como `{ docId, start, end, color }` en espacio de proyección.
  Al ser el documento inmutable, ese espacio es estable entre re-render, tamaños de
  pantalla y sesiones — sin coordenadas de pantalla.
- **TTS**: se alimenta `plainText` (o subcadenas por bloque) al sintetizador; el callback
  de rango del SO devuelve offsets en ese mismo string, que se resaltan reusando la
  maquinaria del highlight.
- Los offsets no se solapan y van ordenados; los separadores entre bloques (`\n`) no
  pertenecen a ningún token, por lo que rebanar el rango de un token devuelve exactamente
  su texto.

## Límites conocidos (v1)

Sin tablas, imágenes ni enlaces de navegación. `matchDelim` toma el primer cierre (no
implementa left/right-flanking de CommonMark). Suficiente para documentos de lectura.
