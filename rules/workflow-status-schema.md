# Workflow Status XML Schema (v2)

This document defines the mandatory XML schema for parallel task status reporting. The `parallel-worker` agent will create a file based on this schema and instruct subagents to update it.

## File Naming Convention
`[YYYY-MM-DD-HH-MM]-[epic-name]-[issue-number]-workflow-status.xml`

## XML Schema v2 (ID-Referenced)

```xml
<workflow_status>
  <metadata>
    <epic_name>[Epic Name]</epic_name>
    <issue_number>[Issue Number]</issue_number>
    <plan_file>[Path to analysis.md or "self-generated"]</plan_file>
    <worktree_path>[Path to git worktree]</worktree_path>
    <start_time>[ISO 8601 Timestamp]</start_time>
    <last_updated>[ISO 8601 Timestamp]</last_updated>
    <status>[in_progress | completed | failed]</status>
  </metadata>
  
  <!-- Project context for spawned agents -->
  <project_context>
    <overall_goal>[High-level project objective]</overall_goal>
    <success_criteria>[What defines success for this project]</success_criteria>
    <technical_stack>[Technologies and frameworks being used]</technical_stack>
    <quality_requirements>[Testing, performance, security standards]</quality_requirements>
    <constraints>[Timeline, resource, or architectural constraints]</constraints>
  </project_context>
  
  <!-- Directed Acyclic Graph for task dependencies and parallel execution planning -->
  <execution_dag>
    <nodes>
      <node id="[short-job-id-1]" level="0"/>
      <node id="[short-job-id-2]" level="0"/>
      <node id="[short-job-id-3]" level="1"/>
      <node id="[short-job-id-4]" level="1"/>
      <node id="[short-job-id-5]" level="2"/>
    </nodes>
    <edges>
      <edge from="[short-job-id-1]" to="[short-job-id-3]"/>
      <edge from="[short-job-id-2]" to="[short-job-id-3]"/>
      <edge from="[short-job-id-1]" to="[short-job-id-4]"/>
      <edge from="[short-job-id-3]" to="[short-job-id-5]"/>
      <edge from="[short-job-id-4]" to="[short-job-id-5]"/>
    </edges>
    <parallel_sets>
      <level number="0">
        <parallel_group>
          <task_ref id="[short-job-id-1]"/>
          <task_ref id="[short-job-id-2]"/>
        </parallel_group>
      </level>
      <level number="1">
        <parallel_group>
          <task_ref id="[short-job-id-3]"/>
          <task_ref id="[short-job-id-4]"/>
        </parallel_group>
      </level>
      <level number="2">
        <parallel_group>
          <task_ref id="[short-job-id-5]"/>
        </parallel_group>
      </level>
    </parallel_sets>
  </execution_dag>

  <!-- Master list of all task definitions -->
  <tasks>
    <task id="[short-job-id-1]">
      <description>[Brief task description]</description>
      <agent_type>[e.g., typescript-node-developer]</agent_type>
      <estimated_duration>[Duration in minutes for scheduling]</estimated_duration>
      <status_history>
        <event type="created" timestamp="..."/>
      </status_history>
      <result/>
    </task>
    <task id="[short-job-id-2]">
      <!-- ... other task definitions ... -->
    </task>
  </tasks>
  
  <!-- Status sections now only contain references -->
  <status_tracker>
    <pending>
      <task_ref id="[short-job-id-1]"/>
      <task_ref id="[short-job-id-2]"/>
    </pending>
    
    <in_progress/>
    
    <completed/>
    
    <failed/>
  </status_tracker>
</workflow_status>
```

## Schema Changes from v1

- **Centralized Task Definitions**: A new top-level `<tasks>` section now holds the full definition for every task, each with a unique, human-readable `id`.
- **Reference-Based Status Tracking**: The `<status_tracker>` section now contains status lists (`<pending>`, `<in_progress>`, etc.) that hold empty `<task_ref id="..."/>` elements.
- **Enhanced Task Metadata**: The `<task>` definition includes `<status_history>`, `<result>`, and `<estimated_duration>` elements to be updated by subagents.
- **DAG-Based Execution Planning**: New `<execution_dag>` section provides sophisticated dependency management and parallel execution optimization.

## DAG Structure Explained

The `<execution_dag>` section enables optimal parallel task scheduling:

- **Nodes**: Each task with its execution level (topological sort level)
- **Edges**: Direct dependencies between tasks (from prerequisite to dependent)
- **Parallel Sets**: Pre-computed groups of tasks that can execute simultaneously at each level

### DAG Benefits:
- **Optimal Parallelization**: Execute maximum tasks simultaneously while respecting dependencies
- **Critical Path Analysis**: Identify longest dependency chain for time estimation
- **Efficient Scheduling**: Level-based execution ensures prerequisites are met
- **Resource Optimization**: Balance workload across available parallel slots

## Subagent Update Protocol

When a subagent completes its task, it MUST perform these two operations:

1. **Update Master Task**: Locate the `<task id="[assigned-id]">` in the `<tasks>` section and:
   - Add work summary to the `<result>` tag
   - Add completion event to `<status_history>`

2. **Update Status Tracker**: Move the `<task_ref id="[assigned-id]"/>` from `<in_progress>` to either `<completed>` or `<failed>`.

## Benefits of v2 Schema

- **Single Source of Truth**: All task information centralized in the `<tasks>` section
- **Efficient Status Queries**: Quick status checks via `<status_tracker>` references
- **Comprehensive Audit Trail**: Full history and results maintained per task
- **Dependency Resolution**: Clear prerequisite tracking for parallel execution
- **Scalable**: Supports large numbers of tasks without XML bloat