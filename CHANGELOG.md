# Changelog

Todas las notas relevantes de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/); versionado [SemVer](https://semver.org/lang/es/).

## [Sin liberar]

### Añadido

- CI en GitHub Actions para cada PR y push a `beta` y `main`: typecheck, lint, formato y tests.
- Hooks de git (`.githooks/`) que exigen Conventional Commits y bloquean commits directos sobre `main` y `beta`, y guía de contribución con el flujo de ramas.

### Cambiado

- El repositorio se mudó de GitLab a GitHub (`acertijosapps/react-native-md-document`): `repository` y `bugs` de `package.json` y `source` del podspec, que ahora usa el tag `vX.Y.Z`.

### Corregido

### Eliminado

## [1.2.0] - 2026-10-25

### Añadido

- Modo libro: en tablets y plegables en horizontal, el documento se muestra en dos páginas enfrentadas con volteo de página. Props `dualPage` (activo por defecto), `dualPageMinWidth` y `spreadGap` (separación para la bisagra de un plegable).
- `onPageChange` recibe un cuarto argumento, `pagesPerView` (1 o 2).
- Secciones «Modo libro» y «Plegables» en el README, con capturas.

### Corregido

- Paginación en tablets: ya no queda atascada ni deja páginas en blanco por eventos de layout tardíos.
- El modo libro solo se activa en pantallas de tablet o plegable (lado corto de la ventana de al menos 600 dp); un teléfono en horizontal sigue mostrando una página.

## [1.1.2] - 2026-10-13

### Cambiado

- `author`, correo y `homepage` de AcertijosApps en `package.json` y el podspec.

## [1.1.1] - 2026-09-19

### Añadido

- `homepage`, `repository` y `bugs` en `package.json`, y podspec alineado.

## [1.1.0] - 2026-09-19

### Añadido

- Carga del documento por `source` con estados de carga y error (`onLoad*`, `renderLoading`, `renderError`).

## [1.0.1] - 2026-09-19

### Cambiado

- README con el nombre del paquete publicado y las imágenes por URL absoluta, para que rendericen en npm; `media/` se incluye en el paquete.
- Podspec renombrado a `react-native-md-document.podspec`.
- Keywords `android`, `ios` y `zoom`.

## [1.0.0] - 2026-09-19

### Añadido

- Primera versión pública: visor de Markdown como PDF con volteo de página, zoom, resaltados persistentes, lectura en voz alta (TTS) y tokens de color claro/oscuro, con almacenamiento, fuente y voz inyectables.
