# Text-to-speech

## Arquitectura engine-agnóstica

La librería no habla directo con el motor de voz del SO; define un puerto y deja que el
consumidor inyecte el engine (mismo patrón que storage, source y readUri):

    interface SpeechEngine {
        speak(text, handlers: { onBoundary?, onDone?, onError? }, options?): void;
        stop(): void;
    }

`onBoundary(charIndex, charLength)` reporta el rango de la palabra hablada, en offsets
**relativos a la utterance** (UTF-16, igual que JS).

## Sincronización con el resaltado

`useTextToSpeech({ plainText, engine, options })`:

1. `segmentUtterances(plainText)` parte la proyección en utterances por línea (bloque/celda),
   cada una con su offset absoluto en el espacio de proyección.
2. Al hablar la utterance `i`, `onBoundary` se mapea con `boundaryToRange` a un `ActiveRange`
   absoluto: `{ start: utt.start + charIndex, end: … }`.
3. Ese `ActiveRange` se pasa como `active` a `DocumentViewer`; el render lo pinta con
   `colors.activeWord`. Como las celdas de tabla también llevan offsets, la palabra activa se
   resalta **dentro de tablas** igual que en párrafos.

Devuelve `{ status, activeRange, index, count, play, pause, resume, stop }`. `pause` detiene y
recuerda la utterance; `resume` la reinicia (v1).

## Engines provistos

- **`createMockSpeechEngine({ wordsPerMinute })`** — recorre palabras con un timer y emite
  `onBoundary`. Sin audio ni dependencias: sirve para tests y para ver la sincronización.
- **`createNativeSpeechEngine()`** — envuelve el módulo nativo propio `DocumentSpeech`
  (sin librerías de terceros):
  - **iOS**: `AVSpeechSynthesizer` + delegate `willSpeakRangeOfSpeechString` → evento
    `DocumentSpeech.boundary`; `didFinish` → `DocumentSpeech.done`.
  - **Android**: `TextToSpeech` + `UtteranceProgressListener.onRangeStart` (API 26+).
  Lanza un error claro si el módulo no está enlazado (usar el mock o `pod install`/gradle).

## Enlace del módulo nativo

El módulo se autoenlaza como cualquier paquete RN: la app depende de `react-native-document`,
`pod install` toma `react-native-document.podspec` (iOS) y gradle toma `android/`
(`react-native.config.js` declara el `DocumentSpeechPackage`). No hay dependencias de terceros.

## Límites conocidos (v1)

- El visor no auto-avanza de página al leer; la palabra activa puede quedar en una hoja no
  visible. Auto-flip para seguir la lectura es una mejora futura.
- `pause`/`resume` reinician la utterance actual (no reanudan a mitad de palabra).
