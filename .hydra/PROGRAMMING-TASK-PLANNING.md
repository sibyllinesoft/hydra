# PROGRAMMING TASK PLANNING TEMPLATE

**Purpose**: A structured template for planning programming tasks, enhanced with XML to provide a machine-readable format for improved tooling and AI-driven analysis.  
**Usage**: Copy and fill out this template. The Markdown provides human-readable context, while the XML provides a structured data format.

---

## 📋 TASK OVERVIEW

This section captures the high-level metadata for the programming task. The XML block below structures this information as key-value pairs for easy parsing and integration into project management systems.

```xml
<taskOverview>
  <title>[Clear, descriptive title]</title>
  <type>[Feature | Bug Fix | Refactor | Performance | Security | Technical Debt]</type>
  <priority>[Critical | High | Medium | Low]</priority>
  <complexity scale="1-5">[1-5]</complexity>
  <estimatedTime unit="Hours/Days">[Hours/Days]</estimatedTime>
  <assignedDeveloper>[Name]</assignedDeveloper>
  <dateCreated format="YYYY-MM-DD">[YYYY-MM-DD]</dateCreated>
</taskOverview>
```

---

## 🎯 PHASE 1: REQUIREMENT ANALYSIS

### 1.1 Problem Statement Validation

This section ensures a thorough understanding of the problem before any technical work begins. The XML checklist structures the core validation questions.

```xml
<problemStatementValidation>
  <problemDescription>
    <question id="what">What specific problem are we solving?</question>
    <question id="why">Why is this problem worth solving?</question>
    <question id="consequence">What happens if we don't solve it?</question>
  </problemDescription>
  <stakeholderImpact>
    <question id="users">Who are the end users affected?</question>
    <question id="businessValue">What business value does this provide?</question>
    <question id="compliance">Are there compliance/legal requirements?</question>
  </stakeholderImpact>
  <context>
    <question id="origin">What led to this requirement?</question>
    <question id="dependencies">Are there related issues or dependencies?</question>
    <question id="constraints">What constraints exist (time, budget, technical)?</question>
  </context>
</problemStatementValidation>
```

### 1.2 Scope Definition and Boundaries

Clearly defining what is and is not included in the task is crucial for managing expectations. The XML below delineates these boundaries.

```xml
<scopeDefinition>
  <inScope>
    <item>[Specific feature/fix item 1]</item>
    <item>[Specific feature/fix item 2]</item>
  </inScope>
  <outOfScope>
    <item>[Explicitly excluded item 1]</item>
    <item>[Explicitly excluded item 2]</item>
  </outOfScope>
  <boundaries>
    <condition type="edgeCaseHandled">[What edge cases must be handled?]</condition>
    <condition type="edgeCaseIgnored">[What edge cases are explicitly NOT handled?]</condition>
    <condition type="integration">[What integrations are required vs optional?]</condition>
  </boundaries>
</scopeDefinition>
```

### 1.3 Success Criteria and Acceptance Tests

This section defines measurable success criteria using a structured format. The functional and non-functional requirements are listed, and acceptance tests are modeled in a Gherkin-like XML structure.

```xml
<successCriteria>
  <functionalRequirements>
    <requirement>[Requirement 1 with measurable criteria]</requirement>
    <requirement>[Requirement 2 with measurable criteria]</requirement>
  </functionalRequirements>
  <nonFunctionalRequirements>
    <requirement type="Performance" metric="Response time &lt; 200ms" />
    <requirement type="Scalability" metric="Handle 1000 concurrent users" />
    <requirement type="Security" metric="All inputs validated" />
    <requirement type="Accessibility" metric="WCAG 2.1 AA compliance" />
  </nonFunctionalRequirements>
  <acceptanceTests>
    <scenario name="Happy path">
      <given>Initial state</given>
      <when>Action performed</when>
      <then>Expected outcome</then>
    </scenario>
    <scenario name="Error case">
      <given>Error condition</given>
      <when>Action performed</when>
      <then>Expected error handling</then>
    </scenario>
    <scenario name="Edge case">
      <given>Edge condition</given>
      <when>Action performed</when>
      <then>Expected behavior</then>
    </scenario>
  </acceptanceTests>
</successCriteria>
```

### 1.4 Risk Assessment and Mitigation Strategies

Identifying and planning for potential risks early is essential. The XML structures each risk with its probability, impact, and corresponding mitigation and contingency plans.

```xml
<riskAssessment>
  <risk>
    <description>[Risk 1]</description>
    <probability>[High | Med | Low]</probability>
    <impact>[High | Med | Low]</impact>
    <mitigation>[Prevention strategy]</mitigation>
    <contingency>[Plan if risk occurs]</contingency>
  </risk>
  <risk>
    <description>[Risk 2]</description>
    <probability>[High | Med | Low]</probability>
    <impact>[High | Med | Low]</impact>
    <mitigation>[Prevention strategy]</mitigation>
    <contingency>[Plan if risk occurs]</contingency>
  </risk>
</riskAssessment>
```

---

## 🏗️ PHASE 2: TECHNICAL PLANNING

### 2.1 Architecture Design and Patterns

Before writing code, it's important to design how it will fit into the existing system. This XML section outlines architectural considerations, including patterns and SOLID principles.

```xml
<architectureDesign>
  <review>
    <question>How does this fit into current system architecture?</question>
    <question>What existing patterns should be followed?</question>
    <question>Are there architectural changes required?</question>
  </review>
  <patterns>
    <pattern name="Repository">For data access</pattern>
    <pattern name="Factory">For object creation</pattern>
    <pattern name="Observer">For event handling</pattern>
  </patterns>
  <solidPrinciplesChecklist>
    <principle name="Single Responsibility">Each class/function has one responsibility</principle>
    <principle name="Open/Closed">Open for extension, closed for modification</principle>
    <principle name="Liskov Substitution">Subtypes substitutable for base types</principle>
    <principle name="Interface Segregation">No forced dependency on unused interfaces</principle>
    <principle name="Dependency Inversion">Depend on abstractions, not concretions</principle>
  </solidPrinciplesChecklist>
</architectureDesign>
```

### 2.2 Technology Stack Validation

This section confirms technology choices, including any new dependencies. The XML structures the list of new dependencies and the verification checklist.

```xml
<technologyStack>
  <newDependencies>
    <dependency name="[Dependency 1]">
      <reason>[Why needed]</reason>
      <versionConstraints>[Version constraints]</versionConstraints>
    </dependency>
    <dependency name="[Dependency 2]">
      <reason>[Why needed]</reason>
      <versionConstraints>[Version constraints]</versionConstraints>
    </dependency>
  </newDependencies>
  <compatibilityVerification>
    <check item="Version compatibility with existing dependencies" />
    <check item="License compatibility" />
    <check item="Security vulnerability assessment" />
    <check item="Bundle size impact (for frontend)" />
  </compatibilityVerification>
</technologyStack>
```

### 2.3 Code Organization and File Structure

Planning the file structure in advance promotes consistency. The XML below defines the new file tree and lists files that will be modified.

```xml
<codeOrganization>
  <newFileStructure>
    <directory name="src">
      <directory name="[component/feature]">
        <file name="index.ts" description="Public exports" />
        <file name="[Component].tsx" description="Main implementation" />
        <file name="[Component].test.tsx" description="Unit tests" />
        <file name="[Component].stories.tsx" description="Storybook stories (if UI)" />
        <file name="types.ts" description="TypeScript interfaces" />
        <file name="utils.ts" description="Helper functions" />
        <file name="README.md" description="Component documentation" />
      </directory>
    </directory>
  </newFileStructure>
  <modifiedFiles>
    <file path="[File 1]" reason="[What changes and why]" />
    <file path="[File 2]" reason="[What changes and why]" />
  </modifiedFiles>
  <apiStrategy>
    <question>How will new code be imported by other modules?</question>
    <question>What public APIs will be exposed?</question>
    <question>Are there breaking changes to existing APIs?</question>
  </apiStrategy>
</codeOrganization>
```

### 2.4 API Design and Contracts

Defining clear contracts for APIs, data models, and errors is fundamental. This XML provides a structure for these definitions using a format inspired by type definitions.

```xml
<apiContracts>
  <publicApi name="[APIName]">
    <method name="[methodName]">
      <parameter name="[paramName]" type="[ParamType]" />
      <returns type="Promise&lt;[ReturnType]&gt;" />
      <description>JSDoc comments here</description>
    </method>
  </publicApi>
  <dataModel name="[ModelName]">
    <property name="id" type="string" required="true" />
    <property name="[propertyName]" type="[Type]" required="true" />
  </dataModel>
  <errorContract name="[ErrorType]">
    <property name="code" type="string" />
    <property name="message" type="string" />
    <property name="details" type="unknown" required="false" />
  </errorContract>
</apiContracts>
```

---

## 🔍 PHASE 3: QUALITY ASSURANCE PLANNING

### 3.1 Test Coverage Strategy

A comprehensive testing strategy is planned before implementation. The XML outlines the plan for unit, integration, and end-to-end tests, including coverage targets.

```xml
<testStrategy>
  <unitTests>
    <targetFunction name="[Function 1]" cases="Happy path, error cases, edge cases" />
    <targetFunction name="[Function 2]" cases="Happy path, error cases, edge cases" />
    <coverage>
      <target type="minimum" value="80%" />
      <target type="goal" value="90%" />
      <target type="criticalPaths" value="100%" />
    </coverage>
  </unitTests>
  <integrationTests>
    <scenario>API endpoint + database integration</scenario>
    <scenario>Component + external service integration</scenario>
    <scenario>Cross-module data flow</scenario>
  </integrationTests>
  <e2eTests>
    <userJourney>Primary user workflow</userJourney>
    <userJourney>Error recovery workflow</userJourney>
    <tools>
      <tool>Playwright</tool>
      <tool>Cypress</tool>
    </tools>
  </e2eTests>
</testStrategy>
```

### 3.2 Type Safety Planning

This section outlines the strategy for ensuring type safety, particularly in TypeScript projects. The XML defines structures for interfaces and validation strategies.

```xml
<typeSafetyPlan>
  <interfaceDefinition name="[ComponentProps]">
    <property name="[prop1]" type="[Type1]" optional="false" />
    <property name="[prop2]" type="[OptionalType2]" optional="true" />
    <property name="[prop3]" type="[Type3] | [Type4]" optional="false" />
  </interfaceDefinition>
  <validationStrategies>
    <strategy type="Runtime" tool="Zod/Joi for API inputs" />
    <strategy type="Compile-time" tool="Strict TypeScript config" />
    <strategy type="Type-guard" description="Implement type narrowing functions" />
    <strategy type="Generic" description="Use generics for reusable components" />
  </validationStrategies>
  <genericType example="interface [GenericInterface]&lt;T&gt; { data: T; }">
    <consideration>Plan generic types for reusability.</consideration>
    <consideration>Define constraints where necessary (e.g., T extends [BaseType]).</consideration>
  </genericType>
</typeSafetyPlan>
```

### 3.3 Documentation Planning

This section specifies all documentation requirements. The XML below structures the plan, including which functions to document, README updates, and the conditions for creating an Architecture Decision Record (ADR).

```xml
<documentationPlan>
  <codeDocumentation standard="TSDoc/Docstrings">
    <requirement>All public functions</requirement>
    <requirement>Complex private functions</requirement>
    <requirement>All exported types/interfaces</requirement>
    <template>
      <description>Brief description of what the function does</description>
      <param name="param1" description="Description of param1" />
      <returns>Description of return value</returns>
      <example lang="typescript">const result = functionName(value1, value2);</example>
      <throws type="ErrorType" condition="When this specific error occurs" />
    </template>
  </codeDocumentation>
  <readmeUpdates>
    <section>Installation instructions</section>
    <section>Usage examples</section>
    <section>API documentation</section>
  </readmeUpdates>
  <apiDocs standard="OpenAPI/Swagger">
    <section>Request/response examples</section>
    <section>Error code documentation</section>
    <section>Authentication requirements</section>
  </apiDocs>
  <adrTrigger>
    <condition>Significant architectural decision made</condition>
    <condition>Technology choice with trade-offs</condition>
    <condition>Breaking change introduced</condition>
  </adrTrigger>
</documentationPlan>
```

---

## 🚀 PHASE 4: IMPLEMENTATION PLANNING

### 4.1 Task Breakdown

This section breaks the implementation into small, manageable phases and tasks. The XML represents the sequence of tasks and their dependencies as a graph structure.

```xml
<implementationPlan>
  <phases>
    <phase number="1" name="Core Logic">
      <task>Core function implementation</task>
      <task>Unit tests for core logic</task>
      <task>Type definitions</task>
    </phase>
    <phase number="2" name="Integration Layer">
      <task>API integration</task>
      <task>Integration tests</task>
      <task>Error handling</task>
    </phase>
    <phase number="3" name="User Interface">
      <task>Component implementation</task>
      <task>Component tests</task>
      <task>Storybook stories</task>
    </phase>
    <phase number="4" name="End-to-End">
      <task>E2E test implementation</task>
      <task>Performance testing</task>
      <task>Documentation</task>
    </phase>
  </phases>
  <dependencies>
    <graph type="Directed">
      <node id="core" label="Core Logic" />
      <node id="integration" label="Integration Layer" />
      <node id="ui" label="User Interface" />
      <node id="e2e" label="E2E Testing" />
      <edge from="core" to="integration" />
      <edge from="integration" to="ui" />
      <edge from="ui" to="e2e" />
    </graph>
  </dependencies>
</implementationPlan>
```

### 4.2 Feature Branching Strategy

This section outlines the Git workflow for the task. The XML specifies naming conventions, the base branch, and the merge strategy.

```xml
<branchingStrategy>
  <branchNaming convention="type/[task-name]" examples="feature/add-login, fix/button-alignment"/>
  <baseBranch>[main | develop]</baseBranch>
  <mergeStrategy>[Squash | Merge commit | Rebase]</mergeStrategy>
  <commitMessageFormat>
    <header>type(scope): brief description</header>
    <body>Longer description if needed</body>
  </commitMessageFormat>
</branchingStrategy>
```

### 4.3 Code Review Checkpoints

Defining checkpoints for code review ensures incremental feedback. The XML lists these checkpoints and provides a checklist for reviewers.

```xml
<codeReviewPlan>
  <checkpoints>
    <checkpoint>Core logic + unit tests</checkpoint>
    <checkpoint>Integration layer + integration tests</checkpoint>
    <checkpoint>UI components + component tests</checkpoint>
    <checkpoint>E2E tests + documentation</checkpoint>
  </checkpoints>
  <reviewerChecklist>
    <item>Code follows project style guidelines</item>
    <item>All new code has tests</item>
    <item>Documentation is updated</item>
    <item>No console.log/debug statements</item>
    <item>Error handling is appropriate</item>
    <item>Performance considerations addressed</item>
    <item>Security best practices followed</item>
  </reviewerChecklist>
</codeReviewPlan>
```

---

## ✅ PHASE 5: VALIDATION & DEPLOYMENT PLANNING

### 5.1 Testing Execution Plan

This section defines the order for executing different types of tests. The XML provides a structured sequence for automated and manual testing.

```xml
<testExecutionPlan>
  <step number="1" type="Unit">
    <command>npm run test:unit</command>
    <description>Fastest feedback loop, run first.</description>
  </step>
  <step number="2" type="Integration">
    <command>npm run test:integration</command>
    <description>Run after unit tests pass.</description>
  </step>
  <step number="3" type="E2E">
    <command>npm run test:e2e</command>
    <description>Run after integration tests pass, covers full user journeys.</description>
  </step>
  <step number="4" type="Manual">
    <scenario>[Manual test scenario 1]</scenario>
    <scenario>[Manual test scenario 2]</scenario>
  </step>
</testExecutionPlan>
```

### 5.2 Performance Benchmarking

If performance is a key requirement, this section outlines the plan for benchmarking. The XML structures the metrics, tools, and test commands.

```xml
<performanceBenchmarking>
  <metrics>
    <metric name="Response time" target="&lt; Xms" />
    <metric name="Memory usage" target="&lt; XMB" />
    <metric name="CPU usage" target="&lt; X%" />
    <metric name="Bundle size" target="&lt; XkB" />
  </metrics>
  <tools>
    <tool name="Lighthouse" purpose="Web performance" />
    <tool name="k6" purpose="Load testing" />
    <tool name="Profiler" purpose="Memory/CPU analysis" />
  </tools>
  <commands>
    <command>npm run perf:test</command>
    <command>npm run bundle:analyze</command>
  </commands>
</performanceBenchmarking>
```

### 5.3 Security Validation

This section provides a checklist for security validation. The XML structures the security requirements and audit commands.

```xml
<securityValidation>
  <checklist>
    <item area="Input Validation">All user inputs validated</item>
    <item area="Authentication">Proper auth checks in place</item>
    <item area="Authorization">Correct permission checks</item>
    <item area="Data Sanitization">XSS prevention measures</item>
    <item area="SQL Injection">Parameterized queries used</item>
    <item area="Secrets Management">No hardcoded secrets</item>
  </checklist>
  <auditCommands>
    <command ecosystem="npm">npm audit</command>
    <command ecosystem="python">safety check</command>
  </auditCommands>
</securityValidation>
```

### 5.4 Deployment and Rollback Strategy

This section outlines the plan for deploying the new code and rolling it back if necessary. The XML defines the checklists, steps, triggers, and rollback procedures.

```xml
<deploymentStrategy>
  <preDeploymentChecklist>
    <item>All tests passing</item>
    <item>Code reviewed and approved</item>
    <item>Documentation updated</item>
    <item>Security scan passed</item>
    <item>Database migrations tested</item>
  </preDeploymentChecklist>
  <deploymentSteps>
    <stage name="Staging">
      <step>Deploy to staging environment</step>
      <step>Run smoke tests</step>
      <step>Validate with stakeholders</step>
    </stage>
    <stage name="Production">
      <step>Deploy during maintenance window</step>
      <step>Monitor error rates and performance</step>
      <step>Validate core functionality</step>
    </stage>
  </deploymentSteps>
  <rollbackPlan>
    <triggers>
      <trigger condition="Error rate > X%" />
      <trigger condition="Response time > Xms" />
      <trigger condition="Core functionality broken" />
    </triggers>
    <steps>
      <step>Revert application code</step>
      <step>Revert database migrations (if applicable)</step>
      <step>Clear caches</step>
      <step>Validate rollback success</step>
    </steps>
  </rollbackPlan>
</deploymentStrategy>
```

---

## 📊 COMPLETION CRITERIA

### Quality Gates

The task is not considered complete until all quality gates are passed. The XML defines these gates with specific, measurable thresholds.

```xml
<qualityGates>
  <gate name="Test Coverage" minimum="80%" description="Project-specific minimum line coverage" />
  <gate name="Type Coverage" minimum="100%" description="No 'any' types in new code" />
  <gate name="Documentation Coverage" minimum="100%" description="All public APIs documented" />
  <gate name="Performance" description="Meets or exceeds performance requirements" />
  <gate name="Security" description="Passes all security checks" />
  <gate name="Review" description="Approved by at least one peer reviewer" />
</qualityGates>
```

---

## 🔧 TEMPLATES & DECISION TREES

### Test Planning Decision Tree

This decision tree helps developers choose the right testing strategy based on the type of code change. The XML represents this logic in a nested structure for automated guidance.

```xml
<decisionTree name="Test Planning">
  <node question="What type of code change?">
    <choice answer="Pure Function/Logic">
      <recommendation type="Unit Tests" detail="happy path + edge cases + error handling" />
    </choice>
    <choice answer="API Endpoint">
      <recommendation type="Unit Tests" detail="business logic" />
      <recommendation type="Integration Tests" detail="database + external services" />
      <recommendation type="API Tests" detail="request/response validation" />
    </choice>
    <choice answer="UI Component">
      <recommendation type="Component Tests" detail="rendering + interactions" />
      <recommendation type="Visual Tests" detail="Storybook/screenshot testing" />
      <recommendation type="Accessibility Tests" detail="a11y validation" />
    </choice>
    <choice answer="Full Feature">
      <recommendation type="Unit Tests" detail="all individual functions" />
      <recommendation type="Integration Tests" detail="component interactions" />
      <recommendation type="E2E Tests" detail="user journey validation" />
    </choice>
  </node>
</decisionTree>
```

### Documentation Requirements Matrix

This matrix defines the required documentation for different types of code changes. The XML provides a machine-readable version of these rules.

```xml
<documentationMatrix>
  <rule codeType="Public Function">
    <requirement type="TSDoc/Docstring" status="Required" />
    <requirement type="README Update" status="No" />
    <requirement type="API Docs" status="No" />
    <requirement type="ADR" status="No" />
    <requirement type="Examples" status="Required" />
  </rule>
  <rule codeType="Public API">
    <requirement type="TSDoc/Docstring" status="Required" />
    <requirement type="README Update" status="Required" />
    <requirement type="API Docs" status="Required" />
    <requirement type="ADR" status="No" />
    <requirement type="Examples" status="Required" />
  </rule>
  <rule codeType="Architecture Change">
    <requirement type="TSDoc/Docstring" status="Required" />
    <requirement type="README Update" status="Required" />
    <requirement type="API Docs" status="No" />
    <requirement type="ADR" status="Required" />
    <requirement type="Examples" status="Required" />
  </rule>
  <rule codeType="Breaking Change">
    <requirement type="TSDoc/Docstring" status="Required" />
    <requirement type="README Update" status="Required" />
    <requirement type="API Docs" status="Required" />
    <requirement type="ADR" status="Required" />
    <requirement type="Examples" status="Required" />
  </rule>
</documentationMatrix>
```