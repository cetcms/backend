# COMMON MODULE

Shared infrastructure. GraphQL bootstrap lives here (not in `main.ts`), plus cross-cutting filters, handlers, interceptors, services, and tools.

## STRUCTURE
```
common/
├── common.module.ts     # @Global: GraphQLModule.forRoot (ApolloDriver) + CommonResolver
├── common.resolver.ts   # health/ping GraphQL queries
├── dto/pagination.dto.ts   # Paginated<T>() factory + Pagination type
├── filters/             # ExtensionsFilter, GraphQLExceptionFilter, HttpExceptionFilter
├── handlers/            # ContextHandler, RequestHandler, PermissionAliasHandler, PasswordHandler, date/time/pagination handlers
├── interceptors/        # LoggingInterceptor
├── services/            # PaginationService
└── tools/               # logger, json, ffmpeg, request-log
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| GraphQL server config | `common.module.ts` — `autoSchemaFile: true`, `playground`, `subscriptions: {'graphql-ws': true}` |
| Paginate a query | `dto/pagination.dto.ts` `Paginated<T>()` + `services/pagination.service.ts` `result()` |
| Adapt REST↔GraphQL request | `handlers/context.handler.ts` (getRequest), `handlers/request.handler.ts` (headers/fingerprint) |
| Error shape | `filters/*.filter.ts` (i18n-aware) |
| Logging | `interceptors/logging.interceptor.ts` (registered globally in `app.service.ts`) |

## CONVENTIONS
- **Handlers are pure functions**, not injectable services — import directly (e.g. `ContextHandler(context)`, `PasswordHandler(pw).hash()`).
- **Pagination**: repositories return `{ items, pagination }` via `PaginationResult`/`PaginationService`; resolvers expose `Paginated<X>` type from the generic factory.
- **Permission alias** is computed in `permission.handler.ts` — the single source of the `${Class}.${method}` naming rule.
- New cross-cutting behavior (filter/interceptor) is registered in `app.service.ts`, not here — this module only *provides* the classes.

## ANTI-PATTERNS
- Don't move GraphQL config out of `common.module.ts` — it's `@Global` and consumed by every feature module.
- Don't reinvent pagination per-module; reuse `Paginated<T>()` + `PaginationService`.
- Don't touch `request.headers` directly for auth metadata — use `RequestHandler`.
