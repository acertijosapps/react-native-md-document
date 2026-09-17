# Highlights persistentes

## Espacio de offsets (recordatorio)

Un highlight es `{ id, start, end, color? }` donde `start`/`end` son offsets en la
proyección `plainText` del documento. Como el documento es inmutable, ese espacio es
estable entre sesiones, tamaños de pantalla y re-render (ver `01-parser-ir.md`). Por eso
persistir un highlight es persistir tres números, sin coordenadas de pantalla.

## La lib no fuerza storage

La feature es **storage-agnóstica**. Define un puerto:

    interface HighlightStore {
        load(docId): Promise<Highlight[]> | Highlight[];
        save(docId, highlights): Promise<void> | void;
    }

El consumidor inyecta la implementación. Se proveen dos fábricas:

- `createKeyValueHighlightStore(kv, keyPrefix?)` — sobre cualquier `{ getItem, setItem }`
  (AsyncStorage, MMKV con wrapper, etc.). Serializa a JSON bajo `keyPrefix + docId` y
  tolera payload faltante o corrupto (devuelve `[]`, filtra entradas inválidas).
- `createMemoryHighlightStore()` — en memoria, para demo y tests, sin dependencia nativa.

Ningún módulo de storage entra como dependencia de la librería. El `example/` lo cablea con
`@react-native-async-storage/async-storage`.

## Hook

`useHighlights({ docId, plainText, store?, color? })` devuelve
`{ highlights, isLoaded, toggleWordAt, add, remove, clear }`.

- Carga por `docId` al montar; si no hay store, arranca vacío.
- Persiste en cada cambio, **sin re-guardar el valor recién cargado** (guard `skipSaveRef`).
- `toggleWordAt(offset)` quita el highlight que cubre el offset, o crea uno por palabra
  usando `wordBoundsAt(plainText, offset)`.

## Verificado

En simulador: subrayar palabra → matar la app → relanzar → el subrayado persiste (leído de
AsyncStorage en `load`).

## Límites conocidos (v1)

- Highlights alineados a palabra (por `toggleWordAt`). Sub-palabra requeriría selección por
  arrastre (RNGH) y troceo por carácter; el modelo de datos ya lo soporta.
- `save` reescribe el arreglo completo por `docId` en cada cambio; suficiente para volúmenes
  de lectura. Para miles de highlights conviene un store incremental (SQLite).
