# apps/api — Backend (NestJS, Hexagonal)

Ports & adapters. The domain knows nothing about Nest or Prisma.

## Layers (per feature module)

```
src/modules/<feature>/
├── domain/
│   ├── <entity>.entity.ts          # pure class/type, business invariants, no decorators
│   └── ports/
│       ├── <feature>.repository.port.ts   # interface (e.g. ProjectRepositoryPort)
│       └── <other>.port.ts                # other outbound ports if needed
├── application/
│   └── use-cases/
│       ├── create-<feature>.use-case.ts   # one class, one execute() method
│       ├── list-<feature>.use-case.ts
│       └── ...                             # one file per use case
├── infrastructure/
│   └── persistence/
│       ├── prisma-<feature>.repository.ts  # implements the port, uses PrismaService
│       └── <feature>.mapper.ts             # Prisma row <-> domain entity
└── interfaces/
    └── http/
        ├── <feature>.controller.ts         # thin; injects use cases
        └── dto/
            ├── create-<feature>.dto.ts
            └── update-<feature>.dto.ts
```

`<feature>.module.ts` wires it: binds each port token to its adapter, registers use cases + controller.

## Dependency rules (enforced)

- `domain/` imports nothing from `application`, `infrastructure`, `interfaces`, Nest, or Prisma. Pure TS + `@acm/shared`.
- `application/` imports only `domain/` (entities + ports). Use cases receive ports via constructor injection (interface, not concrete).
- `infrastructure/` implements ports. The ONLY place `@prisma/client` / `PrismaService` appears.
- `interfaces/` (controllers) call use cases. No business logic, no Prisma.

## Port binding pattern

```typescript
// domain/ports/project.repository.port.ts
export const PROJECT_REPOSITORY = Symbol("PROJECT_REPOSITORY");
export interface ProjectRepositoryPort {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
}

// application/use-cases/create-project.use-case.ts
@Injectable()
export class CreateProjectUseCase {
  constructor(@Inject(PROJECT_REPOSITORY) private readonly repo: ProjectRepositoryPort) {}
  execute(input: CreateProjectInput): Promise<Project> { /* one job */ }
}

// <feature>.module.ts
{ provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository }
```

## Rules

- One use case = one class with a single `execute()`. No "service god-objects".
- Mappers isolate Prisma shape from the domain entity. Domain entities never carry Prisma types.
- Controllers: validate DTO → `useCase.execute()` → return. Max ~5 lines per handler.
- REST + status codes + 2-level nesting per root `CLAUDE.md`.
- Auth via the pluggable `AuthProvider` port (see auth module). v1 = NoAuth adapter.
- Tests: use cases unit-tested with in-memory fake adapters implementing the port; controllers covered by e2e.
