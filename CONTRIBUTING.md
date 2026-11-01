# Contribuir

Las contribuciones son bienvenidas. Mantén los cambios pequeños, enfocados y trazables.

## Flujo de desarrollo

Usa la versión de Node de [`.nvmrc`](./.nvmrc) e instala las dependencias desde la raíz:

```sh
npm install
```

`npm install` también cablea los hooks de git del repositorio (`core.hooksPath` → `.githooks/`).

El proyecto de ejemplo vive en `example/` (Expo) y consume el código de `src/` directamente, así que los cambios en TypeScript se ven con recarga en caliente.

### Comandos

```sh
npm run typecheck     # tipos con TypeScript
npm run lint          # ESLint
npm run format        # Prettier (escribe)
npm run format:check  # Prettier (solo verifica)
npm test              # pruebas unitarias (node:test)
```

## Modelo de ramas

Dos ramas permanentes, ambas protegidas:

- **`main`**: producción. Sin pushes directos; los cambios entran solo con un Pull Request aprobado.
- **`beta`**: candidata a release.

Ramas temporales, siempre creadas desde `beta`, en kebab-case:

- `feat/<nombre>` · `fix/<nombre>` · `chore/<nombre>` → Pull Request **a `beta`**, se borran al hacer merge.
- `hotfix/<nombre>` es la única excepción: sale de `main`, va por PR a `main` y luego se integra de vuelta en `beta`.

Una rama = un cambio enfocado.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/es/):

```
<tipo>(<alcance opcional>)(!): <descripción en imperativo>
```

Tipos: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`.

Correspondencia con [SemVer](https://semver.org/lang/es/): `feat` → MINOR, `fix` → PATCH, cambio incompatible (`feat!` o `BREAKING CHANGE:`) → MAJOR.

Los hooks de [`.githooks/`](./.githooks) corren en cada commit:

- `commit-msg` rechaza mensajes que no sean Conventional Commits.
- `pre-commit` bloquea commits directos sobre `main` y `beta`.

Bypass puntual (no recomendado): `git commit --no-verify`.

## Changelog

Todo cambio que afecte el comportamiento actualiza [`CHANGELOG.md`](./CHANGELOG.md) ([Keep a Changelog](https://keepachangelog.com/es-ES/)): agrega la entrada bajo `## [Sin liberar]` en la categoría correcta (Añadido · Cambiado · Corregido · Eliminado).

## Pull Requests

Al abrir un PR:

- Apunta a `beta` (o a `main` solo en `hotfix`).
- Mantenlo pequeño y centrado en un cambio.
- Asigna al menos un revisor; el merge requiere su aprobación.
- Los gates deben estar en verde: `npm run typecheck`, `npm run lint`, `npm run format:check` y `npm test`. El CI ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) los corre en cada PR hacia `beta` o `main`.
- Incluye la entrada de `CHANGELOG.md`.

## Release (`beta` → `main`)

1. Confirma que los gates están en verde en `beta`.
2. Decide el incremento SemVer según los commits desde el último tag.
3. Actualiza `version` en `package.json`.
4. Renombra la sección `## [Sin liberar]` del changelog a `## [X.Y.Z] - AAAA-MM-DD` y abre una nueva vacía.
5. Abre el PR `beta` → `main` y haz merge.
6. Crea el tag `vX.Y.Z` sobre `main` y súbelo (`git push origin vX.Y.Z`).
7. Publica desde la raíz del repo con `npm publish` (el README y el `package.json` quedan congelados por versión).
