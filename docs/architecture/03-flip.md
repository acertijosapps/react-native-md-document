# Flip (paso de hoja)

## Modelo de animación

El flip monta sobre la paginación sin tocar su cálculo. `DocumentViewer` mide una vez,
obtiene `pages` y renderiza `PageFlipper`, que anima la transición entre `pageIndex` y
`pageIndex ± 1`.

La animación es un giro `rotateY` con perspectiva alrededor del eje vertical central de la
hoja (card-flip), no un curl 3D de dos caras. Es la variante robusta y simétrica; el curl
realista con dos semipáginas queda para v2.

## Gesto → progreso

Un `Gesture.Pan` (RNGH) escribe un `progress` (shared value de Reanimated) en `[-1, 1]`:
`translationX / width`. Negativo = arrastrar a la izquierda = página siguiente; positivo =
anterior. Se bloquea la dirección sin destino (primera/última página).

`activeOffsetX([-12, 12])` + `failOffsetY([-16, 16])` hacen que el Pan solo se active con
arrastre horizontal, dejando pasar el **tap por palabra** (onPress del texto) y el scroll
vertical.

## Composición de capas

- Debajo: la página destino (`next` cuando `progress < 0`, `prev` cuando `> 0`), opacidad
  animada según el signo; `pointerEvents="none"`.
- Encima: la página actual, con `rotateY` interpolado `[-1,0,1] → [-165°,0,165°]` y
  `backfaceVisibility: 'hidden'`: al pasar de 90° desaparece y revela la de abajo.

Las páginas son **opacas** (`theme.colors.pageBackground`) para que la de arriba tape a la
de abajo hasta el giro.

## Commit / spring-back

En `onEnd`, se confirma el giro si `|progress| > 0.5` o `|velocityX| > 800`. Al confirmar,
`progress` va con `withTiming` a `±1` y en el callback `runOnJS(commit)` actualiza el
`pageIndex` del padre; un efecto resetea `progress` a 0 cuando cambia el índice. En el
frame del swap la página de arriba está oculta y la de abajo (mismo contenido que la nueva
actual) ya cubre la pantalla, así que no hay parpadeo. Sin confirmar, `withSpring(0)`.

## Requisito del consumidor

La app debe envolver la raíz en `GestureHandlerRootView` y tener el plugin de Reanimated en
`babel.config.js`. Son peerDependencies (`react-native-gesture-handler`,
`react-native-reanimated`).

## Límites conocidos (v1)

- Card-flip central (no curl de dos caras); sin sombra dinámica del pliegue.
- Se anima solo entre páginas adyacentes (no salto directo animado a una página lejana).
