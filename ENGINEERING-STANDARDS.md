# Engineering Standards for Scalable Systems

**Purpose**: This document specifies mandatory procedures and standards for system development. The Markdown provides human-readable guidelines, while the embedded XML provides a machine-readable format for linters, AI agents, and other automation to enforce these standards.

## 1. System Architecture & Repository Structure

### 1.1. Monorepo Structure

All services and packages must be contained within a single monorepo. The XML below defines the canonical directory structure that tooling can use for validation.

```xml
<monorepoStructure>
  <directory name="apps" description="Deployable applications">
    <directory name="api" description="Bun + Elysia (TypeScript)" />
    <directory name="web" description="React + Vite (TypeScript)" />
    <directory name="analysis" description="Python (uv-managed)" />
  </directory>
  <directory name="packages" description="Shared libraries and modules">
    <directory name="domain" description="Pure business logic (TS)" />
    <directory name="ui" description="React component library" />
    <directory name="tooling" description="CLI, codemods, scripts" />
    <directory name="shared" description="Cross-cutting types/schemas (Zod)" />
  </directory>
  <directory name="ops" description="Docker, Compose, CI configuration" />
  <directory name="docs" description="Architecture, ADRs, runbooks" />
</monorepoStructure>
```

### 1.2. Architecture Specification (`ARCHITECTURE.md`)

Before implementation, a system `ARCHITECTURE.md` file is required. The XML specifies the mandatory sections and their required content, which can be validated by a documentation linter.

```xml
<architectureSpecification document="ARCHITECTURE.md">
  <requiredSection name="Context">
    <item>Problem statement</item>
    <item>Target user personas</item>
    <item>Constraints (latency, cost, compliance)</item>
  </requiredSection>
  <requiredSection name="Capability Map">
    <item>Functional decomposition (C1, C2, ...)</item>
    <item>Success metrics, boundaries, and owners for each capability</item>
  </requiredSection>
  <requiredSection name="System Overview">
    <item>Runtime topology diagram</item>
    <item>Data contracts (Zod schemas, versioning policy)</item>
    <item>State management (data lifecycle, retention)</item>
    <item>Security model (authn/z, PII handling)</item>
  </requiredSection>
  <requiredSection name="Code Structure">
    <item>Adherence to Domain -> Application -> Interface -> Infrastructure layers</item>
  </requiredSection>
  <requiredSection name="Decision Records">
    <item>Link to relevant Architecture Decision Records (ADRs)</item>
  </requiredSection>
  <requiredSection name="Quality Attributes">
    <item>Quantitative targets for performance (p99 latency)</item>
    <item>Quantitative targets for availability (error budgets)</item>
    <item>Quantitative targets for observability (RED/USE metrics)</item>
  </requiredSection>
  <requiredSection name="Testing Strategy">
    <item>Definition of unit, integration, and E2E test boundaries</item>
    <item>Coverage targets for each test type</item>
  </requiredSection>
  <requiredSection name="Risks">
    <item>Top 5 technical and operational risks</item>
    <item>Explicit mitigation strategies for each risk</item>
  </requiredSection>
</architectureSpecification>
```

### 1.3. Core Architectural Principles

These principles guide all architectural decisions. The XML representation provides a formal definition that can be referenced by ADRs and design review tools.

```xml
<architecturalPrinciples>
  <principle name="Modular Monolith">
    <description>Services are organized by domain/feature with strict dependency boundaries. Decouple into separate microservices only when justified by operational data.</description>
    <enforcement tool="dep-cruiser" />
  </principle>
  <principle name="Ports &amp; Adapters (Hexagonal)">
    <description>The 'domain' package defines ports (interfaces) for I/O. Infrastructure adapters implement these ports at the system edge. The domain core contains zero framework, network, or I/O-specific code.</description>
  </principle>
  <principle name="Functional Core, Imperative Shell">
    <description>Business logic must be implemented as pure, deterministic functions. Side effects (I/O) are orchestrated at the application layer boundaries, after decisions are made.</description>
  </principle>
</architecturalPrinciples>
```

## 2. Documentation & Contract Enforcement

### 2.1. Objective

Documentation serves as a precise contract for both human engineers and automated tooling, defining system invariants and operational semantics.

### 2.2. API Documentation

API documentation is mandatory and must follow specific formats per language. The XML below defines these rules for automated validation.

```xml
<apiDocumentationStandards>
  <language name="TypeScript">
    <standard name="TSDoc" required="true" for="all exported symbols" />
    <requiredContent>
      <item>Purpose</item>
      <item tag="@param">Parameter description</item>
      <item tag="@returns">Return value description</item>
      <item>Invariants and error semantics</item>
      <item>Performance notes</item>
      <item tag="@alpha|@stable">Stability tag</item>
    </requiredContent>
  </language>
  <language name="Python">
    <standard name="Google-style docstrings" required="true" for="all public modules, classes, functions" />
    <standard name="Type Hints" required="true" />
    <rule>The 'Any' type is forbidden in public APIs.</rule>
    <requiredContent>
      <item>Type definitions for args and returns</item>
      <item section="Raises">Error and exception semantics</item>
      <item>Side effects</item>
      <item>Algorithmic complexity</item>
    </requiredContent>
  </language>
</apiDocumentationStandards>
```

### 2.3. Directory `README.md` Policy

Every architecturally significant directory must contain a `README.md` file. The XML defines the required sections for automated checks.

```xml
<readmePolicy target="Every directory representing an architectural boundary">
  <requiredSection name="Purpose and scope" />
  <requiredSection name="Public API surface" />
  <requiredSection name="Dependency rules (allowed inbound/outbound)" />
  <requiredSection name="Testing protocol and fixture locations" />
  <requiredSection name="Operational characteristics and known failure modes" />
</readmePolicy>
```

### 2.4. Enforcement

CI pipelines must enforce all documentation standards. The XML lists the specific failure conditions.

```xml
<enforcement policy="CI will fail if">
  <condition tool="linter">TSDoc rules are violated.</condition>
  <condition tool="ruff --select D">Python docstring rules are violated.</condition>
  <condition tool="mypy --strict">New 'Any' types are introduced in public APIs.</condition>
  <condition tool="coverage-tool">Documentation coverage on public symbols falls below 85%.</condition>
</enforcement>
```

## 3. Test-First Implementation Protocol

Development must follow this exact sequence. This protocol ensures that all code is written against clear, testable requirements.

```xml
<implementationProtocol>
  <step number="1" name="Work Item Validation">
    <action>Confirm acceptance criteria (AC) are explicit and measurable. Reject ambiguous work.</action>
  </step>
  <step number="2" name="Test Authoring">
    <action>Write failing tests traceable to AC. This includes unit/property, integration, and E2E tests.</action>
  </step>
  <step number="3" name="Red State Verification">
    <action>Execute the test suite and confirm failure at the expected points. Log this state.</action>
  </step>
  <step number="4" name="Minimal Implementation">
    <action>Write only the code required to make the failing tests pass. Defer unrelated refactoring.</action>
  </step>
  <step number="5" name="Validation Pass">
    <action>Run lint (xo, ruff), type check (tsc --noEmit, mypy), SAST (Semgrep), and dependency audit.</action>
    <rule>Treat type errors as test failures.</rule>
  </step>
  <step number="6" name="Documentation Pass">
    <action>Update TSDoc/docstrings and all relevant README.md files.</action>
    <action>Create an ADR if a significant architectural decision was made.</action>
  </step>
</implementationProtocol>
```

## 4. Service Implementation Checklists

These checklists define the mandatory requirements for specific service types.

```xml
<serviceChecklists>
  <checklist type="Backend (TypeScript)">
    <rule area="Domain">Must be pure functions. Types imported from packages/shared. No I/O.</rule>
    <rule area="Use Cases">Orchestrate domain logic. Return explicit Result&lt;T, E&gt; types.</rule>
    <rule area="Adapters">Isolate I/O logic. Must have integration tests against real services via Docker Compose.</rule>
    <rule area="HTTP Layer">Handlers are thin request/response mappers. All input validated with Zod. Errors map to RFC 7807 (problem+json).</rule>
    <rule area="Typescript Config">tsconfig.json must have "strict": true and "noUncheckedIndexedAccess": true.</rule>
    <rule area="Performance">Hot paths must have microbenchmarks (tinybench).</rule>
    <rule area="Security">Authorize actions in the use-case layer. Validate all inputs at the boundary. Semgrep policy must pass.</rule>
  </checklist>
  <checklist type="LLM &amp; Data Services">
    <rule area="Boundary">LLM access is implemented via a port/adapter. The domain must be agnostic to the LLM provider.</rule>
    <rule area="Contracts">Prompts and expected output schemas are version-controlled. LLM outputs must be validated against a Zod schema.</rule>
    <rule area="Resource Control">Implement strict timeouts and token budgets per request. Cache idempotent responses.</rule>
    <rule area="Testing">Evaluate LLM logic against a golden dataset. Assert structured output, not exact string matches.</rule>
  </checklist>
  <checklist type="Frontend (React)">
    <rule area="Components">Default to pure functional components. Co-locate component, styles, stories, and tests.</rule>
    <rule area="Design System">All UI consumes design tokens from packages/ui. Hard-coded style values are forbidden.</rule>
    <rule area="Storybook">Every component must have stories covering all states (idle, hover, focus, disabled, loading, error).</rule>
    <rule area="CI for UI">Storybook build and test-runner (interaction and accessibility) must pass. Merges are blocked on 'axe' violations.</rule>
  </checklist>
</serviceChecklists>
```

## 5. Operations & Automation

### 5.1. Containerization (Docker & Compose)

Container definitions are a critical part of our infrastructure contract.

```xml
<containerizationStandards>
  <dockerfile>
    <rule>Must use multi-stage builds.</rule>
    <rule>Copy lockfiles early for layer caching.</rule>
    <rule>Must run as a non-root user.</rule>
    <rule>A HEALTHCHECK instruction is required for all services.</rule>
  </dockerfile>
  <dockerCompose file="docker-compose.yml">
    <rule>Is the source of truth for the local development stack.</rule>
    <rule>Must define health-gated service dependencies.</rule>
    <rule>A single command must bring up the entire stack.</rule>
    <rule>Used by CI for integration tests.</rule>
  </dockerCompose>
</containerizationStandards>
```

### 5.2. GitHub Actions (CI/CD)

The CI/CD pipeline enforces quality and security gates. The following jobs are mandatory for all pull requests to `main`.

```xml
<ciPipeline trigger="on PR to main">
  <mandatoryJob name="Validation">
    <task>Lint</task>
    <task>Typecheck</task>
    <task>Unit tests</task>
    <task>Integration tests</task>
  </mandatoryJob>
  <mandatoryJob name="UI">
    <task>Storybook build</task>
    <task>Storybook test-runner (interactions + accessibility)</task>
  </mandatoryJob>
  <mandatoryJob name="Security">
    <task>SAST (Semgrep)</task>
    <task>Dependency audit</task>
  </mandatoryJob>
  <mandatoryJob name="Build">
    <task>Docker images build successfully</task>
    <task>Containers pass healthchecks within Compose</task>
  </mandatoryJob>
  <mandatoryJob name="E2E" trigger="on merge to main">
    <task>Playwright tests run against an ephemeral stack</task>
    <rule>Flake rate must be zero.</rule>
  </mandatoryJob>
</ciPipeline>
```

### 5.3. Tooling Tasks

Automated tooling may be employed to assist with codebase maintenance and improvement.

```xml
<toolingTasks>
  <task category="Code Quality">
    <goal>Identify and propose refactors for functions with high cyclomatic complexity.</goal>
    <goal>Identify and remove dead code.</goal>
  </task>
  <task category="Dependency Management">
    <goal>Report unused dependencies.</goal>
    <goal>Suggest lighter alternatives for heavy dependencies.</goal>
  </task>
  <task category="Test Generation">
    <goal>Convert code examples in README files into executable tests.</goal>
  </task>
  <task category="Regression Detection">
    <goal>Maintain golden files for core algorithm outputs.</goal>
    <goal>Run benchmarks to detect performance regressions.</goal>
  </task>
</toolingTasks>
```

---

## 6. Code Quality & Refactoring Standards

### 6.1. Technical Debt Management

Technical debt must be tracked, measured, and systematically reduced through automated tooling and AI-assisted refactoring.

```xml
<technicalDebtFramework>
  <measurement>
    <metric name="Technical Debt Ratio" target="&lt;20%" description="Percentage of development time spent on debt reduction vs new features"/>
    <metric name="Maintainability Index" target="&gt;80" description="Composite score of complexity, coupling, and documentation"/>
    <metric name="Code Duplication" target="&lt;5%" description="Percentage of duplicated code blocks in codebase"/>
    <metric name="Cyclomatic Complexity" target="&lt;10 per function" description="Maximum complexity allowed per function"/>
  </measurement>
  
  <automation>
    <tool name="AI Code Analysis" framework="iSMELL" accuracy="75.17% F1 score" purpose="Automated code smell detection"/>
    <tool name="Dependency Analysis" purpose="Circular dependency detection and coupling analysis"/>
    <tool name="Dead Code Detection" purpose="Identify and flag unused code for removal"/>
    <tool name="Performance Profiling" purpose="Automated bottleneck identification"/>
  </automation>
  
  <refactoringPriorities>
    <priority level="Critical" threshold="Debt ratio &gt;40%">
      <action>Immediate intervention required - pause feature development</action>
      <pattern>Extract Method for functions &gt;20 lines</pattern>
      <pattern>Extract Class for classes &gt;300 lines</pattern>
    </priority>
    <priority level="High" threshold="Debt ratio 20-40%">
      <action>Systematic refactoring in dedicated sprints</action>
      <pattern>Eliminate code duplication</pattern>
      <pattern>Simplify complex conditionals</pattern>
    </priority>
    <priority level="Medium" threshold="Debt ratio 10-20%">
      <action>Continuous improvement during regular development</action>
      <pattern>Improve variable and method naming</pattern>
      <pattern>Add missing documentation</pattern>
    </priority>
  </refactoringPriorities>
</technicalDebtFramework>
```

### 6.2. Automated Quality Gates

All code changes must pass automated quality gates before merging.

```xml
<qualityGates>
  <gate name="Code Complexity" mandatory="true">
    <threshold metric="cyclomatic_complexity" max="10" scope="per_function"/>
    <threshold metric="nesting_depth" max="4" scope="per_function"/>
    <threshold metric="method_length" max="20" scope="lines_of_code"/>
    <enforcement>Block merge if thresholds exceeded</enforcement>
  </gate>
  
  <gate name="Test Coverage" mandatory="true">
    <threshold metric="line_coverage" min="90%" scope="new_code"/>
    <threshold metric="branch_coverage" min="85%" scope="new_code"/>
    <threshold metric="mutation_score" min="75%" scope="critical_paths"/>
    <enforcement>Block merge if coverage drops</enforcement>
  </gate>
  
  <gate name="Security Standards" mandatory="true">
    <check>SAST scan passes with no high-severity issues</check>
    <check>Dependency audit passes with no known vulnerabilities</check>
    <check>No hardcoded secrets or credentials</check>
    <check>Input validation implemented for all external inputs</check>
    <enforcement>Block merge if security issues found</enforcement>
  </gate>
  
  <gate name="Documentation Quality" mandatory="true">
    <threshold metric="api_documentation_coverage" min="100%" scope="public_apis"/>
    <threshold metric="readme_completeness" min="100%" scope="new_modules"/>
    <check>All architectural decisions documented in ADRs</check>
    <enforcement>Block merge if documentation incomplete</enforcement>
  </gate>
</qualityGates>
```

### 6.3. Refactoring Safety Protocols

All refactoring must follow safety-first methodologies to prevent regressions.

```xml
<refactoringSafetyProtocol>
  <preRefactoring>
    <requirement>Establish comprehensive test coverage (&gt;90%) before refactoring</requirement>
    <requirement>Create characterization tests for legacy code without tests</requirement>
    <requirement>Document current behavior and performance baselines</requirement>
    <requirement>Plan rollback strategy and implementation</requirement>
  </preRefactoring>
  
  <duringRefactoring>
    <principle>Apply single transformation pattern per commit</principle>
    <principle>Run full test suite after each transformation</principle>
    <principle>Preserve behavior - no functionality changes during refactoring</principle>
    <principle>Measure impact - track quality metrics throughout process</principle>
  </duringRefactoring>
  
  <postRefactoring>
    <validation>All tests pass with no behavioral changes</validation>
    <validation>Performance metrics maintained or improved</validation>
    <validation>Code quality metrics show measurable improvement</validation>
    <validation>Documentation updated to reflect structural changes</validation>
  </postRefactoring>
  
  <emergencyRollback>
    <trigger condition="Test failures introduced">Immediate rollback required</trigger>
    <trigger condition="Performance degradation &gt;20%">Immediate rollback required</trigger>
    <trigger condition="Production issues correlation">Immediate rollback required</trigger>
    <procedure>Automated rollback to last known good state</procedure>
  </emergencyRollback>
</refactoringSafetyProtocol>
```

---

## 7. AI-Assisted Development Integration

### 7.1. AI Tooling Standards

AI tools must be integrated with proper validation and human oversight.

```xml
<aiToolingStandards>
  <codeGeneration>
    <validation>All AI-generated code must pass same quality gates as human code</validation>
    <oversight>Human review required for AI suggestions affecting architecture</oversight>
    <testing>AI-generated code requires comprehensive test coverage</testing>
    <documentation>AI assistance must be documented in commit messages</documentation>
  </codeGeneration>
  
  <refactoringAssistance>
    <tool name="AI Code Analysis" capability="Pattern recognition and smell detection"/>
    <tool name="Automated Refactoring" capability="Safe transformation application"/>
    <validation>Human validation required for AI refactoring suggestions</validation>
    <safety>AI refactoring must include automated rollback capability</safety>
  </refactoringAssistance>
  
  <qualityAssurance>
    <principle>AI tools enhance human capability, never replace human judgment</principle>
    <principle>All AI suggestions require human validation before implementation</principle>
    <principle>AI-generated content must meet same standards as human content</principle>
    <principle>False positive rates must be monitored and minimized</principle>
  </qualityAssurance>
</aiToolingStandards>
```

### 7.2. Performance Optimization Framework

Performance optimization must be measurement-driven with clear targets.

```xml
<performanceFramework>
  <targets>
    <metric name="API Response Time" target="p95 &lt; 200ms" measurement="Load testing"/>
    <metric name="Page Load Time" target="p95 &lt; 2s" measurement="Real User Monitoring"/>
    <metric name="Memory Usage" target="&lt; 80% heap utilization" measurement="Runtime profiling"/>
    <metric name="CPU Utilization" target="&lt; 70% average" measurement="System monitoring"/>
  </targets>
  
  <optimizationCycle>
    <step name="Profile">Establish quantitative baseline with realistic workloads</step>
    <step name="Analyze">Identify bottlenecks using data, not assumptions</step>
    <step name="Optimize">Target highest-impact improvements with minimal risk</step>
    <step name="Validate">Measure actual performance gains and regression detection</step>
  </optimizationCycle>
  
  <priorityMatrix>
    <highImpactLowEffort>
      <optimization>Database query optimization and indexing</optimization>
      <optimization>Caching frequently accessed data</optimization>
      <optimization>Connection pooling and resource reuse</optimization>
    </highImpactLowEffort>
    <highImpactHighEffort>
      <optimization>Architectural pattern changes (async processing)</optimization>
      <optimization>Data structure optimization for cache locality</optimization>
      <optimization>Parallel processing and concurrency improvements</optimization>
    </highImpactHighEffort>
  </priorityMatrix>
</performanceFramework>
```