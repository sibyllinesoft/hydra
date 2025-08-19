# Engineering Standards for Scalable Systems

This document specifies the mandatory procedures and standards for system development. Adherence is required to ensure velocity, maintainability, and operational stability.

## 1. System Architecture & Repository Structure

### 1.1. Monorepo Structure
All services and packages will be contained within a single monorepo with the following layout:
```
./
├─ apps/
│  ├─ api/         # Bun + Elysia (TypeScript)
│  ├─ web/         # React + Vite (TypeScript)
│  └─ analysis/    # Python (uv-managed)
├─ packages/
│  ├─ domain/      # Pure business logic (TS)
│  ├─ ui/          # React component library
│  ├─ tooling/     # CLI, codemods, scripts
│  └─ shared/      # Cross-cutting types/schemas (Zod)
├─ ops/            # Docker, Compose, CI configuration
└─ docs/           # Architecture, ADRs, runbooks
```

### 1.2. Architecture Specification (`ARCHITECTURE.md`)
A system `ARCHITECTURE.md` file is required before implementation begins. It must contain:
*   **Context**: Problem statement, target user personas, and constraints (latency, cost, compliance).
*   **Capability Map**: A functional decomposition of the system (C1, C2, …) with success metrics, boundaries, and owners for each.
*   **System Overview**: Runtime topology diagram, data contracts (Zod schemas, versioning policy), state management (data lifecycle, retention), and security model (authn/z, PII handling).
*   **Code Structure**: Adherence to Domain -> Application -> Interface -> Infrastructure layers.
*   **Decision Records**: Link to ADRs justifying significant architectural choices.
*   **Quality Attributes**: Quantitative targets for performance (p99 latency), availability (error budgets), and observability (RED/USE metrics).
*   **Testing Strategy**: Definition of unit, integration, and E2E test boundaries and coverage targets.
*   **Risks**: Top 5 technical and operational risks with explicit mitigation strategies.

### 1.3. Core Architectural Principles
*   **Modular Monolith**: Services are organized by domain/feature with strict dependency boundaries, enforced by `dep-cruiser`. Decouple into separate services only when justified by operational data (e.g., scaling requirements, fault isolation).
*   **Ports & Adapters (Hexagonal)**: The `domain` package defines ports (interfaces) for I/O. Infrastructure adapters (e.g., database clients, message queues) implement these ports at the system edge. The domain core contains zero framework, network, or I/O-specific code.
*   **Functional Core, Imperative Shell**: Business logic must be implemented as pure, deterministic functions. Side effects (I/O) are orchestrated at the application layer boundaries, after decisions are made.

## 2. Documentation & Contract Enforcement

### 2.1. Objective
Documentation provides precise context for human engineers and machine tooling (e.g., AI agents), defining contracts, invariants, and operational semantics.

### 2.2. API Documentation
*   **TypeScript**: TSDoc is mandatory for all exported symbols. Each block must include purpose, `@param`, `@returns`, invariants, error semantics, performance notes, and a stability tag (`@alpha`|`@stable`).
*   **Python**: Google-style docstrings are mandatory for all public modules, classes, and functions. They must include types, `Raises` section, side effects, and algorithmic complexity. Type hints are mandatory; `Any` is forbidden in public APIs.

### 2.3. Directory `README.md` Policy
Every directory representing an architectural boundary (e.g., `packages/domain`, `apps/api`) must contain a `README.md` specifying:
*   Purpose and scope.
*   Public API surface.
*   Dependency rules (allowed inbound/outbound).
*   Testing protocol and fixture locations.
*   Operational characteristics and known failure modes.

### 2.4. Enforcement
CI will fail if:
*   TSDoc or `ruff D` linting rules are violated.
*   `mypy --strict` reports new `Any` types.
*   Documentation coverage on public symbols falls below 85%.

## 3. Test-First Implementation Protocol

Development must follow this sequence. No steps may be skipped.

1.  **Work Item Validation**: Confirm acceptance criteria (AC) are explicit and measurable. Reject ambiguous work.
2.  **Test Authoring**: Write failing tests traceable to AC. This includes unit/property tests for domain logic, integration tests for adapters, and E2E tests for critical user journeys.
3.  **Red State Verification**: Execute the test suite and confirm failure at the expected points. Log this state.
4.  **Minimal Implementation**: Write only the code required to make the failing tests pass. Defer unrelated refactoring.
5.  **Validation Pass**: Run lint (`xo`, `ruff`), type check (`tsc --noEmit`, `mypy`), SAST (`Semgrep`), and dependency audit. Treat type errors as test failures.
6.  **Documentation Pass**: Update TSDoc/docstrings and all relevant `README.md` files. Create an ADR if a significant architectural decision was made.

## 4. Service Implementation Checklists

### 4.1. Backend (TypeScript)
*   **Domain**: Pure functions. Types imported from `packages/shared`. No I/O.
*   **Use Cases**: Orchestrate domain logic. Return explicit `Result<T, E>` types.
*   **Adapters**: I/O logic is isolated. Integration tests run against real services via Docker Compose.
*   **HTTP Layer (Elysia)**: Handlers are thin layers for request/response mapping. All input is validated against Zod schemas. Errors map to `problem+json` (RFC 7807).
*   **Types**: `tsconfig.json` must have `"strict": true` and `"noUncheckedIndexedAccess": true`.
*   **Performance**: Hot paths must have microbenchmarks (`tinybench`). Profile with `0x` or Clinic.js as needed.
*   **Security**: Authorize actions in the use-case layer. All inputs validated at the boundary. Semgrep policy must pass.

### 4.2. LLM & Data Services
*   **Boundary**: LLM access is implemented via a port/adapter. The domain is agnostic to the LLM provider (e.g., OpenAI, Anthropic).
*   **Contracts**: Prompts and expected output schemas are version-controlled. LLM outputs are validated against a Zod schema on receipt.
*   **Resource Control**: Implement strict timeouts and token budgets per request. Cache idempotent responses.
*   **Testing**: Evaluate LLM logic against a golden dataset. Assert structured output, not exact string matches.

### 4.3. Frontend (React)
*   **Components**: Default to pure functional components. Co-locate component, styles, stories, and tests (`*.tsx`, `*.css`, `*.stories.tsx`, `*.test.tsx`).
*   **Design System**: All UI consumes design tokens (color, space, typography) from `packages/ui`. Hard-coded style values are forbidden.
*   **Storybook**: Every component must have stories covering all states (idle, hover, focus, disabled, loading, error).
*   **CI for UI**: Storybook must build, and the test-runner (interaction and accessibility checks) must pass in CI. Merges are blocked on `axe` violations.

## 5. Operations & Automation

### 5.1. Containerization (Docker & Compose)
*   **Dockerfiles**: Must use multi-stage builds, copy lockfiles early for layer caching, and run as a non-root user. A `HEALTHCHECK` instruction is required for all services.
*   **Compose**: The `docker-compose.yml` file is the source of truth for the local development stack. It must define health-gated service dependencies. A single command must bring up the entire stack. CI uses this file for integration tests.

### 5.2. GitHub Actions (CI/CD)
The following checks are mandatory and must pass before merging to `main`:
*   **Validation Job**: Lint, typecheck, unit tests, integration tests.
*   **UI Job**: Storybook build, Storybook test-runner (interactions + a11y).
*   **Security Job**: SAST (Semgrep), dependency audit.
*   **Build Job**: Docker images build successfully and pass healthchecks within Compose.
*   **E2E Job (on merge to `main`)**: Playwright tests run against an ephemeral stack. Flake rate must be zero.

### 5.3. Tooling Tasks
Tooling may be employed to perform the following maintenance tasks:
*   **Code Quality**: Identify and propose refactors for functions with high cyclomatic complexity. Identify and remove dead code.
*   **Dependency Management**: Report unused dependencies or suggest lighter alternatives for heavy dependencies.
*   **Test Generation**: Convert code examples in `README` files into executable tests.
*   **Regression Detection**: Maintain golden files for core algorithm outputs and run benchmarks to detect performance regressions.