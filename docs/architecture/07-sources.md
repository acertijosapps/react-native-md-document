# Orígenes de documento

## API

`useDocumentSource(source, options?)` devuelve
`{ document, markdown, isLoading, error, reload }`.

`source: DocumentSource` admite tres formas, cubriendo los tres orígenes pedidos:

| Origen | Forma | Cómo se carga |
|---|---|---|
| **Proyecto** (bundled) | `{ markdown: string }` — o un string sin esquema | Se parsea en el acto, sin red. Empaquetá el `.md` como string (import) o resolvé el asset a texto y pasalo aquí. |
| **URL remota** | `{ uri: 'https://…' }` — o un string con esquema | `fetch(uri)` integrado (sin dependencias). |
| **Ruta local del dispositivo** | `{ uri: 'file:///…' }` / `content://…` / `/abs/path` | `fetch` en iOS suele resolver `file://`; en Android pasá `options.readUri` respaldado por `expo-file-system`. |

Detección de string: `isUri()` trata `http(s)/file/content/asset:` y rutas que empiezan con `/`
como URI; cualquier otro string es Markdown crudo.

## readUri inyectable

Para orígenes que `fetch` no cubre (asset del bundle, `file://` en Android) se inyecta un lector:

    useDocumentSource(
        { uri: 'file:///…/a-001.md' },
        { readUri: (uri) => FileSystem.readAsStringAsync(uri) },
    );

Así la librería **no fuerza** `expo-file-system` ni `expo-asset`: el consumidor decide.

## Notas de implementación

- La recarga se dispara con `reload()` o cuando cambia la firma del origen
  (`sourceSignature`, que combina uri+headers o el contenido markdown). El callback y el
  lector van por `ref` para no re-disparar el fetch por identidad.
- El origen markdown se resuelve de forma síncrona (sin parpadeo); el remoto expone
  `isLoading`/`error`.

## Tablas (soporte añadido para este documento)

El `A-001.docx` (Constitución, Art. 1º) usa tablas de dos columnas. Se añadió soporte GFM:

- Parser: detecta fila de encabezado + separador `| --- | --- |`, produce `TableBlock`
  (`header`, `rows`, `align`). Cada celda lleva sus `inlines` con offsets de proyección, así
  highlight y TTS funcionan dentro de celdas.
- Render: grilla con bordes (`theme.colors.rule`), encabezado en negrita, alineación por
  columna. La tabla es un bloque atómico para la paginación.

Conversión docx→md: los `.docx` sin `pStyle` se mapean por heurística (negrita + tamaño →
nivel de encabezado), runs adyacentes del mismo formato se fusionan, y las tablas salen como
tablas GFM. El script vive fuera de la librería (herramienta de autor, no runtime).
