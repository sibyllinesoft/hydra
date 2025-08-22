# AGENTS - Rapid Selection Guide & Intelligent Orchestrator

## 🧠 The Context Firewall Philosophy

The primary purpose of our multi-agent system is **context preservation**. Agents act as "context firewalls" by performing verbose, heavy-lifting tasks in isolation and returning only concise, actionable summaries to the main conversation. This prevents context window bloat and allows for virtually unlimited conversation length.

- **Without Agents**: Main thread reads 10 files → Context explodes → Conversation dies.
- **With Agents**: An agent reads 10 files → Main thread gets one summary → Context is preserved.

This principle is the key to handling complex, long-running projects effectively.

**Primary Directive**  
Agents First, Tools Second - Expert Context Over General Purpose

---

## ⚡ Rapid Agent Selection
*Mandatory utility agents must replace direct tools. Specialized agents are matched to user intents. Studio-coach handles orchestration when workflows grow complex. This ensures expertise is applied before general-purpose tools.*

```xml
<agents category="mandatory">
  <agent id="file-creator" domain="file/directory creation">
    <triggers>create|generate|new file|setup structure</triggers>
    <autoCoordinatesWith>git-workflow</autoCoordinatesWith>
  </agent>
  <agent id="git-workflow" domain="git operations">
    <triggers>commit|branch|merge|push|pull</triggers>
    <autoCoordinatesWith>file-creator,devops-automator</autoCoordinatesWith>
  </agent>
  <agent id="context-fetcher" domain="internal documentation">
    <triggers>docs|README|internal guide|project docs</triggers>
    <autoCoordinatesWith>knowledge-fetcher</autoCoordinatesWith>
  </agent>
  <agent id="knowledge-fetcher" domain="external research">
    <triggers>search|Readwise|Context7|web search|find articles</triggers>
    <autoCoordinatesWith>context-fetcher</autoCoordinatesWith>
  </agent>
  <agent id="date-checker" domain="date/time calculations">
    <triggers>when|schedule|time since|date|timestamp</triggers>
    <autoCoordinatesWith>product-manager</autoCoordinatesWith>
  </agent>
</agents>
```

```xml
<selectionRules>
  <rule intent="Build new feature" primary="rapid-prototyper">
    <secondary>ui-designer</secondary>
    <secondary>frontend-developer</secondary>
  </rule>
  <rule intent="Fix this bug" primary="backend-architect|frontend-developer">
    <autoTrigger>test-writer-fixer</autoTrigger>
  </rule>
  <rule intent="Test this code" primary="test-writer-fixer">
    <secondary>api-tester</secondary>
    <secondary>performance-benchmarker</secondary>
  </rule>
  <rule intent="Deploy this" primary="devops-automator">
    <secondary>project-shipper</secondary>
  </rule>
  <rule intent="Design this UI" primary="ui-designer">
    <secondary>frontend-developer</secondary>
    <secondary>whimsy-injector</secondary>
  </rule>
</selectionRules>
```

---

## 🎼 Orchestration Workflows
*Complexity determines orchestration style. Simple tasks map to one agent, medium tasks chain 2–3 agents. For complex tasks, the **studio-coach** is the primary entry point. It is the master orchestrator for complex multi-agent workflows that decomposes high-level goals into executable plans for other agents. It invokes executors like the **parallel-worker**, a technical execution engine that runs a pre-defined parallel work plan. The parallel-worker is typically invoked by studio-coach, not directly by the user.*

```xml
<complexityRouting>
  <simple>directAgent</simple>
  <medium>sequentialWorkflow</medium>
  <complex>studioCoachOrchestration</complex>
</complexityRouting>
```

```xml
<workflow id="feature-development">
  <step order="1" agent="rapid-prototyper"/>
  <step order="2" agent="ui-designer"/>
  <step order="3" agent="frontend-developer"/>
  <step order="4" agent="test-writer-fixer" autoTrigger="true"/>
  <step order="5" agent="whimsy-injector" autoTrigger="true"/>
</workflow>

<workflow id="backend-development">
  <step order="1" agent="backend-architect"/>
  <step order="2" agent="language-specific-developer"/>
  <step order="3" agent="test-writer-fixer" autoTrigger="true"/>
  <step order="4" agent="devops-automator"/>
</workflow>

<workflow id="legacy-modernization">
  <step order="1" agent="refactoring-specialist"/>
  <step order="2" agent="language-specific-developer"/>
  <step order="3" agent="test-writer-fixer" autoTrigger="true"/>
  <step order="4" agent="performance-benchmarker"/>
</workflow>
```

---

## 📋 Coordination Protocols
*Sequential and parallel handoffs define how context and resources flow between agents. Studio-coach manages escalations for failures, conflicts, or timeline pressure. Feedback loops ensure performance and quality improve over time.*

```xml
<coordination>
  <handoff type="sequential">
    <rule>ContextTransfer</rule>
    <rule>DependencyCheck</rule>
    <rule>QualityGate</rule>
    <rule><FailureEscalation target="studio-coach"/></rule>
  </handoff>
  <handoff type="parallel">
    <rule>ResourceAllocation</rule>
    <rule><ProgressSync target="studio-coach"/></rule>
    <rule>DependencyManagement</rule>
    <rule>IntegrationPoint</rule>
  </handoff>
  <escalations>
    <trigger condition="agentFailureCascade" target="studio-coach"/>
    <trigger condition="resourceConflict" target="studio-coach"/>
    <trigger condition="dependencyDeadlock" target="studio-coach"/>
    <trigger condition="qualityGateFail" target="studio-coach"/>
    <trigger condition="timelinePressure" target="studio-coach"/>
  </escalations>
  <feedbackLoops>
    <performanceOptimization>Track coordination, identify patterns, reduce overhead</performanceOptimization>
    <qualityAssurance>Validate outcomes, monitor quality, improve workflows</qualityAssurance>
  </feedbackLoops>
</coordination>
```

---

## 🎯 Auto-triggering Agents
*Certain events automatically trigger specific agents. These triggers ensure continuous coverage and orchestrated continuity without human intervention.*

```xml
<autoTriggers>
  <trigger event="code-change" agent="test-writer-fixer" purpose="immediate test coverage"/>
  <trigger event="ui-change" agent="whimsy-injector" purpose="add delightful interactions"/>
  <trigger event="feature-flags" agent="experiment-tracker" purpose="A/B testing setup"/>
  <trigger event="complex-workflow" agent="studio-coach" purpose="orchestration management"/>
</autoTriggers>
```

---

## 🏆 Specialized Agent Directory
*Agents are organized by departments (engineering, design, marketing, product, operations, testing). Each embodies best practices, deep expertise, and auto-coordination with others for consistency and quality.*

```xml
<department name="Engineering">
  <agent id="rapid-prototyper" role="MVP builder" coords="ui-designer,test-writer-fixer"/>
  <agent id="backend-architect" role="API/system design" coords="devops-automator,api-tester"/>
  <agent id="frontend-developer" role="UI implementation" coords="ui-designer,whimsy-injector"/>
  <agent id="mobile-app-builder" role="native apps" coords="app-store-optimizer"/>
  <agent id="ai-engineer" role="AI/ML integration" coords="performance-benchmarker,python-backend-developer"/>
</department>

<department name="Testing">
  <agent id="api-tester"/>
  <agent id="performance-benchmarker"/>
  <agent id="test-results-analyzer"/>
  <agent id="tool-evaluator"/>
  <agent id="workflow-optimizer"/>
</department>

<department name="Design">
  <agent id="ui-designer"/>
  <agent id="ux-researcher"/>
  <agent id="whimsy-injector"/>
  <agent id="brand-guardian"/>
  <agent id="visual-storyteller"/>
</department>

<department name="Project Management">
  <agent id="studio-coach" role="Strategic Planner - Decomposes very complex, ambiguous goals into a structured plan file. Acts as an optional first step before execution."/>
  <agent id="parallel-worker" role="Core Execution Engine - Takes a high-level goal or a plan file, creates and manages the worktree, and orchestrates subagents to perform the work in parallel. The primary driver for complex tasks."/>
</department>

<department name="Marketing">
  <agent id="growth-hacker"/>
  <agent id="content-creator"/>
  <agent id="tiktok-strategist"/>
  <agent id="instagram-curator"/>
  <agent id="reddit-community-builder"/>
</department>
```

---

## 🔄 Teams and Relationships
*Relationships between agents are captured as teams and stacks. Auto-triggers enforce continuity at boundaries. These groupings ensure coordination across disciplines.*

```xml
<teams>
  <team id="development-trio">
    <agent>rapid-prototyper</agent>
    <agent>frontend-developer</agent>
    <agent>test-writer-fixer</agent>
  </team>
  <team id="backend-stack">
    <agent>backend-architect</agent>
    <agent>devops-automator</agent>
    <agent>api-tester</agent>
  </team>
  <team id="design-duo">
    <agent>ui-designer</agent>
    <agent>whimsy-injector</agent>
  </team>
  <autoTriggers>
    <trigger event="code-change" agent="test-writer-fixer"/>
    <trigger event="ui-change" agent="whimsy-injector"/>  
    <trigger event="feature-flags" agent="experiment-tracker"/>
    <trigger event="complex-workflow" agent="parallel-worker"/>
  </autoTriggers>
</teams>
```

---

**Agent orchestration is as important as agent selection.** Studio-coach orchestrates complex coordination, auto-triggers ensure workflow continuity, and agent teams provide comprehensive, quality-driven solutions.

---

## 🏗️ AGENT ARCHITECTURE - Master Template System

### Core Innovation: Master Template Inheritance

The Claude Code Studio agent system implements a revolutionary **master template architecture** that combines universal development best practices with cutting-edge language-specific expertise. This design ensures consistency, quality, and expertise across all engineering implementations.

```yaml
Architecture_Pattern:
  Universal_Foundation:
    source: "master-software-developer.md"
    provides: "E-H-A-E-D-R cycles, SOLID principles, TDD, security patterns"
    benefits: "Consistent quality standards across all languages"
    
  Language_Specialization:
    pattern: "Inheritance + Extension"
    provides: "2024-2025 ecosystem expertise, framework knowledge, optimization patterns"
    benefits: "Deep domain knowledge + universal best practices"
    
  Quality_Enforcement:
    mechanism: "Template-driven standards"
    ensures: "90%+ test coverage, security-first development, comprehensive documentation"
    benefits: "Zero-defect quality across all implementations"
```

### Architectural Benefits

**Consistency at Scale:**
- All engineering agents follow identical quality patterns
- Universal development methodology across all languages
- Consistent user experience regardless of technology choice

**Expertise Without Compromise:**
- Deep language-specific knowledge (2024-2025 frameworks)
- Universal best practices (SOLID, TDD, security)
- Cutting-edge optimization patterns per ecosystem

**Maintainability & Evolution:**
- Single template update propagates to all specialists
- Easy addition of new language-specific agents
- Continuous improvement without agent-by-agent updates

### Master Template System

**Core Template: master-software-developer.md**

```yaml
Universal_Patterns:
  E_H_A_E_D_R_Cycles:
    purpose: "Research-validated iterative development methodology"
    components:
      - Examine: "Current state analysis with measurable baseline"
      - Hypothesize: "Specific improvement theory with success criteria"
      - Act: "Minimal viable change implementation"
      - Evaluate: "Quantitative result measurement against baseline"
      - Decide: "Continue iterating, escalate, or declare complete"
      - Repeat: "Next cycle with updated context and learnings"
    
  SOLID_Principles:
    enforcement: "Mandatory compliance for all implementations"
    validation: "Automated checks and code review requirements"
    
  TDD_Methodology:
    requirement: "Test-first development for all new code"
    coverage: "Minimum 90% test coverage"
    
  Security_First_Development:
    principle: "Security by design, not as afterthought"
    patterns: "Input validation, authentication, authorization, encryption"
    
  Quality_Standards:
    documentation: "Comprehensive inline and architectural documentation"
    performance: "Benchmarking and optimization requirements"
    maintainability: "Code readability and refactoring support"
```

### Language-Specific Extensions

**Framework Expertise:**
```yaml
typescript_node:
  frameworks: ["Hono", "Fastify", "Vitest", "Drizzle"]
  patterns: ["Branded types", "Template literals", "Satisfies operator"]
  optimization: ["Bundle size", "Runtime performance", "Type safety"]
  
python_backend:
  frameworks: ["FastAPI", "SQLAlchemy 2.0+", "Pydantic v2", "asyncio"]
  patterns: ["Async-first", "Type hints", "Dependency injection"]
  optimization: ["Concurrent throughput", "Memory efficiency", "Validation speed"]
  
rust_backend:
  frameworks: ["Axum", "SQLx", "Tokio", "Serde"]
  patterns: ["Zero-cost abstractions", "Memory safety", "Compile-time optimization"]
  optimization: ["Performance", "Concurrency", "Resource efficiency"]
  
go_backend:
  frameworks: ["Gin", "Fiber", "GORM", "goroutines"]
  patterns: ["Simplicity", "Concurrency", "Interface composition"]
  optimization: ["Throughput", "Latency", "Scalability"]
  
nodejs_backend:
  frameworks: ["Express", "Koa", "Cluster", "Streams"]
  patterns: ["Event loops", "Clustering", "Stream processing"]
  optimization: ["Runtime efficiency", "Memory management", "Async patterns"]
```

### Agent Specialization Hierarchy

**Tier 1: Universal Foundation Agents**
```yaml
rapid_prototyper:
  inherits: "master-software-developer.md"
  specialization: "MVP development and feature implementation"
  focus: "Speed + quality balance for rapid iteration"
  
backend_architect:
  inherits: "master-software-developer.md"
  specialization: "System architecture and API design"
  focus: "Scalability, security, and architectural patterns"
  
frontend_developer:
  inherits: "master-software-developer.md"
  specialization: "UI implementation and component development"
  focus: "User experience, performance, and accessibility"
```

**Tier 2: Language-Specific Masters**
```yaml
typescript_node_developer:
  inherits: "master-software-developer.md"
  specialization: "TypeScript/Node.js full-stack development"
  frameworks: "Hono, Fastify, Vitest, modern TypeScript patterns"
  expertise: "2024-2025 ecosystem, performance optimization, type safety"
  
python_backend_developer:
  inherits: "master-software-developer.md"
  specialization: "Python async-first backend development"
  frameworks: "FastAPI, SQLAlchemy 2.0+, Pydantic v2, asyncio patterns"
  expertise: "Async optimization, data validation, API performance"
  
rust_backend_developer:
  inherits: "master-software-developer.md"
  specialization: "Rust high-performance backend systems"
  frameworks: "Axum, SQLx, Tokio, zero-cost abstractions"
  expertise: "Memory safety, concurrency, systems programming"
  
go_backend_developer:
  inherits: "master-software-developer.md"
  specialization: "Go microservices and concurrent systems"
  frameworks: "Gin, Fiber, goroutines, interface patterns"
  expertise: "Simplicity, concurrency, distributed systems"
  
nodejs_backend_developer:
  inherits: "master-software-developer.md"
  specialization: "Pure JavaScript backend optimization"
  frameworks: "ES2024, event loops, clustering, streams"
  expertise: "Runtime optimization, memory management, performance"
```

**Tier 3: Specialized Problem Solvers**
```yaml
super_hard_problem_developer:
  inherits: "master-software-developer.md"
  specialization: "Complex persistent technical challenges"
  model: "Opus (most capable model for difficult problems)"
  expertise: "Multi-dimensional analysis, systematic debugging, advanced problem-solving"
  
refactoring_specialist:
  inherits: "master-software-developer.md"
  specialization: "AI-assisted code transformation and technical debt reduction"
  techniques: "iSMELL framework, automated refactoring, maintainability optimization"
  expertise: "Legacy modernization, code quality improvement, systematic refactoring"
```

### Template Compliance & Quality Assurance

**Mandatory Compliance Standards:**
```yaml
Quality_Gates:
  test_coverage:
    minimum: "90% line coverage"
    requirement: "All new code must include comprehensive tests"
    validation: "Automated coverage reporting"
    
  security_standards:
    requirement: "Security-first development patterns"
    validation: "Input validation, authentication, authorization checks"
    compliance: "OWASP guidelines and security best practices"
    
  documentation_completeness:
    requirement: "Comprehensive inline and architectural documentation"
    standard: "TSDoc/Docstrings for all public APIs"
    validation: "Documentation coverage metrics"
    
  performance_benchmarking:
    requirement: "Performance baseline and optimization targets"
    measurement: "Response time, throughput, resource usage metrics"
    validation: "Automated performance regression testing"
    
  code_quality:
    requirement: "SOLID principles and clean architecture"
    validation: "Linting, complexity analysis, maintainability metrics"
    standards: "Consistent patterns across all language implementations"
```

### Agent Selection Logic

**Intelligent Routing Decision Tree:**
```yaml
task_routing_logic:
  language_specific_tasks:
    condition: "Task involves specific language/framework"
    action: "Route to appropriate language specialist"
    examples:
      - "TypeScript API" -> typescript_node_developer
      - "Python async" -> python_backend_developer
      - "Rust performance" -> rust_backend_developer
      
  complex_problems:
    condition: "Persistent technical challenges"
    action: "Escalate to super_hard_problem_developer"
    triggers: ["Multiple failed attempts", "Cross-domain complexity", "Advanced debugging needed"]
    
  refactoring_needs:
    condition: "Legacy code modernization"
    action: "Route to refactoring_specialist"
    triggers: ["Technical debt reduction", "Code quality improvement", "Framework migration"]
    
  general_development:
    condition: "Standard development tasks"
    action: "Use general engineering agents"
    agents: ["rapid_prototyper", "backend_architect", "frontend_developer"]
```

### Architecture Performance Metrics

**System-Wide Quality Metrics:**
```yaml
template_effectiveness:
  pattern_consistency:
    target: ">95% adherence to master template patterns"
    measurement: "Automated pattern analysis across all agents"
    
  quality_standardization:
    target: "Uniform quality metrics across all language implementations"
    measurement: "Cross-agent quality score comparison"
    
development_efficiency:
  language_specialist_utilization:
    target: ">80% of backend tasks routed to appropriate specialists"
    benefit: "Optimal expertise matching for each task"
    
  problem_resolution_success:
    target: ">90% success rate for complex problem escalation"
    benefit: "Advanced problem-solving capabilities when needed"
    
code_quality_benefits:
  consistency_across_languages:
    achievement: "Same quality standards regardless of technology choice"
    measurement: "Quality metrics comparison across language implementations"
    
  performance_optimization:
    achievement: ">20% better performance from language specialists vs general agents"
    measurement: "Performance benchmarking and optimization tracking"
```

**Key Architecture Achievements:**
1. **Universal Quality**: Master template ensures consistent excellence across all implementations
2. **Specialized Expertise**: Language-specific agents provide cutting-edge ecosystem knowledge  
3. **Scalable Maintenance**: Single template updates benefit all engineering agents
4. **Research Integration**: Continuous incorporation of latest development research and best practices
5. **Quality Assurance**: Automated compliance and consistency validation across the entire system

This architecture enables unlimited conversation length through agent delegation while maintaining expert-level quality through universal template compliance. The system scales both technically and organizationally, supporting projects of any complexity while preserving context and ensuring excellence.