# react-native-document

Visor de documentos **Markdown-como-PDF** para React Native: documento inmutable, con paso
de hoja animado, zoom, subrayado persistente, text-to-speech con resaltado sincronizado y
tema claro/oscuro. Sin librerías de terceros para el contenido (parser y render propios); el
storage, el origen del documento y el motor de voz son inyectables.

## Features

- **Render Markdown**: encabezados, párrafos, listas, blockquote, code, `hr`, estilos en
  línea (negrita, cursiva, código, tachado, enlaces) y **tablas** GFM.
- **Paso de hoja** animado (Reanimated + Gesture Handler), un gesto = una página.
- **Zoom** por pinch + arrastre, compuesto con el flip y el tap.
- **Subrayado** por palabra, **persistente entre sesiones** (storage inyectable).
- **Text-to-speech** con resaltado de la palabra hablada, incluso dentro de tablas.
- **Tema claro/oscuro** (`auto` sigue el SO) y tokens de tema personalizables.
- **Orígenes**: URL remota, ruta local del dispositivo, ruta del proyecto.

## Instalación

```sh
npm install react-native-document
# peer dependencies
npm install react-native-gesture-handler react-native-reanimated
```

`react-native-reanimated` requiere su plugin de Babel (último en la lista):

```js
// babel.config.js
module.exports = {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
};
```

La app debe envolver la raíz en `GestureHandlerRootView`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
    return <GestureHandlerRootView style={{ flex: 1 }}>{/* … */}</GestureHandlerRootView>;
}
```

Para el **text-to-speech nativo**, el módulo `DocumentSpeech` se autoenlaza:

```sh
cd ios && pod install    # iOS
# Android: autolinking por gradle
```

## Quick start

```tsx
import { DocumentViewer, parse } from 'react-native-document';

const doc = parse('# Hola\n\nUn documento **Markdown**.');

export function Viewer() {
    return <DocumentViewer document={doc} />;
}
```

## Orígenes del documento

`useDocumentSource` acepta las tres formas de origen:

```tsx
import { DocumentViewer, useDocumentSource } from 'react-native-document';

function Screen() {
    // Proyecto (bundled): string o { markdown }
    const a = useDocumentSource({ markdown: MD_STRING });
    // URL remota: fetch integrado
    const b = useDocumentSource({ uri: 'https://example.com/doc.md' });
    // Ruta local del dispositivo
    const c = useDocumentSource({ uri: 'file:///…/doc.md' });

    const { document, isLoading, error, reload } = a;
    if (!document) {
        return null; // isLoading / error disponibles
    }
    return <DocumentViewer document={document} />;
}
```

Para orígenes que `fetch` no cubre (asset del bundle, `file://` en Android) se inyecta un
lector — la librería **no fuerza** `expo-file-system` ni `expo-asset`:

```tsx
import * as FileSystem from 'expo-file-system';

useDocumentSource(
    { uri: 'file:///…/doc.md' },
    { readUri: (uri) => FileSystem.readAsStringAsync(uri) },
);
```

Un string sin esquema se trata como Markdown crudo; con `http(s)://`, `file:`, `content:`,
`asset:` o que empiece con `/`, como URI.

## Subrayado persistente

```tsx
import {
    DocumentViewer,
    createKeyValueHighlightStore,
    useHighlights,
} from 'react-native-document';
import AsyncStorage from '@react-native-async-storage/async-storage';

const store = createKeyValueHighlightStore(AsyncStorage); // sirve para AsyncStorage/MMKV

function Screen({ document }) {
    const { highlights, toggleWordAt } = useHighlights({
        docId: 'doc-1',
        plainText: document.plainText,
        store,
    });
    return (
        <DocumentViewer
            document={document}
            highlights={highlights}
            onWordPress={toggleWordAt}
        />
    );
}
```

El subrayado se guarda como `{ id, start, end, color? }` en el espacio de offsets de la
proyección del documento. Como el documento es **inmutable**, ese espacio es estable entre
sesiones, tamaños de pantalla y re-render. Sin store, los subrayados viven solo en memoria.

## Text-to-speech

```tsx
import {
    DocumentViewer,
    createNativeSpeechEngine,
    createMockSpeechEngine,
    useTextToSpeech,
} from 'react-native-document';

// Motor nativo propio (AVSpeechSynthesizer / android TextToSpeech).
// Cae al mock si el módulo nativo no está enlazado.
function makeEngine() {
    try {
        return createNativeSpeechEngine();
    } catch {
        return createMockSpeechEngine({ wordsPerMinute: 200 });
    }
}
const engine = makeEngine();

function Screen({ document }) {
    const tts = useTextToSpeech({ plainText: document.plainText, engine });
    return (
        <>
            <DocumentViewer
                document={document}
                active={tts.activeRange}
            />
            <Button
                title={tts.status === 'speaking' ? 'Pausa' : 'Leer'}
                onPress={() => (tts.status === 'speaking' ? tts.pause() : tts.play())}
            />
        </>
    );
}
```

`activeRange` es la palabra hablada en offsets de proyección; el visor la resalta con
`colors.activeWord`. El motor de voz es inyectable (`SpeechEngine`): usa el nativo propio, el
mock, o el tuyo.

## Tema claro / oscuro

```tsx
<DocumentViewer
    document={doc}
    colorScheme="auto" // 'auto' (default, sigue el SO) | 'light' | 'dark'
    theme={{ colors: { link: '#c026d3' } }} // override parcial sobre la base resuelta
/>
```

`useDocTheme(colorScheme, override)`, `lightTheme`, `darkTheme` y `mergeTheme` están
exportados para teñir tu propio chrome con la misma resolución.

## Gestos

- **Swipe horizontal** → pasa de página (flip).
- **Pinch** → zoom; con zoom, **arrastrar** mueve la página (el flip se bloquea).
- **Tap** en una palabra → `onWordPress(offset)`.

`activeOffsetX`/`Y` hacen que el pan solo capture arrastre real, dejando pasar el tap.

## Markdown soportado

Encabezados ATX (`#`…`######`), párrafos, listas ordenadas/no-ordenadas (anidadas),
blockquote, code fence, regla horizontal, tablas GFM, y estilos en línea `**negrita**`,
`*cursiva*`, `` `código` ``, `~~tachado~~`, `[enlace](url)`.

**HTML embebido**: documentos con HTML inline (div/p/table/strong/span con `style`) se
detectan y parsean como subconjunto HTML, honrando color, fondo, centrado, tamaño de fuente y
anchos de columna. Útil para conversiones docx→HTML de alta fidelidad. Ver
[`docs/architecture/09-html.md`](docs/architecture/09-html.md).

**Límites (v1)**: sin imágenes ni enlaces de navegación; `matchDelim` usa el primer cierre
(no left/right-flanking de CommonMark); un bloque más alto que la página ocupa su propia hoja;
el HTML es un subconjunto (sin `colspan`, imágenes ni CSS externo).

## API

| Export | Tipo | Descripción |
|---|---|---|
| `parse(source)` | fn | Markdown → `MDDocument` (con `plainText`) |
| `DocumentViewer` | componente | Visor completo: paginación + flip + zoom |
| `MarkdownView` | componente | Render simple con scroll (sin paginar) |
| `useDocumentSource(source, opts?)` | hook | Carga URL / local / proyecto |
| `useHighlights(params)` | hook | Estado + persistencia de subrayados |
| `createKeyValueHighlightStore(kv)` | fn | Store sobre `{getItem,setItem}` |
| `createMemoryHighlightStore()` | fn | Store en memoria (tests/demo) |
| `useTextToSpeech(params)` | hook | Reproducción + `activeRange` |
| `createNativeSpeechEngine()` | fn | Motor de voz nativo propio |
| `createMockSpeechEngine(opts?)` | fn | Motor de voz por timer (sin audio) |
| `useDocTheme` · `lightTheme` · `darkTheme` · `mergeTheme` | tema | Resolución y paletas |

**Props de `DocumentViewer`**: `document`, `colorScheme?`, `theme?`, `highlights?`,
`active?`, `onWordPress?`, `onPageChange?(index, count)`, `maxScale?`.

## Arquitectura

La pieza clave es la **proyección** `MDDocument.plainText`: la concatenación de todo el texto
visible en orden de lectura. Cada token de texto lleva `[start, end)` en ese espacio, con la
invariante `token.text === plainText.slice(start, end)`. Sobre ella se apoyan highlight y TTS.
Detalle por módulo en [`docs/architecture/`](docs/architecture/).

Módulos: `parser`, `render`, `pagination`, `flip`, `highlights`, `source`, `speech`.

## Desarrollo

```sh
npm test          # parser, paginación, highlights, source, speech, tema
npm run typecheck
npm run lint
npm run format
```

El ejemplo ejecutable está en [`example/`](example/) (Expo).

## Licencia

MIT
