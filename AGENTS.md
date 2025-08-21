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
    <autoCoordinatesWith>sprint-prioritizer</autoCoordinatesWith>
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
  <agent id="studio-coach" role="Master orchestrator for complex multi-agent workflows. Decomposes high-level goals into executable plans for other agents. This is the primary entry point for complex tasks."/>
  <agent id="parallel-worker" role="A technical execution engine that runs a pre-defined parallel work plan. It is typically invoked by studio-coach, not directly by the user."/>
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
    <trigger event="complex-workflow" agent="studio-coach"/>
  </autoTriggers>
</teams>
```

---

**Agent orchestration is as important as agent selection.** Studio-coach orchestrates complex coordination, auto-triggers ensure workflow continuity, and agent teams provide comprehensive, quality-driven solutions.