# AUTH MODULE

Authentication + authorization. JWT (passport) with fingerprint validation, RBAC via CASL, permission points auto-scanned from decorators.

## STRUCTURE
```
auth/
├── auth.module.ts       # exports guards, strategies, factories, service
├── auth.controller.ts   # REST login/logout (Swagger)
├── auth.resolver.ts     # GraphQL login/logout/refresh/switchCompany/listCompanies
├── auth.service.ts      # token issuance, fingerprint, company switching
├── decorators/          # @CurrentAuth*, @UsePermission, @IsPublicAccess, @RequireCompany
├── guards/              # JwtAuthGuard, PermissionGuard, CompanyGuard
├── strategies/          # JwtStrategy (passport)
├── factories/           # CaslAbilityFactory, TokenFactory
├── graphql/             # LoginInput/LoginMeta/PermissionItem object types
└── interfaces/          # JwtPayload, TokenPayload
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Login flow | `auth.service.ts` → `login()` issues JWT; `JwtStrategy.validate()` loads member/admin |
| Skip auth on a route | `@IsPublicAccess()` decorator (JwtAuthGuard checks `IS_PUBLIC_ACCESS_KEY`) |
| Gate a resolver by permission | `@UsePermission(Client.Admin, ...)` + PermissionGuard |
| Get current caller | `@CurrentAuth()`, `@CurrentAuthMember()`, `@CurrentAuthAdmin()`, `@CurrentAuthCompany()` |
| Company scope | `@RequireCompany()` + CompanyGuard |

## CONVENTIONS
- **Permission point** = `${ClassName}.${methodName}` via `PermissionAliasHandler` — never hardcode strings; the guard derives it from the handler's class+method.
- **Auth pipeline**: `JwtAuthGuard` (token + fingerprint) → `PermissionGuard` (permission point + client) → `CompanyGuard` (company scope).
- **Fingerprint**: token is bound to the `Fingerprint` header at issue time; `handleRequest` re-checks it on every request.
- **Client restriction**: `@UsePermission(Client.Admin)` also gates which `auth.client` value is allowed (not just which permission string).
- New `@CurrentXxx` decorators are thin wrappers over `ContextHandler` — extend `current-auth.decorator.ts` rather than reading `request.authInfo` manually.

## ANTI-PATTERNS
- Duplicate `@UsePermission` on the same class+method → `script:scan-permissions` throws.
- Hardcoding a permission string in a guard/service — always derive via `PermissionAliasHandler`.
- Reading `req.user` directly (GraphQL vs REST differ) — use `ContextHandler(context).getRequest()` + `@CurrentAuth()`.
