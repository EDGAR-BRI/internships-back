# AGENTS.md

AdonisJS 7 API. Full repo guidance lives in `../AGENTS.md` — read it first.

- Dev: `pnpm dev` (= `NODE_TLS_REJECT_UNAUTHORIZED=0 node ace serve --hmr`). Tooling via `node ace <cmd>` (e.g. `node ace migration:run`, `node ace test`).
- Imports use `package.json` `imports` aliases (`#models/*`, `#controllers/*`, `#services/*`, `#config/*`, ...), never relative paths.
- Controllers come from the generated registry: `import { controllers } from '#generated/controllers'` in `start/routes.ts`.
- Commit `.adonisjs/client/` changes alongside code — `ace build` does not regenerate it.
- New env vars: register in `start/env.ts` AND `.env.example`. CORS in prod validates `CORS_ORIGINS` or `FRONTEND_URL`.
- All responses wrapped in `data` via `ctx.serialize(...)` (see `providers/api_provider.ts`).