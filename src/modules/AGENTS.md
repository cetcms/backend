# MODULES — BUSINESS LAYER

Six feature modules aggregated by `modules.module.ts`. Each follows the same shape; business logic lives in services, resolvers are thin.

## STRUCTURE
```
modules/
├── modules.module.ts     # imports all six feature modules
├── admin/                # admins, admin-roles, admin-companies (resolvers + services)
├── company/              # companies, company-members, company-roles
├── media/                # media-file/folder upload + serving (REST controller + GraphQL)
├── member/               # members (single resolver/service)
├── notification/         # notifications + notification-recipients
└── website/              # websites + SEO (Strapi/site crawler integration, REST controller)
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Add a feature module | copy `admin/` shape → register in `modules.module.ts` imports |
| CRUD for an entity | `<module>/resolvers/*.resolver.ts` delegates to `<module>/services/*.service.ts` which calls repositories |
| Media upload/serve | `media/media.controller.ts` (REST, multipart via graphql-upload) + `media/media.resolver.ts` |
| SEO (external CMS) | `website/services/website-seo.service.ts` → `StrapiService` + `SiteService` |
| Local GraphQL object types | `<module>/graphql/*.ts` (not prisma-generated) |

## CONVENTIONS
- **Resolver is thin**: parse args → call service → return; no business logic in resolvers.
- **Service** injects repositories (not Prisma) and other services; holds the actual logic + permission wiring via `@UsePermission`.
- **Module registration** uses `import * as Resolvers from './resolvers'` / `import * as Services from './services'` + `...Object.values(...)` — keep the barrel `index.ts` updated.
- **Website** is the exception: it pulls in `providers/` (Strapi, site crawler) and has a REST controller in addition to GraphQL.

## ANTI-PATTERNS
- Putting business logic in resolvers — keep it in services.
- Importing a repository from a *different* module directly — prefer that module's service, or inject the repository through the shared `RepositoriesModule`.
- New module without registering it in `modules.module.ts` (silently unreachable).
