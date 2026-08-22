# REPOSITORIES — DATA ACCESS LAYER

The only place Prisma is touched. Every entity has a **trio**: abstract (generated CRUD + zod) → repository (business logic) → extend (GraphQL field resolution).

## STRUCTURE
```
repositories/
├── repositories.module.ts   # @Global aggregation of all repositories
├── index.ts                 # barrel export
├── extends.ts               # barrel for all *.extend resolvers
└── <entity>/                # one dir per prisma model (14 entities)
    ├── <entity>.abstract.ts    # base class: typed CRUD via generated args + zod parse
    ├── <entity>.repository.ts  # extends abstract, adds business methods
    └── <entity>.extend.ts      # @ResolveField for computed GraphQL fields
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Add a CRUD method | `<entity>.abstract.ts` (generic find/create/update/delete) |
| Add business logic (e.g. password hashing, relations) | `<entity>.repository.ts` |
| Add a computed GraphQL field (e.g. `avatarUrl`) | `<entity>.extend.ts` |
| Register a new entity trio | `repositories.module.ts` providers + `index.ts` + `extends.ts` exports |

## CONVENTIONS
- **Abstract** uses generated GraphQL args (`FindMany<X>Args`, `UpsertOne<X>Args`) and validates inputs with zod schemas from `src/generated/schemas/**`. It exposes `handleParsedData()` as the extension hook.
- **Repository** `constructor(protected readonly db: DatabaseService)` and calls `super(db)` — business logic goes here, never raw Prisma in resolvers.
- **Extend** uses `@Resolver(Model)` + `@ResolveField` + `@Parent()` to add fields not stored on the model (joins, URLs, computed values). It may inject other repositories.
- Import generated types via `src/generated/graphql` and `src/generated/prisma/client` — these are the ONLY importers of the Prisma client.

## ANTI-PATTERNS
- Importing `Prisma` / `src/generated/prisma/client` anywhere outside this directory.
- Calling the Prisma client directly in a resolver/service — always go through a repository method.
- Skipping zod validation in `handleParsedData` — parse-then-validate is the contract.
- Forgetting to register a new trio in `repositories.module.ts` — DI silently fails at runtime.
