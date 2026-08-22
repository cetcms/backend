# PROJECT KNOWLEDGE BASE

**Generated:** 2026-08-23T01:00:00+08:00
**Commit:** 1a2cd51
**Branch:** develop

## OVERVIEW
CETCMS — enterprise content management backend. NestJS + TypeScript, GraphQL (Apollo) + REST (Swagger), PostgreSQL + Prisma, Redis + in-memory cache, JWT auth, i18next (5 locales). Runtime: **Bun**. ESM (`module: nodenext`), path alias `src/*` → `./src/*`.

## STRUCTURE
```
backend/
├── prisma/schema.prisma        # single source of truth (4 generators)
├── src/generated/              # ⚠️ AUTO-GENERATED — never edit by hand
├── src/auth/                   # JWT, guards, decorators, strategies, CASL factory
├── src/config/                 # typed config (app/cache/provider/storage)
├── src/database/               # DatabaseService (Prisma client wrapper, @Global)
├── src/cache/                  # Keyv multi-store (memory + Redis), @Global
├── src/common/                 # GraphQL bootstrap, filters/handlers/interceptors/services/tools
├── src/i18n/                   # i18next module + translations/{en,ja,ko,zh,zh-hant}
├── src/contracts/              # shared const enums (RequestKeys, RequestHeaders, ModelsRelation)
├── src/repositories/           # data access layer (abstract/repository/extend pattern)
├── src/modules/                # business modules (admin, company, media, member, notification, website)
├── src/providers/              # external: site crawler, Strapi CMS
├── scripts/                    # tsx one-off scripts (seed, scan-permissions, …)
└── test/                       # e2e specs + jest-e2e.json (ESM)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Boot / app wiring | `src/main.ts` → `src/app.service.ts` → `src/app.module.ts` | `AppService.start()` sets prefix `/api`, GraphQL upload, i18n middleware, filters, Swagger `/docs` |
| GraphQL config | `src/common/common.module.ts` | ApolloDriver, `autoSchemaFile`, `graphql-ws` subscriptions |
| DB access | `src/database/database.service.ts` + `src/repositories/**` | never touch Prisma client directly outside repositories |
| Auth / login | `src/auth/auth.service.ts` (`login/logout/refresh/switchCompany/listCompanies`) | fingerprint-validated JWT |
| Permission points | `scripts/scan-permissions.ts` → `src/generated/permissions.ts` | auto-scanned from `@UsePermission` |
| Config values | `src/config/config.service.ts` + `src/config/definition/*` | typed accessors `getAppConfig()` etc. |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `AppModule` | module | src/app.module.ts | root module; imports all top-level modules |
| `AppService.start()` | method | src/app.service.ts | global prefix, middleware, filters, Swagger |
| `JwtAuthGuard` | guard | src/auth/guards/jwt-auth.guard.ts | passport-jwt + fingerprint check; `@IsPublicAccess` skips |
| `PermissionGuard` | guard | src/auth/guards/permission.guard.ts | `${Class}.${method}` permission point + client restriction |
| `CompanyGuard` | guard | src/auth/guards/company.guard.ts | company-scope enforcement |
| `AuthService` | service | src/auth/auth.service.ts | login/logout/refresh/switchCompany |
| `CaslAbilityFactory` | factory | src/auth/factories/casl-ability.factory.ts | per-request ability from permissions |
| `JwtStrategy` | strategy | src/auth/strategies/jwt.strategy.ts | validates JWT, loads auth/member/admin |
| `DatabaseService` | service | src/database/database.service.ts | Prisma client wrapper (@Global) |
| `ConfigService` | service | src/config/config.service.ts | typed config accessor |
| `RepositoriesModule` | module | src/repositories/repositories.module.ts | aggregates all repositories |
| `Paginated<T>()` | fn | src/common/dto/pagination.dto.ts | generic GraphQL pagination type factory |
| `PermissionAliasHandler` | fn | src/common/handlers/permission.handler.ts | builds `name` from class+method |
| `ContextHandler` / `RequestHandler` | fn | src/common/handlers/ | GraphQL+REST request adaptation |
| `I18nService` | service | src/i18n/i18n.service.ts | language detection + switching |
| `WebsiteSeoService` | service | src/modules/website/services/website-seo.service.ts | SEO via Strapi + site crawler |
| `StrapiService` / `SiteService` | services | src/providers/{strapi,site} | external CMS + crawler clients |

## CONVENTIONS
- **Repository trio**: `<entity>.abstract.ts` (Prisma CRUD + zod validation) → `<entity>.repository.ts` (business logic, extends abstract) → `<entity>.extend.ts` (GraphQL `@ResolveField`). Register in `repositories.module.ts` + `repositories/index.ts`.
- **Module shape**: `module.ts` + `resolvers/` + `services/` (+ `graphql/` for local object types, `controller.ts` for REST). Use `import * as Services from './services'` + `...Object.values(Services)`.
- **Codegen**: `bun run generate` (prisma generate) is wired to `prebuild`/`predev`/`predebug`. Schema change → regenerate before typecheck.
- **Import style**: absolute `src/*` paths; oxfmt `sortImports` (builtin → external → internal → parent → sibling), single quotes, 120 col.
- **Config**: never read `process.env` directly — add a typed definition in `src/config/definition/` + accessor on `ConfigService`.
- **Zod**: generated input schemas in `src/generated/schemas/**` used by repositories to validate parsed inputs.

## ANTI-PATTERNS (THIS PROJECT)
- **NEVER edit `src/generated/**`** — it is overwritten by `prisma generate` and excluded from lint.
- **NEVER** import Prisma client (`src/generated/prisma/client`) outside `src/repositories/`.
- **NEVER** skip `bun run generate` after editing `schema.prisma` — typecheck will fail on stale generated code.
- **Duplicate `@UsePermission` definitions** throw in `script:scan-permissions` (permission point = `${Class}.${method}`).
- **Fingerprint mismatch** → `FINGERPRINT_INVALID`. Auth requests must send the same `Fingerprint` header the token was issued with.
- Avoid `@ts-ignore`/`as any` even though `no-explicit-any` is off; prefer zod-typed generated inputs.

## UNIQUE STYLES
- Chinese JSDoc block comments on public methods (`/** 功能描述 … */`) are idiomatic here.
- Permissions are not hand-written — they are **scanned via ts-morph** from `@UsePermission` decorators into `src/generated/permissions.ts` + per-locale `permissions.json`.

## COMMANDS
```bash
bun run dev              # watch mode (--env-file .env)
bun run debug            # watch + --debug
bun run build && bun run prod
bun run generate         # prisma generate (prisma client + graphql + zod + dto)
bun run db:migrate|db:push|db:reset|db:studio|db:seed
bun run script:scan-permissions           # regenerate permission points + i18n
bun run script:push-permissions-to-role   # sync role permissions
bun run script:gen-i18n-translations
bun run lint && bun run format
bun run test && bun run test:e2e
```

## NOTES
- 3496 files on disk but ~3300 are `src/generated/**`; hand-written source is ~200 files / ~15k TS lines. Ignore `generated/` when navigating.
- ESM + `nodenext` + ts-jest `useESM` — e2e runs with `NODE_OPTIONS=--experimental-vm-modules`.
- Swagger at `/docs`, GraphQL playground at `/graphql`, REST under `/api` (health + media excluded from prefix).
- `env.development` only holds `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_DOMAIN`, `MEMBER_DOMAIN`.
