# SPECIALIST-AGENT-PROTOCOL.md - Living Blueprint Integration Protocol

**Version**: 1.0  
**Purpose**: Standardize how all specialist agents interact with the Living Blueprint genesis.xml system  
**Scope**: All engineering, design, testing, and execution agents

---

## 🎯 CORE INTEGRATION REQUIREMENTS

### Mandatory Genesis File Integration

All specialist agents MUST integrate with the Living Blueprint system through these standardized interactions:

```xml
<protocolRequirements>
  <phase name="Initialization" order="1">
    <requirement>MUST read genesis.xml file path from environment or parameter</requirement>
    <requirement>MUST parse project context, technical stack, and quality requirements</requirement>
    <requirement>MUST identify assigned task and dependencies from executionPlan</requirement>
  </phase>
  <phase name="Execution" order="2">
    <requirement>MUST work within git worktree specified in metadata</requirement>
    <requirement>MUST follow technical stack and quality attributes from architecture section</requirement>
    <requirement>MUST implement according to task description and success criteria</requirement>
  </phase>
  <phase name="Completion" order="3">
    <requirement>MUST update task status with implementation summary</requirement>
    <requirement>MUST add completion event to task status history</requirement>
    <requirement>MUST move taskRef from inProgress to completed section</requirement>
  </phase>
</protocolRequirements>
```

---

## 📋 GENESIS.XML STRUCTURE REFERENCE

### Key Sections for Agent Integration

Agents must understand and interact with these genesis.xml sections:

```xml
<genesisStructure>
  <!-- Project Context - Read during initialization -->
  <section path="/projectGenesis/metadata">
    <data>projectName, epicName, version, owner</data>
    <usage>Context for commit messages and documentation</usage>
  </section>
  
  <section path="/projectGenesis/vision">
    <data>problemStatement, objectives, successCriteria</data>
    <usage>Understanding project goals and validation requirements</usage>
  </section>
  
  <section path="/projectGenesis/architecture">
    <data>technicalStack, qualityAttributes, constraints</data>
    <usage>Implementation guidance and technology choices</usage>
  </section>
  
  <!-- Task Assignment - Core execution guidance -->
  <section path="/projectGenesis/executionPlan/tasks/task[@id='AGENT_TASK_ID']">
    <data>name, description, estimatedDuration, dependencies</data>
    <usage>Specific task instructions and requirements</usage>
  </section>
  
  <!-- Status Management - Update during execution -->
  <section path="/projectGenesis/executionPlan/statusTracker">
    <data>pending, inProgress, completed, failed taskRef elements</data>
    <usage>Track task progression through execution lifecycle</usage>
  </section>
</genesisStructure>
```

---

## 🔧 XMLSTARLET COMMAND REFERENCE

### Essential XML Operations for Agents

All specialist agents should use these xmlstarlet patterns for genesis.xml interaction:

```bash
# Read project context
PROJECT_NAME=$(xmlstarlet sel -t -v '/projectGenesis/metadata/projectName' "$GENESIS_FILE")
TECH_STACK=$(xmlstarlet sel -t -m '/projectGenesis/architecture/technicalStack/language' -v '.' -o ' ' "$GENESIS_FILE")

# Get assigned task details
TASK_DESC=$(xmlstarlet sel -t -v "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/description" "$GENESIS_FILE")
TASK_DEPS=$(xmlstarlet sel -t -v "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/dependencies" "$GENESIS_FILE")

# Update task with results (agent must provide TASK_SUMMARY)
xmlstarlet ed -L \
  -u "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/result" -v "$TASK_SUMMARY" \
  "$GENESIS_FILE"

# Add completion event to status history
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
xmlstarlet ed -L \
  -s "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/statusHistory" -t elem -n "event" \
  -s "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/statusHistory/event[last()]" -t elem -n "timestamp" -v "$TIMESTAMP" \
  -s "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/statusHistory/event[last()]" -t elem -n "status" -v "completed" \
  -s "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/statusHistory/event[last()]" -t elem -n "description" -v "Task completed successfully" \
  -s "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/statusHistory/event[last()]" -t elem -n "actor" -v "$AGENT_NAME" \
  "$GENESIS_FILE"

# Move task from inProgress to completed
xmlstarlet ed -L \
  -d "/projectGenesis/executionPlan/statusTracker/inProgress/taskRef[@id='$TASK_ID']" \
  -s "/projectGenesis/executionPlan/statusTracker/completed" -t elem -n "taskRef" -v "" \
  -i "/projectGenesis/executionPlan/statusTracker/completed/taskRef[last()]" -t attr -n "id" -v "$TASK_ID" \
  "$GENESIS_FILE"
```

---

## 🎨 AGENT-SPECIFIC IMPLEMENTATION PATTERNS

### Engineering Agents

```xml
<agentPattern type="Engineering" agents="typescript-node-developer,python-backend-developer,rust-backend-developer">
  <initialization>
    <step>Parse technicalStack from architecture section</step>
    <step>Validate framework compatibility with task requirements</step>
    <step>Set up development environment according to tech stack</step>
  </initialization>
  <execution>
    <step>Implement according to task description</step>
    <step>Follow qualityAttributes standards (testing, performance, security)</step>
    <step>Create comprehensive tests and documentation</step>
  </execution>
  <completion>
    <step>Update result with implementation summary and file changes</step>
    <step>Include test results and performance metrics</step>
    <step>Document any architectural decisions made</step>
  </completion>
</agentPattern>
```

### Design Agents

```xml
<agentPattern type="Design" agents="ui-designer,whimsy-injector,brand-guardian">
  <initialization>
    <step>Parse design requirements from vision and architecture</step>
    <step>Identify target user personas and experience goals</step>
    <step>Review existing design system and brand guidelines</step>
  </initialization>
  <execution>
    <step>Create designs following brand and accessibility standards</step>
    <step>Generate design tokens, components, and assets</step>
    <step>Validate designs against success criteria</step>
  </execution>
  <completion>
    <step>Update result with design deliverables and rationale</step>
    <step>Include accessibility validation and user testing results</step>
    <step>Document design decisions and iterations</step>
  </completion>
</agentPattern>
```

### Testing Agents

```xml
<agentPattern type="Testing" agents="test-writer-fixer,api-tester,performance-benchmarker">
  <initialization>
    <step>Parse testing requirements from architecture qualityAttributes</step>
    <step>Identify coverage targets and performance benchmarks</step>
    <step>Review existing test infrastructure and patterns</step>
  </initialization>
  <execution>
    <step>Create comprehensive test suites according to requirements</step>
    <step>Execute tests and validate against success criteria</step>
    <step>Generate coverage reports and performance metrics</step>
  </execution>
  <completion>
    <step>Update result with test results, coverage, and performance data</step>
    <step>Include recommendations for test improvement</step>
    <step>Document test strategy and validation approach</step>
  </completion>
</agentPattern>
```

---

## 🚦 QUALITY GATES & VALIDATION

### Mandatory Completion Checklist

Before marking any task as completed, agents MUST verify:

```xml
<qualityGates>
  <gate name="Implementation Complete" mandatory="true">
    <check>All deliverables specified in task description are complete</check>
    <check>Implementation follows technical stack and quality standards</check>
    <check>All dependencies have been properly integrated</check>
  </gate>
  
  <gate name="Testing Complete" mandatory="true">
    <check>Comprehensive tests written and passing</check>
    <check>Code coverage meets project standards (≥90%)</check>
    <check>Performance benchmarks meet quality attributes</check>
  </gate>
  
  <gate name="Documentation Complete" mandatory="true">
    <check>Implementation is fully documented</check>
    <check>API documentation updated if applicable</check>
    <check>Architecture decisions recorded</check>
  </gate>
  
  <gate name="Integration Validated" mandatory="true">
    <check>Changes integrate properly with existing codebase</check>
    <check>All tests pass including integration tests</check>
    <check>No breaking changes introduced</check>
  </gate>
</qualityGates>
```

---

## 🔄 ERROR HANDLING & ESCALATION

### Failure Response Protocol

When tasks cannot be completed, agents MUST:

```xml
<failureProtocol>
  <step name="Document Issue" order="1">
    <action>Update task result with detailed failure description</action>
    <action>Include specific technical barriers or dependency issues</action>
    <action>Provide recommendations for resolution</action>
  </step>
  
  <step name="Update Status" order="2">
    <action>Add failure event to statusHistory with timestamp</action>
    <action>Move taskRef from inProgress to failed section</action>
    <action>Include failure reason and suggested next steps</action>
  </step>
  
  <step name="Escalation" order="3">
    <condition>If technical blocker</condition>
    <action>Recommend task reassignment or architecture change</action>
    <condition>If dependency failure</condition>
    <action>Identify alternative task ordering or parallel execution</action>
  </step>
</failureProtocol>
```

---

## 📈 PROGRESS REPORTING

### Status Update Format

All status updates must follow this structured format:

```xml
<statusFormat>
  <result>
    <summary>Brief description of work completed</summary>
    <deliverables>
      <file path="relative/path/to/file">Description of changes</file>
      <file path="relative/path/to/file">Description of changes</file>
    </deliverables>
    <metrics>
      <metric name="testCoverage" value="95%" />
      <metric name="performance" value="<200ms response time" />
      <metric name="linting" value="0 errors, 0 warnings" />
    </metrics>
    <nextSteps>
      <step>Integration with dependent tasks</step>
      <step>Performance optimization if needed</step>
    </nextSteps>
  </result>
</statusFormat>
```

---

## 🔧 TEMPLATE INTEGRATION

### Agent Prompt Templates

All specialist agents MUST include this initialization block in their prompts:

```markdown
## 🎯 LIVING BLUEPRINT INTEGRATION

**MANDATORY**: This task is part of a Living Blueprint project execution.

1. **Read Genesis File**: Parse the genesis.xml file at: `{GENESIS_FILE_PATH}`
2. **Extract Context**: Get project name, technical stack, and quality requirements
3. **Identify Task**: Find your assigned task by ID: `{TASK_ID}`
4. **Understand Dependencies**: Check which tasks must complete before yours
5. **Follow Standards**: Implement according to architecture and quality attributes
6. **Update Status**: Use xmlstarlet to update task progress and completion

**Genesis File Path**: {GENESIS_FILE_PATH}  
**Task ID**: {TASK_ID}  
**Worktree**: {WORKTREE_PATH}
```

---

## 📚 INTEGRATION EXAMPLES

### Example 1: TypeScript Backend Developer

```bash
#!/bin/bash
# Agent receives these parameters
GENESIS_FILE="/path/to/genesis.xml"
TASK_ID="create-auth-api"
WORKTREE="/path/to/worktree"

# 1. Read project context
PROJECT_NAME=$(xmlstarlet sel -t -v '/projectGenesis/metadata/projectName' "$GENESIS_FILE")
TECH_STACK=$(xmlstarlet sel -t -m '/projectGenesis/architecture/technicalStack/language' -v '.' -o ' ' "$GENESIS_FILE")

# 2. Get task details
TASK_DESC=$(xmlstarlet sel -t -v "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/description" "$GENESIS_FILE")

# 3. Execute implementation (TypeScript API creation)
# ... implementation work ...

# 4. Update task with results
TASK_SUMMARY="Implemented JWT authentication API with user registration/login endpoints. Created 15 test cases with 100% coverage. Added comprehensive API documentation."

xmlstarlet ed -L \
  -u "/projectGenesis/executionPlan/tasks/task[@id='$TASK_ID']/result" -v "$TASK_SUMMARY" \
  "$GENESIS_FILE"

# 5. Mark as completed
# ... xmlstarlet commands to move from inProgress to completed ...
```

### Example 2: UI Designer

```bash
#!/bin/bash
# Agent receives parameters
GENESIS_FILE="/path/to/genesis.xml"
TASK_ID="design-user-interface"

# 1. Parse design requirements
USER_PERSONAS=$(xmlstarlet sel -t -v '/projectGenesis/vision/objectives/objective[contains(., "user")]' "$GENESIS_FILE")
BRAND_GUIDELINES=$(xmlstarlet sel -t -v '/projectGenesis/architecture/designSystem' "$GENESIS_FILE")

# 2. Create designs
# ... design work ...

# 3. Update with deliverables
DESIGN_SUMMARY="Created comprehensive UI design system with 25 components. Validated accessibility (WCAG 2.1 AA). Generated design tokens and Figma assets."

# ... update genesis.xml ...
```

---

## 🎯 SUCCESS CRITERIA

This protocol is successful when:

✅ **Universal Adoption**: All specialist agents use genesis.xml as single source of truth  
✅ **Consistent Updates**: Task status accurately reflects real progress  
✅ **Quality Maintenance**: All quality gates pass before task completion  
✅ **Dependency Management**: Agent coordination happens through DAG structure  
✅ **Audit Trail**: Complete execution history captured in statusHistory  

---

**Protocol Version**: 1.0  
**Last Updated**: 2024-08-23  
**Next Review**: After Phase 3 implementation and testing