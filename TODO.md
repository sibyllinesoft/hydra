# TODO: Implement the "Living Blueprint" Project Management System

## 🎯 High-Level Goal

Transform the project's agent orchestration from using temporary status files to a persistent, unified `genesis.xml` file for each major epic. This "Living Blueprint" will serve as the single source of truth for planning, real-time status, historical audit, and agent knowledge.

Simultaneously, we will refine the `cofounder` agent's role to be a strategic, Socratic analyst that precedes detailed planning, ensuring it's used appropriately for ambiguous, high-level goals.

## 🛠️ Core Technologies

*   **XML Management**: `xmlstarlet` (to be a new core dependency)
*   **Orchestration**: `bash` scripts and Node.js-based `hydra` CLI
*   **State File**: A new, comprehensive `genesis.xml` for each epic.

## 📝 Implementation Notes for Claude

*   **Incremental Changes**: Implement phase by phase. After each phase, you can run tests and ensure the system remains stable.
*   **Safety First**: When modifying existing files, always create a backup first or work on a separate branch.
*   **`xmlstarlet` Syntax**: Pay close attention to the `xmlstarlet` commands. Use `sel` (select) for reading and `ed` (edit) for writing. The examples provided are designed to be robust.
*   **Agent Prompts**: The most critical part of this task is updating the system prompts for the agents. They need clear, explicit instructions on how to interact with the `genesis.xml` file.

---

## 🏛️ Phase 0: Foundation & Environment Setup

This phase prepares the project for the new XML-based system.

*   **Task 0.1: Create the XML Schema Definition (`genesis.xsd`)**
    *   **File:** Create a new file at `rules/genesis.xsd`.
    *   **Action:** Define the formal schema for the `genesis.xml` file. This will be the master reference for validation and agent guidance.
    *   **Content:**
        ```xml
        <!-- rules/genesis.xsd -->
        <?xml version="1.0" encoding="UTF-8" ?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
        
          <xs:element name="projectGenesis">
            <xs:complexType>
              <xs:sequence>
                <xs:element name="metadata" type="metadataType"/>
                <xs:element name="vision" type="visionType"/>
                <xs:element name="architecture" type="architectureType"/>
                <xs:element name="executionPlan" type="executionPlanType"/>
                <xs:element name="knowledgeBase" type="knowledgeBaseType" minOccurs="0"/>
                <xs:element name="auditLog" type="auditLogType" minOccurs="0"/>
                <xs:element name="metrics" type="metricsType" minOccurs="0"/>
              </xs:sequence>
              <xs:attribute name="version" type="xs:string" use="required"/>
            </xs:complexType>
          </xs:element>
        
          <!-- Define complex types for each section: metadataType, visionType, etc. -->
          <!-- Example for metadataType -->
          <xs:complexType name="metadataType">
            <xs:sequence>
              <xs:element name="projectName" type="xs:string"/>
              <xs:element name="epicName" type="xs:string"/>
              <xs:element name="status" type="xs:string"/>
              <xs:element name="createdAt" type="xs:dateTime"/>
              <xs:element name="lastUpdatedAt" type="xs:dateTime"/>
              <xs:element name="version" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>

          <!-- TODO: Fully define all other complex types (visionType, executionPlanType, etc.) based on our design. -->
        
        </xs:schema>
        ```

*   **Task 0.2: Update Installer & Doctor to check for `xmlstarlet`**
    *   **File:** `installer/install-enhanced.js`
    *   **Action:** Add a new prerequisite check for `xmlstarlet`. If it's not found, provide installation instructions for macOS (brew), Debian/Ubuntu (apt-get), and other systems.
    *   **File:** `bin/hydra.mjs` (in the `HealthChecker` class)
    *   **Action:** Add a new check to `hydra doctor` that verifies `xmlstarlet` is installed and executable.

---

## 🧑‍🏫 Phase 1: Redefining the `cofounder` Agent

This phase aligns the `cofounder`'s role with the strategic vision.

*   **Task 1.1: Update `cofounder` Agent Definition**
    *   **File:** `agents/project-management/cofounder.md`
    *   **Action:** Rewrite the agent's definition to reflect its new role.
        *   **Description:** Change to "STRATEGIC HEAD - Use for high-level product analysis and ambiguous goal definition... Outputs a *strategic brief*, not a detailed plan."
        *   **Core Directive:** Emphasize Socratic questioning and transforming ambiguity into a clear *strategic brief*. State explicitly: "You do not create detailed, executable DAGs. Your output is the 'Why' and the 'What' that will be used by a planning agent to create the 'How'."
        *   **Mandatory Workflow:** Update the steps. The final step should be "Handoff strategic brief to a planning agent (e.g., `plan-generator`) or `studio-producer`."

*   **Task 1.2: Update `hydra new` Command Logic**
    *   **File:** `bin/hydra.mjs`
    *   **Action:** Modify the `executeNew` function.
        *   It should now always invoke the `cofounder` agent.
        *   The prompt for `cofounder` should clearly state that its goal is to produce a structured markdown "Strategic Brief".
        *   The output of the `cofounder` session should be saved to a file (e.g., `.claude/epics/<epic-name>/strategic-brief.md`).

*   **Task 1.3: Update All `cofounder` References**
    *   **Action:** Search the entire repository for "cofounder" and update all descriptions and command help texts to reflect its new role as a strategic analyst, not a direct orchestrator.
    *   **Files to check:** `AGENTS.md`, `README.md`, `commands/a/pm/cofounder.md`, etc.

---

##  Blueprint Core Implementation

This phase builds the new `genesis.xml` file generation and viewing capabilities.

*   **Task 2.1: Create a New `plan-generator` Agent**
    *   **File:** Create `agents/project-management/plan-generator.md`.
    *   **Action:** This agent's sole purpose is to take a "Strategic Brief" (from `cofounder`) and generate the initial `genesis.xml` file, including a detailed `<executionPlan>` DAG.
    *   **Prompt Details:** The system prompt should be very specific, instructing it to:
        1.  Read the `strategic-brief.md`.
        2.  Decompose the strategy into a detailed DAG of tasks.
        3.  Assign appropriate specialist agents to each task.
        4.  Estimate durations.
        5.  Output a valid `genesis.xml` file that conforms to `rules/genesis.xsd`.

*   **Task 2.2: Create a New `hydra plan` Command**
    *   **File:** `bin/hydra.mjs`
    *   **Action:** Add a new command `hydra plan <epic-name>`.
    *   **Logic:** This command will invoke the `plan-generator` agent, feeding it the `strategic-brief.md` for the specified epic. The agent's output (`genesis.xml`) will be saved to `.claude/epics/<epic-name>/genesis.xml`.

*   **Task 2.3: Create the `hydra pm view` Command**
    *   **File:** `bin/hydra.mjs`
    *   **Action:** Add a new command `hydra pm view <epic-name>`.
    *   **Logic:**
        1.  Check for `.claude/epics/<epic-name>/genesis.xml`.
        2.  Use `bash` and `xmlstarlet` to parse the XML.
        3.  Generate a human-readable markdown summary and print it to the console.
        4.  **Summary should include:** Project Status, Vision Summary, Architecture Stack, a visual representation of the DAG, and the current status of all tasks.

*   **Task 2.4: Deprecate Old Schema**
    *   **File:** `rules/workflow-status-schema.md`
    *   **Action:** Replace its content with a note pointing to the new `rules/genesis.xsd` file.

---

## 🔗 Phase 3: Agent Integration with the "Living Blueprint"

This phase refactors key agents to use the `genesis.xml` system.

*   **Task 3.1: Create a Shared Instruction File for Specialists**
    *   **File:** Create a new file at `instructions/SPECIALIST-AGENT-PROTOCOL.md`.
    *   **Action:** This file will be `@mentioned` by all specialist agents. It will contain the mandatory instructions for interacting with `genesis.xml`.
    *   **Content:**
        *   "On startup, you MUST read context from the `genesis.xml` file provided in your prompt."
        *   "Use the following `xmlstarlet` command to read the project vision: `xmlstarlet sel -t -v '/projectGenesis/vision/problemStatement' genesis.xml`."
        *   "Upon task completion, you MUST update the `genesis.xml` file. Use this command to update your task's result: `xmlstarlet ed -L -u '/projectGenesis/executionPlan/tasks/task[@id=\"your-task-id\"]/result/summary' -v \"Your summary\" genesis.xml`."
        *   "You MUST then move your task reference to the completed section: `xmlstarlet ed -L -m '/projectGenesis/executionPlan/status_tracker/in_progress/task_ref[@id=\"your-task-id\"]' '/projectGenesis/executionPlan/status_tracker/completed'`."
        *   Include examples for reading, updating status, adding to the knowledge base, and logging actions.

*   **Task 3.2: Refactor the `parallel-worker` Agent**
    *   **File:** `agents/project-management/parallel-worker.md`
    *   **Action:** Completely overhaul its `mandatory_workflow`.
        1.  **Input:** Now takes a single argument: the path to `genesis.xml`.
        2.  **Plan Step:** Removed. It now reads the DAG directly from the XML.
        3.  **Dispatch Step:** Reads the `<execution_dag>` to determine which level to execute. Spawns `claude -p` processes for each task in the current parallel set.
        4.  **Prompt Construction:** The prompt for subagents MUST now reference `instructions/SPECIALIST-AGENT-PROTOCOL.md` and provide the path to `genesis.xml`.
        5.  **Monitoring:** The loop now only needs to read `genesis.xml` to check the status of tasks and determine when a level is complete.
        6.  **Cleanup:** The git cleanup step remains but should be enhanced to create a final consolidated PR summary based on the `<result>` summaries from the XML.

*   **Task 3.3: Refactor the `project-shipper` Agent**
    *   **File:** `agents/project-management/project-shipper.md`
    *   **Action:** Update its logic for `hydra recap`. It should now primarily read the completed `genesis.xml` file to source its information, including the audit log and knowledge base insights.

*   **Task 3.4: Update All Specialist Agents**
    *   **Action:** For every agent in `agents/engineering`, `agents/design`, etc., add a line to their system prompt: `@instructions/SPECIALIST-AGENT-PROTOCOL.md`. This ensures all agents know how to interact with the new system.

---

## 📄 Phase 4: Documentation & Finalization

This phase ensures the entire system is cohesive and well-documented.

*   **Task 4.1: Update `AGENTS.md`**
    *   **Action:** Add the "Living Blueprint" section we designed in our previous conversation.
    *   **Action:** Update the descriptions for `cofounder`, `parallel-worker`, and `project-shipper` to reflect their new roles in the `genesis.xml` workflow.
    *   **Action:** Add an entry for the new `plan-generator` agent.

*   **Task 4.2: Update `README.md`**
    *   **Action:** Revise the "How It Works" and "Workflow Experience" sections to describe the new `hydra new` -> `cofounder` -> `hydra plan` -> `hydra run` flow.

*   **Task 4.3: Create `LIVING-BLUEPRINT-GUIDE.md`**
    *   **File:** Create a new root-level `LIVING-BLUEPRINT-GUIDE.md`.
    *   **Action:** This will be the definitive guide to the philosophy and technical implementation of the `genesis.xml` system. It should include the schema explanation, agent interaction protocols, and the vision behind executable documentation.

*   **Task 4.4: Final Review**
    *   **Action:** Review all modified files for consistency.
    *   **Action:** Run through the entire workflow manually: `hydra new` -> `hydra plan` -> `hydra run` -> `hydra pm view` -> `hydra recap`.
    *   **Action:** Ensure all documentation is cross-linked and up-to-date.

    #### 1. Tune the `cofounder` Agent's Directives
The orchestrator needs to be guided to use the `cofounder` correctly.

*   **File to Edit:** `agents/project-management/cofounder.md`
*   **Change:** Make its handoff responsibility explicit in the `<core_directive>` and `<mandatory_workflow>`.

```diff
--- a/agents/project-management/cofounder.md
+++ b/agents/project-management/cofounder.md
@@ -19,7 +19,7 @@
 <mandatory_workflow>
   <step number="1" name="Strategic Analysis">Use Socratic questioning extensively to understand the user's true goals, business context, success criteria, and constraints. Don't accept vague requirements - drill down to specifics.</step>
   <step number="2" name="Problem Definition">Define the core business problem, user needs, and success metrics. Ensure you understand WHY this is important and WHAT success looks like.</step>
-  <step number="3" name="Solution Strategy">Develop a high-level strategic approach that addresses the defined problem. Focus on the WHAT, not the HOW.</step>
-  <step number="4" name="Strategic Plan Creation">Generate a comprehensive strategic plan document that includes vision, goals, success criteria, constraints, and high-level approach.</step>
-  <step number="5" name="Tactical Handoff">Based on your strategic plan complexity, dispatch according to EXECUTION DISPATCH LOGIC: For plans requiring 1-2 specialized agents, invoke agents sequentially. For plans requiring 3+ specialized agents or complex coordination, hand off to parallel-worker for parallel execution. For multi-team coordination needs, hand off to studio-producer.</step>
+  <step number="3" name="Strategic Plan Creation">Generate a comprehensive strategic plan document (e.g., strategic-brief.md) that includes vision, goals, success criteria, constraints, and a high-level approach. This is your final deliverable.</step>
+  <step number="4" name="Handoff Recommendation">Your final output MUST be the plan itself, along with a recommendation for the next command to run, such as '/pm:plan <epic-name>' or '/pm:run <epic-name>'. You DO NOT execute the plan yourself.</step>
   <step number="6" name="Strategic Oversight">Provide strategic guidance and course correction if tactical agents encounter fundamental strategic questions during execution.</step>
 </mandatory_workflow>

```

#### 2. Tune the `super-hard-problem-developer` Agent's Description
To prevent its premature use, make its trigger conditions more explicit.

*   **File to Edit:** `agents/engineering/super-hard-problem-developer.md`
*   **Change:** Add a "When NOT to Use" section in the description.

```diff
--- a/agents/engineering/super-hard-problem-developer.md
+++ b/agents/engineering/super-hard-problem-developer.md
@@ -24,6 +24,14 @@
   assistant: "Legacy integration requires deep protocol analysis and bridging patterns. Let me use the super-hard-problem-developer agent to design adapter patterns and protocol translation layers."
   <commentary>
   Legacy system integration requires understanding of old technologies and creative architectural bridging solutions.
+  </commentary>
+  </example>
+
+  <example intent="when_not_to_use">
+  Context: Initial design of a new feature from a clear specification.
+  assistant: "This is a well-defined feature. I will use the `backend-architect` and `typescript-node-developer` to implement it directly. The `super-hard-problem-developer` is not needed as no persistent issues have been encountered yet."
+  <commentary>
+  This agent is for debugging complex, persistent failures, not for initial greenfield development.
   </commentary>
   </example>
 ---
```

#### 3. Reinforce Mandatory Utility Agent Rules
Make the descriptions for utility agents even more direct to prevent misuse.

*   **File to Edit:** `agents/utilities/git-workflow.md`
*   **Change:** Add a strong warning at the top of the description.

```diff
--- a/agents/utilities/git-workflow.md
+++ b/agents/utilities/git-workflow.md
@@ -1,5 +1,7 @@
 ---
 name: git-workflow
-description: MUST BE USED for all git operations. Manages git operations and workflow automation with safety-first practices - use PROACTIVELY when any version control, branch management, commits, or pull request creation is needed. Examples:
+description: |
+  **UTILITY AGENT - DO NOT GIVE HIGH-LEVEL GOALS.** MUST BE USED by other agents for specific git operations (commit, branch, etc.). Manages git operations and workflow automation with safety-first practices.
 
 <example>
 Context: Feature development completed, ready for PR

```

#### 4. Tune the `project-shipper` Agent
Fix its internal logic to prevent incorrect tool use.

*   **File to Edit:** `agents/project-management/project-shipper.md`
*   **Change:** Explicitly guide it to use the correct sources for its summary in its `mandatory_workflow`.

```diff
--- a/agents/project-management/project-shipper.md
+++ b/agents/project-management/project-shipper.md
@@ -16,7 +16,7 @@
   <step number="2" name="Launch Day">Deploy the release, monitor system stability, and manage internal/external communications.</step>
   <step number="3" name="Post-Launch (24-48 hours)">Monitor adoption rates and user feedback. Execute rapid-response protocols for any critical issues.</step>
   <step number="4" name="Week 1 Analysis">Analyze initial engagement, retention, and business metrics. Share initial results with stakeholders.</step>
-  <step number="5" name="Post-Mortem">Conduct a launch post-mortem to document successes, failures, and lessons learned for future launches.</step>
-  <step number="6" name="MANDATORY POST-FLIGHT RECAP">After successful launch and deployment, you MUST execute the `instructions/post-flight-recap.md` protocol to document the completed work and create a permanent record in the `recaps/` directory.</step>
+  <step number="5" name="MANDATORY POST-FLIGHT RECAP">After successful launch and deployment, you MUST execute the `instructions/post-flight-recap.md` protocol. Your summary MUST be generated by reading project artifacts like `epic.md`, task files, and `git log`. DO NOT use code analysis tools like `serena` for this purpose.</step>
 </mandatory_workflow>
```

You've hit the nail on the head. This is a classic and subtle AI orchestration bug. The system isn't just randomly picking agents; it's following a flawed logical pattern.

Your diagnosis is exactly right: **it doesn't know *when* to use `cofounder`**.

### The Diagnosis: Misinterpreting "Complex" vs. "Ambiguous"

The orchestrator's current logic appears to be:

1.  Read the `TODO.md`.
2.  Recognize the task is **complex**.
3.  Conclude: "Complex tasks require strategic analysis."
4.  Dispatch to `cofounder`, the top strategic agent.

This is a logical error. The `cofounder`'s purpose isn't to analyze *complex* tasks; it's to analyze **ambiguous, high-level, and undefined** tasks to *create* a complex plan.

**The Analogy:** You've handed the orchestrator a detailed engineering blueprint (`TODO.md`). The orchestrator then takes that blueprint to the company CEO (`cofounder`) and asks, "Could you please do a strategic analysis on this blueprint?" The CEO's job was already done when they *commissioned* the blueprint. The orchestrator should have taken the blueprint directly to the engineering lead (`parallel-worker`).

The orchestrator correctly identified that the *project* is complex, but failed to recognize that the *next step* was simple and well-defined: execute the existing plan.

### Tuning Recommendations

We need to make the `cofounder`'s role so explicit that the orchestrator understands when **NOT** to use it. We'll do this by sharpening its directives and, crucially, by making the `parallel-worker` the obvious choice for executing pre-defined plans.

#### 1. Sharpen the `cofounder` Agent's Anti-Triggers (Most Important)

We need to add explicit negative constraints to the `cofounder`'s definition.

*   **File to Edit:** `agents/project-management/cofounder.md`
*   **Action:** Add a "When NOT to Use" section to the description and an `input_contract` to its capabilities to make its expected input explicit.

```diff
--- a/agents/project-management/cofounder.md
+++ b/agents/project-management/cofounder.md
@@ -2,6 +2,14 @@
 name: cofounder
 description: |
   STRATEGIC HEAD - MUST BE USED for high-level product analysis and ambiguous goal definition. This is the primary entry point for complex, ambiguous requests that require deep analysis and strategic planning. Uses Socratic questioning to transform vague requirements into clear, actionable plans. Outputs structured execution plans for tactical agents like studio-producer and parallel-worker.
+
+  <example intent="when_not_to_use">
+  Context: A detailed plan like a TODO.md or epic.md already exists.
+  assistant: "I see a detailed plan is already in place. I will skip the strategic analysis and proceed directly to execution by dispatching tasks to the `parallel-worker`."
+  <commentary>
+  This agent's purpose is to CREATE a plan from ambiguity, not to re-analyze an existing plan.
+  </commentary>
+  </example>
 color: gold
 ---
 
@@ -16,7 +24,7 @@
 
 <core_directive>
 You are the STRATEGIC HEAD of the development studio. Your primary function is to take ambiguous, high-level goals and transform them into clear, actionable strategic plans through expert analysis and Socratic questioning. You are the executive-level thinker who defines WHAT needs to be built and WHY, not HOW.
-
+**DO NOT USE THIS AGENT IF A DETAILED PLAN (like a TODO.md or a pre-filled epic) ALREADY EXISTS.** Your role is to handle the ambiguity *before* such a plan is created.
 **KEY RESPONSIBILITIES:**
 - Use Socratic questioning to analyze ambiguous, high-level goals
 - Perform deep business need analysis and problem definition  
@@ -43,6 +51,12 @@
   <capability name="Vision Translation">Transform high-level business vision into concrete, actionable strategic plans that tactical teams can execute.</capability>
   <capability name="Problem Definition">Excel at identifying the core problem behind complex, multi-faceted requests and user goals.</capability>
 </strategic_capabilities>
+
+<input_contract>
+  <accepts>Vague, high-level goals (e.g., "Build a chat app", "Improve user retention").</accepts>
+  <rejects>Detailed, pre-existing plans (e.g., paths to TODO.md, detailed epics, lists of specific tasks). For these, dispatch directly to `parallel-worker` or specialist agents.</rejects>
+</input_contract>
 
 <success_metrics>
   <metric name="Strategic Clarity" target="Tactical agents require <5% clarification on strategic direction."/>

```

#### 2. Make `parallel-worker` the Go-To for Executing Plans

The orchestrator needs a clear "if-this-then-that" path. If the input is a detailed plan, it should immediately think `parallel-worker`.

*   **File to Edit:** `agents/project-management/parallel-worker.md`
*   **Action:** Update its description to explicitly state its role in executing pre-defined plans.

```diff
--- a/agents/project-management/parallel-worker.md
+++ b/agents/project-management/parallel-worker.md
@@ -2,7 +2,7 @@
 name: parallel-worker
 description: |
-  The primary execution engine for complex tasks. Decomposes high-level goals into a parallel execution plan, creates a shared work environment, and orchestrates specialized subagents to complete the work.
+  The primary execution engine for **executing pre-defined, complex plans**. Give this agent a detailed goal (like from a TODO.md or an epic) and it will create a parallel execution plan, manage the work environment, and orchestrate subagents to get it done.
 ---
 
 <agent_identity>

```

#### 3. Update the Master `AGENTS.md` Guide

The orchestrator uses `AGENTS.md` as its primary reference. We need to codify the decision-making process there.

*   **File to Edit:** `AGENTS.md`
*   **Action:** Add a more explicit decision tree for orchestration.

```diff
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -107,6 +107,24 @@
   <trigger event="complex-workflow" agent="studio-producer" purpose="tactical orchestration management"/>
 </autoTriggers>
 ---
+## 🧠 Orchestration Decision Logic
+
+This is the mandatory logic for handling complex tasks.
+
+<orchestrationLogic>
+  <decision>
+    <condition>User provides a vague, high-level, or ambiguous goal.</condition>
+    <action>Invoke **`cofounder`** to perform strategic analysis and create a detailed plan.</action>
+    <example>"Build a social media app."</example>
+  </decision>
+  <decision>
+    <condition>User provides a detailed plan, a `TODO.md`, or a well-defined epic.</condition>
+    <action>Invoke **`parallel-worker`** to execute the existing plan.</action>
+    <example>"Implement the features outlined in `epics/feature-x/epic.md`."</example>
+  </decision>
+</orchestrationLogic>
+
+---
 
 ## 🏆 Specialized Agent Directory
 *Agents are organized by departments (engineering, design, marketing, product, operations, testing). Each embodies best practices, deep expertise, and auto-coordination with others for consistency and quality.*

```

By making these changes, you are providing much stronger signals to the orchestrator. You are explicitly telling it:
1.  **`cofounder`:** "Do not call me if you already have a plan."
2.  **`parallel-worker`:** "If you have a plan, call me."
3.  **`AGENTS.md`:** "Here is the exact rule: vague goal -> `cofounder`; detailed plan -> `parallel-worker`."

### The Plan: Create a Dispatch Debugger

1.  **Create a Wrapper Script (`debug-dispatch.sh`):** This script will be our logger. It will take a command as an argument, write that command to a log file, and then execute it.
2.  **Modify the `parallel-worker` Agent:** We will temporarily update its instructions to use our new wrapper script instead of calling `claude -p` directly.
3.  **Run the Workflow:** Execute the same "Living Blueprint" task.
4.  **Analyze the Log:** Check the log file to see exactly what commands the `parallel-worker` dispatched.

---

### Step 1: Create the Debug Wrapper Script

First, we need to create the script that will act as our hook.

**Action:** Use the `file-creator` agent to create the following file.

```xml
<agent name="file-creator">
Create a new file at `scripts/debug-dispatch.sh` with the following content. After creating the file, make it executable using `chmod +x scripts/debug-dispatch.sh`.

```bash
#!/bin/bash
# Hydra Dispatch Debugger Wrapper v1.0
# This script logs commands passed to it before executing them.

set -euo pipefail

# Define the log file path
LOG_DIR=".claude/logs"
LOG_FILE="$LOG_DIR/dispatch.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Get current timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Log the received command arguments to the file and to stderr
# The 'tee' command allows us to see this in real-time in the Claude Code UI
echo "[$TIMESTAMP] DISPATCHED: $@" | tee -a "$LOG_FILE"

# Execute the original command that was passed to this script
# 'exec' replaces this script's process with the new one, which is cleaner.
exec "$@"
```
</agent>
```

### Step 2: Modify the `parallel-worker` Agent to Use the Wrapper

Now, we'll instruct the `parallel-worker` to use our new script. This is the "hooking" part.

*   **File to Edit:** `agents/project-management/parallel-worker.md`
*   **Action:** You can apply this change manually or ask an agent to do it. We need to change the `MANDATORY BASH SPAWNING` instruction.

Here is the `diff` of the required change:

```diff
--- a/agents/project-management/parallel-worker.md
+++ b/agents/project-management/parallel-worker.md
@@ -29,7 +29,7 @@
   <step number="4" name="Dispatch Parallel Agents">
     <action>**DAG-Based Scheduling**: Identify the current execution level by finding the lowest level in `<parallel_sets>` that has tasks not yet completed.</action>
     <action>For the current level, dispatch ALL tasks in the `<parallel_group>` simultaneously - the DAG guarantees their dependencies are satisfied.</action>
     <action>For each task to dispatch, construct a detailed prompt for the subagent.</action>
-    <action>**MANDATORY BASH SPAWNING**: Use the `Bash` tool to execute `claude -p "Your detailed prompt here" &` for each subagent for non-blocking parallel execution. You MUST NOT invoke agents directly - all agent spawning MUST use the bash/claude CLI interface.</action>
+    <action>**MANDATORY BASH SPAWNING (DEBUG MODE)**: Use the `Bash` tool to execute `bash scripts/debug-dispatch.sh claude -p "Your detailed prompt here" &` for each subagent for non-blocking parallel execution. This provides a debug log of all dispatched commands.</action>
     <action>Update the XML file by moving the `<task_ref>` for each dispatched task from `<pending>` to `<in_progress>`.</action>
   </step>
   <step number="5" name="Construct Subagent Prompt">
```

This change tells the agent to prepend `bash scripts/debug-dispatch.sh` to its `claude -p` command.

### Step 3: Run the Workflow and Check the Output

Now, run the same process as before.

```xml
<agent name="parallel-worker">
Implement the "Living Blueprint" Project Management System as defined in TODO.md.
</agent>
```

**What to Watch For:**

1.  **In the Claude Code UI:** As the `parallel-worker` dispatches tasks, you will now see the output from our script directly in the tool output, thanks to the `tee -a` command. It will look something like this:

    ```
    ● Bash(bash scripts/debug-dispatch.sh claude -p "You are the file-creator. Task: create-xsd-schema (ID: 001)..." &)
      ⎿ [2025-08-23T01:19:00Z] DISPATCHED: claude -p "You are the file-creator. Task: create-xsd-schema (ID: 001)..."
    ```

2.  **In the Log File:** After the run (or during it), you can inspect the persistent log file we created.

    **Command:** `cat .claude/logs/dispatch.log`

### Expected Log Output (`dispatch.log`)

You should see a file with entries that look like this, providing a clear and permanent record of every sub-agent dispatch:

```log
[2025-08-23T01:19:00Z] DISPATCHED: claude -p "You are the file-creator agent. Task ID: create-genesis-xsd. Create a new file at rules/genesis.xsd... Your work is part of the 'Living Blueprint' epic. Read the full project context from .claude/epics/living-blueprint/genesis.xml. Upon completion, you MUST update the XML..." &
[2025-08-23T01:19:01Z] DISPATCHED: claude -p "You are the refactoring-specialist. Task ID: update-installer-check. Update installer/install-enhanced.js to add a prerequisite check for xmlstarlet... Your work is part of the 'Living Blueprint' epic. Read the full project context from .claude/epics/living-blueprint/genesis.xml. Upon completion, you MUST update the XML..." &
[2025-08-23T01:19:02Z] DISPATCHED: claude -p "You are the typescript-node-developer. Task ID: update-hydra-doctor. Add a new check to the HealthChecker class in bin/hydra.mjs to verify xmlstarlet is installed... Your work is part of the 'Living Blueprint' epic. Read the full project context from .claude/epics/living-blueprint/genesis.xml. Upon completion, you MUST update the XML..." &```

### Analysis of the Debug Output

This log file gives you the ground truth. You can now verify:
*   **Is it dispatching?** Yes, entries in the log prove it.
*   **Is it dispatching in parallel?** The close timestamps show it's firing off commands without waiting.
*   **Is it dispatching the *right* commands?** You can read the full prompt being sent to each sub-agent and debug the quality of the instructions. Are they clear? Do they include the correct file paths and task IDs?

This is a powerful debugging tool that moves you from guessing what the orchestrator is doing to *knowing* what it's doing.

### How to Revert

Once you are satisfied with the debugging, you can revert the changes:
1.  **Edit `agents/project-management/parallel-worker.md`** and remove the `bash scripts/debug-dispatch.sh` part from the `MANDATORY BASH SPAWNING` instruction.
2.  (Optional) Delete the script `scripts/debug-dispatch.sh` and the log file `.claude/logs/dispatch.log`.
>>>>>>> origin/main
