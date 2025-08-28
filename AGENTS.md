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
*In the Hydra Studio philosophy, the CLI initiates master workflow prompts that hand off to Claude Code with structured planning. The **cofounder** acts as Strategic Head, **studio-producer** as Tactical Orchestrator, and **project-shipper** as Delivery Manager. Mandatory utility agents replace direct tools, ensuring expertise is applied through the Studio hierarchy.*

### Studio Hierarchy Overview
```
User → `hydra` CLI → Master Workflow Prompts → Claude Code Planning → Studio Orchestration

Strategic Level:    cofounder (strategic analysis, Socratic questioning, requirement clarification)
Tactical Level:     studio-producer (execution management, resource allocation)  
Delivery Level:     project-shipper (validation, closure, documentation)
Execution Level:    parallel-worker (worktree management, agent coordination)
Specialist Level:   Domain experts (typescript-node-developer, ui-designer, etc.)
```

### Master Workflow Prompt Integration
The CLI commands trigger specific workflow templates that hand off to Claude Code:
- **`hydra new`** → Planning workflow with Socratic methodology → **cofounder**
- **`hydra run`** → Execution workflow with orchestration → **studio-producer** 
- **`hydra doctor`** → Diagnostic workflow with health checks → System validation
- **`hydra recap`** → Documentation workflow with delivery closure → **project-shipper**

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
*Under the Hydra Studio philosophy, workflows follow a structured hierarchy. The **cofounder** serves as Strategic Head for Socratic analysis and requirement clarification. The **studio-producer** acts as Tactical Orchestrator managing execution and resources. The **project-shipper** handles delivery management and closure. The **parallel-worker** serves as the technical execution engine coordinating specialized agents.*

### Studio Workflow Patterns
```
hydra new "feature" → cofounder (strategic analysis) → plan-generator (tactical planning)
hydra run "epic" → studio-producer (orchestration) → parallel-worker (execution) → specialists
hydra recap "epic" → project-shipper (delivery closure) → comprehensive documentation
```

```xml
<complexityRouting>
  <simple>directAgent</simple>
  <medium>sequentialWorkflow</medium>
  <complex>studioOrchestration</complex>
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
*Under the Studio philosophy, coordination flows through the management hierarchy. The **cofounder** handles strategic requirement clarification, **studio-producer** manages tactical failures and resource conflicts, **project-shipper** ensures delivery quality, and **parallel-worker** coordinates specialist execution.*

```xml
<coordination>
  <handoff type="sequential">
    <rule>ContextTransfer</rule>
    <rule>DependencyCheck</rule>
    <rule>QualityGate</rule>
    <rule><FailureEscalation target="studio-producer"/></rule>
  </handoff>
  <handoff type="parallel">
    <rule>ResourceAllocation</rule>
    <rule><ProgressSync target="studio-producer"/></rule>
    <rule>DependencyManagement</rule>
    <rule>IntegrationPoint</rule>
  </handoff>
  <escalations>
    <trigger condition="agentFailureCascade" target="studio-producer"/>
    <trigger condition="resourceConflict" target="studio-producer"/>
    <trigger condition="dependencyDeadlock" target="studio-producer"/>
    <trigger condition="qualityGateFail" target="project-shipper"/>
    <trigger condition="strategicDecision" target="cofounder"/>
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
  <trigger event="complex-workflow" agent="studio-producer" purpose="tactical orchestration management"/>
</autoTriggers>
```

---

## 🧠 Orchestration Decision Logic

This is the mandatory logic for handling complex tasks and routing to appropriate management agents.

### Task Tool Usage Protocol
**Main Orchestrator**: MUST use the Task tool to invoke studio management agents (cofounder, parallel-worker, project-shipper).  
**Parallel-Worker**: MUST dispatch to specialist agents sequentially using standard agent invocation (NOT the Task tool).

```xml
<orchestrationLogic>
  <decision priority="1">
    <condition>User provides a vague, high-level, or ambiguous goal WITHOUT detailed specifications.</condition>
    <action>Use the **Task tool** to invoke **`cofounder`** for strategic analysis and detailed plan creation.</action>
    <example>"Build a social media app."</example>
    <example>"Improve user retention."</example>
    <excludes>Requests that include detailed plans, TODO files, or step-by-step instructions</excludes>
  </decision>
  <decision priority="2">
    <condition>User provides a detailed plan, TODO.md, epic.md, or well-defined multi-step task list.</condition>
    <action>Use the **Task tool** to invoke **`parallel-worker`** for sequential execution of the existing plan.</action>
    <example>"Implement the changes described in the TODO.md file."</example>
    <example>"Execute the features outlined in `epics/feature-x/epic.md`."</example>
    <excludes>Vague or ambiguous requests requiring strategic analysis</excludes>
  </decision>
  <decision priority="3">
    <condition>Project is complete and needs comprehensive documentation and closure.</condition>
    <action>Use the **Task tool** to invoke **`project-shipper`** for comprehensive recap generation.</action>
    <example>"Create a comprehensive recap of the Living Blueprint implementation."</example>
  </decision>
</orchestrationLogic>

---

## 🏆 Specialized Agent Directory
*Agents are organized by departments (engineering, design, marketing, product, operations, testing). Each embodies best practices, deep expertise, and auto-coordination with others for consistency and quality.*

```xml
<department name="Engineering">
  <agent id="rapid-prototyper" role="MVP Builder">
    <action>BUILD functional prototypes</action>
    <output>working MVP implementations</output>
    <exclusions>production-ready code, architectural design</exclusions>
  </agent>
  <agent id="backend-architect" role="System Architect">
    <action>DESIGN APIs and system architecture</action>
    <output>architectural specifications and implementation plans</output>
    <exclusions>frontend work, prototype development</exclusions>
  </agent>
  <agent id="frontend-developer" role="UI Developer">
    <action>IMPLEMENT user interfaces</action>
    <output>React components and interactive UIs</output>
    <exclusions>backend APIs, system architecture</exclusions>
  </agent>
  <agent id="mobile-app-builder" role="Native App Developer">
    <action>BUILD mobile applications</action>
    <output>iOS/Android native apps</output>
    <exclusions>web development, desktop apps</exclusions>
  </agent>
  <agent id="ai-engineer" role="AI/ML Specialist">
    <action>INTEGRATE AI/ML capabilities</action>
    <output>AI-powered features and models</output>
    <exclusions>general backend work, frontend development</exclusions>
  </agent>
</department>

<department name="Testing">
  <agent id="test-writer-fixer" role="Test Engineer">
    <action>WRITE and FIX comprehensive test suites</action>
    <output>unit, integration, and e2e tests</output>
    <exclusions>production code, architectural decisions</exclusions>
  </agent>
  <agent id="api-tester" role="API Validator">
    <action>TEST API endpoints and contracts</action>
    <output>API test suites and validation reports</output>
    <exclusions>UI testing, performance testing</exclusions>
  </agent>
  <agent id="performance-benchmarker" role="Performance Analyst">
    <action>BENCHMARK system performance</action>
    <output>performance metrics and optimization reports</output>
    <exclusions>functional testing, security testing</exclusions>
  </agent>
</department>

<department name="Design">
  <agent id="ui-designer" role="Interface Designer">
    <action>DESIGN user interfaces and interactions</action>
    <output>UI mockups, design systems, component specs</output>
    <exclusions>implementation code, backend architecture</exclusions>
  </agent>
  <agent id="ux-researcher" role="User Experience Researcher">
    <action>RESEARCH user needs and behaviors</action>
    <output>user research reports and UX recommendations</output>
    <exclusions>visual design, technical implementation</exclusions>
  </agent>
  <agent id="whimsy-injector" role="Delight Specialist">
    <action>ADD delightful micro-interactions</action>
    <output>enhanced user experience with charm</output>
    <exclusions>core functionality, business logic</exclusions>
  </agent>
</department>

<department name="Studio Management">
  <agent id="cofounder" role="Strategic Head">
    <action>ANALYZE ambiguous goals</action>
    <output>strategic-brief.md</output>
    <exclusions>detailed plans, TODO files, well-defined tasks</exclusions>
  </agent>
  <agent id="plan-generator" role="Living Blueprint Architect">
    <action>TRANSFORM strategic briefs</action>
    <output>genesis.xml with execution DAGs</output>
    <exclusions>strategic analysis, execution</exclusions>
  </agent>
  <agent id="studio-producer" role="Tactical Orchestrator">
    <action>COORDINATE multi-team workflows</action>
    <output>resource allocation and timeline management</output>
    <exclusions>single-agent tasks, technical execution</exclusions>
  </agent>
  <agent id="project-shipper" role="Delivery Manager">
    <action>GENERATE post-flight recaps</action>
    <output>comprehensive project documentation</output>
    <exclusions>active development, planning</exclusions>
  </agent>
  <agent id="parallel-worker" role="Technical Execution Engine">
    <action>EXECUTE detailed plans by sequentially dispatching tasks to specialist agents</action>
    <output>coordinated task completion with status tracking</output>
    <method>Reads plan structure, identifies required specialist agents, dispatches tasks sequentially using standard agent invocation</method>
    <exclusions>strategic analysis, vague goals, single-step tasks, using Task tool for parallel dispatch</exclusions>
  </agent>
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

**Agent orchestration follows the Studio hierarchy.** The **cofounder** provides strategic requirement clarification, **studio-producer** orchestrates tactical execution, **project-shipper** ensures delivery quality, auto-triggers maintain workflow continuity, and specialized agent teams deliver comprehensive, expert solutions.

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

---

## 📜 The Living Blueprint System

**Revolutionary Project Management Philosophy**

The Living Blueprint represents a paradigm shift in AI-assisted project management, replacing temporary status files with persistent, comprehensive `genesis.xml` documents that serve as the single source of truth for every epic.

### Core Philosophy

```xml
<livingBlueprintPhilosophy>
  <principle name="ExecutableDocumentation">
    <description>Every project becomes a living document that both describes and executes the work.</description>
    <benefit>Single source of truth eliminates context fragmentation</benefit>
  </principle>
  
  <principle name="ContinuousKnowledgeCapture">
    <description>All insights, decisions, and learnings are automatically captured in structured XML.</description>
    <benefit>Organizational memory that compounds over time</benefit>
  </principle>
  
  <principle name="AutonomousExecution">
    <description>Agents read directly from genesis.xml to understand context and update their progress.</description>
    <benefit>Self-coordinating teams with minimal human oversight</benefit>
  </principle>
</livingBlueprintPhilosophy>
```

### The Complete Workflow

```xml
<workflowSequence>
  <step command="hydra new 'vague goal'">
    <agent>cofounder</agent>
    <output>strategic-brief.md</output>
    <purpose>Transform ambiguous requirements into clear strategic direction</purpose>
  </step>
  
  <step command="hydra plan epic-name">
    <agent>plan-generator</agent>
    <input>strategic-brief.md</input>
    <output>genesis.xml</output>
    <purpose>Create detailed execution DAG with agent assignments and dependencies</purpose>
  </step>
  
  <step command="hydra run epic-name">
    <agent>parallel-worker</agent>
    <input>genesis.xml</input>
    <output>completed genesis.xml with results</output>
    <purpose>Execute all tasks in parallel using genesis.xml coordination</purpose>
  </step>
  
  <step command="hydra pm view epic-name">
    <tool>xmlstarlet + bash</tool>
    <input>genesis.xml</input>
    <output>human-readable project status</output>
    <purpose>Real-time project visibility and progress tracking</purpose>
  </step>
  
  <step command="hydra recap epic-name">
    <agent>project-shipper</agent>
    <input>completed genesis.xml</input>
    <output>comprehensive project documentation</output>
    <purpose>Generate permanent record with insights and metrics</purpose>
  </step>
</workflowSequence>
```

### Living Blueprint Benefits

**For Projects:**
- **Persistent Context**: No more lost information between sessions
- **Real-time Visibility**: Always know exactly what's happening
- **Automatic Documentation**: Self-documenting projects with searchable history

**For Teams:**
- **Autonomous Coordination**: Agents self-coordinate through shared XML state
- **Knowledge Compound**: Every project builds organizational intelligence
- **Quality Consistency**: Universal standards across all implementations

**For Organizations:**
- **Scalable Management**: Handle unlimited concurrent projects
- **Learning Organization**: Insights from every project inform future work  
- **Predictable Outcomes**: Proven patterns reduce project risk

The Living Blueprint transforms project management from manual coordination into autonomous, intelligent execution that gets better with every epic completed.