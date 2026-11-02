# .githooks — versioning enforcement

Git-native hooks (POSIX, no dependencies). They run for **every** commit, whether made by a
person or by an agent, and enforce the team's versioning rules.

- **`commit-msg`** — rejects the commit if the message is not a Conventional Commit
  (`<type>(<scope>)(!): description`). Warns (does not block) when the type does not match the
  branch prefix.
- **`pre-commit`** — blocks direct commits on `main` or `beta` (development happens on
  temporary branches). Escape for release promotion: `ATENEA_ALLOW_PROTECTED=1 git commit ...`.

## Activation

`core.hooksPath` is a per-clone local setting (it is not versioned), so each clone enables it
once. The project automates it with a `prepare` script in `package.json`:

```json
"scripts": { "prepare": "git config core.hooksPath .githooks || true" }
```

That way every `npm install` wires it up. Manually, if needed:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/*
```

One-off bypass of a hook (not recommended): `git commit --no-verify`.
