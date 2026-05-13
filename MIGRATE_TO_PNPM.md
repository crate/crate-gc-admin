# Migrating From Yarn to pnpm

This guide is for developers who already worked on the Yarn-based version of this repo.

## What changed

- Package manager: Yarn -> pnpm
- Node version: standardized to `22.13.1`
- Lockfile: `yarn.lock` -> `pnpm-lock.yaml`

## One-time local migration

From the repo root, run:

```bash
nvm install 22.13.1
nvm use 22.13.1
corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm --version
rm -rf node_modules
pnpm install --frozen-lockfile
```

If `pnpm` is not available after setup, run:

```bash
corepack prepare pnpm@10.33.4 --activate
```

## Daily commands (Yarn -> pnpm)

- Install deps: `yarn install` -> `pnpm install`
- Start dev server: `yarn start` -> `pnpm start`
- Lint: `yarn lint` -> `pnpm lint`
- Build app: `yarn build` -> `pnpm build`
- Build library: `yarn build-lib` -> `pnpm build-lib`
- Test: `yarn test` -> `pnpm test`

## Important notes for this repo

- Use Node `22.13.1` (see `.nvmrc`).
- Do not run `yarn` in this repository after migration.
- `pnpm-lock.yaml` is the source of truth for dependency resolution.
- If install-script behavior was previously controlled by Yarn config, check `.npmrc` in this repo for the current script policy.

## Validation checklist after switching

Run the following and confirm all pass:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm build-lib
pnpm test
```

## Troubleshooting

- Wrong Node version:
  - `node -v` should report `v22.13.1`.
  - Run `nvm use 22.13.1`.
- Lockfile mismatch errors:
  - Make sure you are not using Yarn.
  - Re-run `pnpm install --frozen-lockfile`.
- Strange module/link behavior after migration:
  - Remove `node_modules` and reinstall with pnpm.
  - Re-check local linking workflow, since pnpm linking behavior differs from Yarn in some cases.

