# Contributing

Contributions are welcome. Keep changes small, focused and traceable.

## Development workflow

Use the Node.js version in [`.nvmrc`](./.nvmrc) and install the dependencies from the root:

```sh
npm install
```

`npm install` also wires the repository git hooks (`core.hooksPath` → `.githooks/`).

The example app lives in `example/` (Expo) and consumes the code in `src/` directly, so TypeScript changes hot-reload there.

### Commands

```sh
npm run typecheck     # type-check with TypeScript
npm run lint          # lint with ESLint
npm run format        # format with Prettier (writes)
npm run format:check  # check formatting with Prettier
npm test              # run the unit tests (node:test)
```

## Branching model

Two permanent branches, both protected:

- **`main`**: production. No direct pushes; changes land only through an approved Pull Request.
- **`beta`**: release candidate.

Temporary branches, always created from `beta`, in kebab-case:

- `feat/<name>` · `fix/<name>` · `chore/<name>` · `docs/<name>` → Pull Request **into `beta`**, deleted after merge.
- `hotfix/<name>` is the only exception: created from `main`, PR into `main`, then back-merged into `beta`.

One branch = one focused change.

## Commits

Write commit messages and Pull Requests in English, following [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>)(!): <imperative description>
```

Types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`.

[SemVer](https://semver.org/) mapping: `feat` → MINOR, `fix` → PATCH, breaking (`feat!` or `BREAKING CHANGE:`) → MAJOR.

The git hooks in [`.githooks/`](./.githooks) run for every commit:

- `commit-msg` rejects messages that are not Conventional Commits.
- `pre-commit` blocks direct commits on `main` and `beta`.

One-off bypass (not recommended): `git commit --no-verify`.

## Changelog

Any change that affects behavior updates [`CHANGELOG.md`](./CHANGELOG.md) ([Keep a Changelog](https://keepachangelog.com/en/1.1.0/)): add the entry under `## [Unreleased]` in the right category (Added · Changed · Fixed · Removed).

## Pull Requests

When opening a PR:

- Target `beta` (or `main` only for `hotfix`).
- Keep it small and focused on one change.
- Request a review when there is another maintainer. Approvals are not enforced while the repository has a single maintainer; the PR and a green CI check are always required.
- Gates must be green: `npm run typecheck`, `npm run lint`, `npm run format:check` and `npm test`. CI ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) runs them on every PR to `beta` or `main`.
- Include the `CHANGELOG.md` entry.

## Releasing (`beta` → `main`)

1. Confirm the gates are green on `beta`.
2. Decide the SemVer bump from the commits since the last tag.
3. Update `version` in `package.json`.
4. Rename the `## [Unreleased]` section of the changelog to `## [X.Y.Z] - YYYY-MM-DD` and open a fresh empty one.
5. Open the `beta` → `main` PR and merge it.
6. Tag `vX.Y.Z` on `main` and push it (`git push origin vX.Y.Z`).
7. Publish from the repository root with `npm publish` (the README and `package.json` are frozen per version).
