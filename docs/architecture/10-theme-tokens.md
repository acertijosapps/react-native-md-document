# Sub-estándar de color por tema (theme tokens)

## Problema

Un documento con HTML embebido que hardcodea colores (`background:#FFFFFF`, `color:#000`,
`color:#006847`) **no se adapta** al tema oscuro. La fidelidad de la página pelea con el
soporte de tema.

## Solución: tokens en el archivo, resueltos por el visor

El archivo declara colores **semánticos** con `var(--token)` en vez de literales. Los
literales siguen fijos (retrocompatible); mezclar ambos es válido.

    <div style="background: var(--accent); color: var(--on-accent);">…barra…</div>
    <p style="color: var(--accent-text); font-style: italic;">…nota…</p>

## Quién define cada token

La librería **no adivina** colores de marca. Divide los tokens en dos:

**1. Tokens base (los define la librería, de su propia paleta light/dark):**

| Token | DocTheme |
|---|---|
| `--page-bg` / `--bg` / `--background` | `colors.pageBackground` |
| `--text` / `--fg` | `colors.text` |
| `--heading` | `colors.heading` |
| `--rule` | `colors.rule` |
| `--link` | `colors.link` |
| `--code` | `colors.code` |
| `--highlight` | `colors.highlight` |

Se adaptan solos porque son la paleta del tema activo. No hay colores inventados.

**2. Tokens de marca/custom (los provee el consumidor por prop):**

Cualquier otro token (`--accent`, `--on-accent`, `--accent-text`, …) viene del prop
`colorTokens` de `DocumentViewer` / `MarkdownView` / `PaginatedDocument`, con valores por modo:

    <DocumentViewer
        document={doc}
        colorScheme="auto"
        colorTokens={{
            light: { accent: '#006847', 'on-accent': '#ffffff', 'accent-text': '#006847' },
            dark:  { accent: '#0f5c43', 'on-accent': '#ffffff', 'accent-text': '#4ecb96' },
        }}
    />

Un token que no es base **ni** está en `colorTokens` del modo activo se **omite** (sin color;
la librería nunca inventa uno).

## Resolución

`resolveThemeColor(value, theme)` (en `render/theme.ts`): si el valor es `var(--x)`, busca `x`
en los tokens base (→ `theme.colors[…]`), luego en `theme.tokens` (los del prop, resueltos por
modo dentro de `useDocTheme`); si no aparece, devuelve `undefined`. Se aplica en `InlineText` y
`BlockList`. El `theme` ya lleva la paleta y los `tokens` del modo activo, así que cambiar de
tema re-resuelve todo sin threading extra.

## Cómo adoptarlo

- En el generador docx→HTML: emitir `var(--token)` en vez de literales de marca.
- En la app: pasar `colorTokens={{ light, dark }}` con los colores de marca por modo.
- Ver `example/App.tsx` (`BRAND_TOKENS`) y `example/assets/a-001.md` como referencia. Un
  archivo que siga usando literales se ve en claro fijo — no rompe, solo no se adapta.
