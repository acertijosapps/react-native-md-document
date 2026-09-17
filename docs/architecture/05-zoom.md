# Zoom y composición de gestos

## El problema

Cuatro interacciones compiten en la misma superficie: pinch (zoom), pan (flip **o** mover),
tap (subrayar palabra) y el scroll implícito. La clave es que **pan cambia de rol según la
escala**.

## Solución

Todo vive en `PageFlipper`, compuesto como `Gesture.Simultaneous(pinch, pan)`; el tap-palabra
pasa por el `onPress` del texto (RN), que no necesita el árbol RNGH.

**Pinch** (`Gesture.Pinch`): escribe `scale` en `[1, maxScale]` (`maxScale` prop, default 3).
En `onEnd`, si quedó en ~1 hace reset animado a escala 1 y traslación 0; si no, guarda escala
y clampa la traslación a los bordes.

**Pan** (`Gesture.Pan`, un solo gesto que ramifica por `scale.value`):
- **`scale > 1`** → mueve el contenido (`transX`/`transY`), clampeado a
  `±(width·(scale−1)/2)` y `±(height·(scale−1)/2)`. **No** toca `progress`, así el flip queda
  bloqueado mientras hay zoom.
- **`scale === 1`** → maneja el flip como antes (progress, commit por umbral/velocidad).

Umbrales `activeOffsetX/Y([-12,12])`: el pan solo se activa con arrastre real, dejando pasar
el tap-palabra.

## Transform de la página actual

```
transform: [
  { translateX }, { translateY },
  { perspective: 1200 }, { rotateY },
  { scale },
]
```

Zoom y flip son mutuamente excluyentes por la compuerta de escala (con zoom, `rotateY` = 0;
sin zoom, `scale` = 1 y `translate` = 0), así que no se pisan. Al cambiar de página se
resetean todos los shared values.

## Verificado

En simulador: pinch-out amplía; pan con zoom mueve y **no** pasa de página; pinch-in vuelve a
escala 1; el subrayado persiste a lo largo de todo.

## Límites conocidos (v1)

- Zoom anclado al **centro** (no al punto focal del pinch); un zoom focal-exacto es refinamiento.
- Sin doble-tap para zoom/reset (evita conflicto con el tap-palabra); pinch-in resetea.
- Con zoom no se pasa de página; hay que volver a escala 1 primero.
