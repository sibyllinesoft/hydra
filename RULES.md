# ⛔ BLOCKING RULES - Non-Negotiable Behavioral Enforcement

## RULE #0: ⛔ AUTOMATIC AGENT DELEGATION (UNIVERSAL ENFORCEMENT)

<mandatory_protocol>
BEFORE EVERY RESPONSE: Execute agent applicability scan
</mandatory_protocol>

### 🤖 Required Pre-Action Steps

<scan_process>
  <step number="1" name="Keyword Analysis">
    <action>Scan user request for agent trigger keywords</action>
    <action>Match context to agent specializations</action>
    <action>Identify task complexity and domain requirements</action>
  </step>
  
  <step number="2" name="Agent Selection">
    <if condition="utility_domain_detected">USE_MANDATORY_UTILITY_AGENT</if>
    <elif condition="single_domain_task">USE_SPECIALIZED_AGENT</elif>
    <elif condition="cross_domain_task">USE_COFOUNDER_ORCHESTRATION</elif>
    <else>PROCEED_WITH_DIRECT_TOOLS</else>
  </step>
  
  <step number="3" name="Auto-Delegation">
    <action>Spawn appropriate agent(s) with task context</action>
    <rule>ONLY use direct tools if NO agent matches or agent fails</rule>
    <rule>Document agent selection reasoning if non-obvious</rule>
  </step>
</scan_process>

### 🎯 Agent Trigger Keywords

<trigger_matrix>
  <utility_agents mandatory="true">
    <trigger keywords="file creation, directory, template">file-creator</trigger>
    <trigger keywords="git, commit, branch, merge, push">git-workflow</trigger>
    <trigger keywords="date, time, schedule, timestamp">date-checker</trigger>
    <trigger keywords="docs, readme, documentation">context-fetcher</trigger>
    <trigger keywords="search, research, readwise, web">knowledge-fetcher</trigger>
  </utility_agents>
  
  <domain_specialists>
    <trigger keywords="mobile, android, ios, app">mobile-app-builder</trigger>
    <trigger keywords="web, react, frontend, ui">frontend-developer</trigger>
    <trigger keywords="api, backend, server, database">backend-architect</trigger>
    <trigger keywords="test, testing, bug, debug">test-writer-fixer</trigger>
    <trigger keywords="design, interface, ux">ui-designer</trigger>
    <trigger keywords="deploy, deployment, production">devops-automator</trigger>
  </domain_specialists>
  
  <coordination_agents>
    <trigger keywords="ambiguous, unclear, vague goal, strategic analysis, high-level vision">cofounder</trigger>
    <trigger keywords="detailed plan, TODO, epic, multi-step execution, coordinate tasks">parallel-worker</trigger>
    <trigger keywords="multi-team, resource allocation, timeline coordination">studio-producer</trigger>
    <trigger keywords="post-flight, project recap, comprehensive documentation">project-shipper</trigger>
  </coordination_agents>
</trigger_matrix>

### ⚡ ENFORCEMENT HIERARCHY
1. **RULE #0 SUPERSEDES ALL**: Automatic agent delegation takes precedence over direct tool usage
2. **NO MANUAL OVERRIDE**: Cannot bypass agent delegation without explicit agent failure
3. **CONTEXT PRESERVATION**: Every agent delegation preserves conversation context through fresh spawns
4. **QUALITY ASSURANCE**: Agent expertise delivers superior results over general-purpose tool usage

## RULE #1: ⛔ AGENT-FIRST ENFORCEMENT (COGNITIVE STOP)

### 🚫 FORBIDDEN WITHOUT AGENTS
**STOP IMMEDIATELY if attempting these operations directly:**

- **file-creator** MANDATORY for: File creation (Write tool), Directory creation, Template application, Batch file operations
- **git-workflow** MANDATORY for: All git commands (commit, push, branch, merge), Repository operations, Version control workflows
- **context-fetcher** MANDATORY for: Documentation retrieval (Read tool for docs), Internal knowledge base access, Technical reference lookup
- **knowledge-fetcher** MANDATORY for: External research (Readwise, Context7), Web search operations, Knowledge synthesis from multiple sources
- **date-checker** MANDATORY for: Date/time calculations, Scheduling queries, Timestamp analysis

### ⛔ ENFORCEMENT PROTOCOL
```
BEFORE ANY TOOL USE:
1. PAUSE - Does an agent exist for this domain?
2. CHECK - Is this a utility agent mandatory domain?
3. REDIRECT - Use agent instead of direct tool
4. ONLY PROCEED with direct tools if NO AGENT EXISTS or AGENT FAILS
```

## RULE #2: ⛔ FILE SAFETY ENFORCEMENT

**MANDATORY Read-Before-Write Protocol:**
- Read tool MUST precede Write/Edit operations
- Absolute paths ONLY - no relative paths permitted
- Never auto-commit without explicit user permission

**MANDATORY Commit Message Standards:**
- Never reference "Claude", "AI", "assistant", or similar terms
- Use active voice and technical descriptions
- Focus on what changed, not who/what made the change
- Examples:
  - ✅ "Add automatic agent delegation protocol"  
  - ✅ "Optimize configuration token consumption by 18%"
  - ✅ "Enhance skin tone filter selection logic"
  - ❌ "Claude added automatic agent delegation"
  - ❌ "AI optimized the configuration files"
  - ❌ "Assistant enhanced the skin tone filter"
- **Enforcement**: git-workflow agent MUST validate and rewrite non-compliant messages
- **Auto-correction**: Replace AI references with appropriate technical descriptions

## RULE #3: ⛔ CODEBASE CHANGE ENFORCEMENT

**MANDATORY Discovery-Before-Change Protocol:**
- Complete project-wide discovery before ANY changes
- Search ALL file types for ALL variations of target terms
- Document all references with context and impact assessment
- Execute changes in coordinated manner following plan

# ✅ OPERATIONAL GUIDELINES - Best Practices & Standards

## Task Execution Standards

### Validation Protocols
- Always validate before execution, verify after completion
- Run lint/typecheck before marking tasks complete
- Maintain ≥90% context retention across operations
- Use batch tool calls when possible, sequential only when dependencies exist

### Framework Compliance
- Check package.json/requirements.txt before using libraries
- Follow existing project patterns and conventions
- Use project's existing import styles and organization
- Respect framework lifecycles and best practices

## Quality Assurance Pipeline

### Validation Sequence
1. **Syntax Check**: Language parsers and intelligent suggestions
2. **Type Validation**: Type compatibility and context-aware suggestions
3. **Code Quality**: Linting rules and refactoring suggestions
4. **Security Review**: Vulnerability assessment and compliance
5. **Testing**: Coverage analysis and validation
6. **Performance**: Benchmarking and optimization suggestions
7. **Documentation**: Completeness validation and accuracy verification
8. **Integration**: Deployment validation and compatibility verification

### Evidence Requirements
- **Quantitative**: Performance/quality/security metrics, coverage percentages
- **Qualitative**: Code quality improvements, security enhancements, UX improvements
- **Documentation**: Change rationale, test results, performance benchmarks

## Operational Safety Protocols

### ✅ ALWAYS Execute
- Agent-first approach for ALL operations
- Specialized agents for domain-specific tasks
- Batch operations for efficiency
- Complete discovery before codebase changes
- Verify completion with evidence

### ⛔ NEVER Execute
- Direct tools when agents are available (violates agent-first mandate)
- File modifications without Read operations
- Relative paths in file operations
- Framework pattern violations
- Changes without discovery phase
- Task completion without verification

## RULE #4: ⛔ SUDO COMMAND AND DEPENDENCY INSTALLATION ENFORCEMENT

### 🚫 MANDATORY SCRIPT CREATION PROTOCOL
**NEVER execute sudo commands directly. ALWAYS create installation scripts instead.**

### When This Rule Applies
- Package installation requiring elevated privileges (apt, yum, brew with sudo)
- System configuration changes requiring root access
- Service installation and configuration
- Dependency installation that requires sudo privileges
- System-level tool installation
- Permission modifications requiring elevated access

### Required Protocol
1. **Analyze Requirements**: Identify all commands that require sudo access
2. **Create Installation Script**: Generate a comprehensive script with all necessary steps
3. **Include Safety Measures**: Add error checking, validation, and rollback procedures
4. **Prompt User Execution**: Clearly instruct user to review and run the script manually

### Script Standards
**MANDATORY Script Template:**
```bash
#!/bin/bash
# [Description of what this script installs/configures]
# Generated on: [DATE]
# Review this script before execution

set -euo pipefail  # Exit on any error

echo "🔍 Checking system requirements..."
# Validation checks here

echo "📦 Installing dependencies..."
# All sudo commands here with explanations

echo "✅ Verifying installation..."
# Validation steps here

echo "🎉 Installation complete!"
```

### Required Script Elements
- **Header**: Clear description and generation date
- **Error Handling**: `set -euo pipefail` for safe execution
- **Validation**: Pre-installation system checks
- **Progress Indicators**: Clear user feedback during execution
- **Verification**: Post-installation validation steps
- **Documentation**: Comments explaining each major step

### User Communication Template
```
I need to install system dependencies that require elevated privileges. 
For security, I've created an installation script instead of running sudo commands directly.

Please review the script below and run it manually:

[SCRIPT_CONTENT]

To execute:
1. Save the script to a file (e.g., `install-deps.sh`)
2. Make it executable: `chmod +x install-deps.sh`
3. Review the contents to ensure it's safe
4. Run with: `./install-deps.sh`

This approach allows you to review all system changes before they're made.
```

### Examples of When This Rule Applies
```yaml
package_managers:
  - "sudo apt install [package]"
  - "sudo yum install [package]" 
  - "sudo brew install [package]" (when requiring sudo)
  - "sudo npm install -g [package]"
  - "sudo pip install [package]"

system_configuration:
  - "sudo systemctl enable [service]"
  - "sudo chmod/chown commands"
  - "sudo mkdir in system directories"
  - "sudo cp/mv to system locations"

service_management:
  - "sudo docker commands" (in some configurations)
  - "sudo service start/stop [service]"
  - "sudo systemctl daemon-reload"

development_tools:
  - Installing Docker, Node.js, Python via system package manager
  - Setting up databases requiring system integration
  - Installing CLI tools in system directories
```

### ⚡ ENFORCEMENT ACTIONS
- **Detection**: Scan all proposed commands for sudo requirements
- **Prevention**: Block direct sudo command execution
- **Alternative**: Generate installation script automatically
- **Education**: Explain security rationale to user
- **Verification**: Ensure script includes proper safety measures

## RULE #5: ⛔ ARCHITECTURAL DECISION DOCUMENTATION ENFORCEMENT

### 🛡️ MANDATORY INCOMPLETE TASK DOCUMENTATION
**When tasks cannot be completed due to scope, complexity, or architectural limitations, MUST document in repository-level `architecture.md`**

### When This Rule Applies
- **Scope Limitations**: Task requires structural changes beyond current scope
- **Architectural Tradeoffs**: Important choice points requiring user/stakeholder input
- **Technical Blockers**: External limitations, API constraints, or framework restrictions
- **Design Decisions**: Consequential implementation paths with multiple viable options
- **Failed Approaches**: Attempted solutions that didn't work and shouldn't be retried

### Required Documentation Elements
```markdown
## [Project/Feature/Component Name]

### [YYYY-MM-DD] - [Task Title]
**Status**: [INCOMPLETE|BLOCKED|DEFERRED|NEEDS_DECISION]
**Attempted By**: [Agent Type or Direct Implementation]

**What Was Attempted**: 
- Brief description of approach taken
- Key implementation steps completed
- Specific stopping point reached

**Why It Stopped**:
- [SCOPE]: Changes required exceed current task boundaries
- [TRADEOFFS]: Multiple approaches with significant implications
- [BLOCKED]: External constraints preventing completion
- [TECHNICAL]: Framework/tool/dependency limitations

**Key Findings**_
- Technical insights discovered during attempt
- Constraints or limitations identified
- Dependencies or prerequisites revealed

**For Future Reference**:
- Recommended next steps or alternative approaches
- Decisions that need stakeholder input
- Architectural changes required for completion

**Related**: [Links to other sections, PRs, issues, or documentation]

---
```

### Documentation Organization Standards
```markdown
# Repository Architecture & Decision Log

## Active Projects
[Current major initiatives organized by domain/feature]

## Decision Queue  
[Items requiring stakeholder/architectural decisions]

## Technical Blockers
[External constraints and their status]

## Failed Approaches
[Attempted solutions to avoid retrying]

## Historical Decisions
[Completed architectural choices and rationale]
```

### File Location and Structure
- **File Path**: `./architecture.md` (repository root)
- **Format**: Markdown with consistent section headers
- **Organization**: Chronological within each project/feature section
- **Linking**: Cross-reference related decisions and blockers

### Integration with Existing Documentation
- **ADRs**: Link to formal Architecture Decision Records for major choices
- **ENGINEERING-STANDARDS.md**: Reference for system-level architecture requirements  
- **Project Documentation**: Link to specific project docs when relevant
- **Issue Tracking**: Reference GitHub issues, tickets, or other tracking systems

### Mandatory Update Triggers
- **Task Abandonment**: Any task stopped before completion
- **Scope Escalation**: When implementation reveals larger structural needs
- **Choice Points**: When multiple approaches have significant tradeoffs
- **External Blockers**: When dependencies or constraints prevent progress
- **Failed Attempts**: When attempted solutions don't work as expected

### Quality Standards
- **Concise but Informative**: Capture essential context without excessive detail
- **Actionable**: Include enough information for future developers to continue
- **Indexed**: Use consistent naming and organization for easy reference
- **Linked**: Connect related decisions and maintain cross-references
- **Timestamped**: Enable tracking of decision evolution and progress

### Agent Coordination
- **file-creator**: Use for creating/updating architecture.md file
- **context-fetcher**: Use for reviewing existing architectural decisions
- **cofounder**: Use for strategic analysis of ambiguous architectural requirements
- **Backend/Frontend Architects**: Use for domain-specific technical decisions
---

## ⛔ CCPM-Derived Hard Rules (MANDATORY)

The following rules are non-negotiable and supplement existing guidelines with stricter, more direct enforcement for higher quality and context preservation.

### 1. Mandatory Sub-Agent Usage (Context Firewall Protocol)
- **Purpose**: To protect the main conversation context from verbose information.
- **Rule**: The following agents MUST be used for their respective tasks instead of direct tool use or verbose output in the main thread.
  - **`file-analyzer`**: MUST be used when asked to read or analyze any verbose file (e.g., logs, command outputs, large data files).
  - **`code-analyzer`**: MUST be used for all initial code searches, bug investigations, and logic tracing.
  - **`test-runner`**: MUST be used to execute all tests and analyze results.

### 2. Absolute Rules for Code Implementation
- **NO PARTIAL IMPLEMENTATION**: Features must be fully implemented to meet acceptance criteria. No placeholder code.
- **NO CODE DUPLICATION**: Before writing new functions, the existing codebase MUST be checked for reusable utilities.
- **NO DEAD CODE**: Any code that becomes unused during refactoring MUST be removed.
- **IMPLEMENT TEST FOR EVERY FUNCTION**: All new business logic must be accompanied by corresponding tests.
- **NO CHEATER TESTS**: Tests must be accurate, reflect real usage, and be designed to reveal flaws. They must not simply exist for coverage metrics.
- **NO OVER-ENGINEERING**: Do not add unnecessary abstractions or patterns when simpler functions suffice.

### 3. Absolute Rules for Testing
- **NO MOCKING**: All tests should use real services and implementations wherever possible to ensure they reflect production behavior accurately. Use test containers or live test environments.
- **VERBOSE TEST OUTPUT**: Tests must be configured to be verbose so that their logs can be used for effective debugging by the `file-analyzer` or `code-analyzer`.
- **CHECK TEST STRUCTURE FIRST**: If a test fails, the agent's first hypothesis should be that the test itself is flawed (e.g., incorrect setup, bad assertion) before assuming the application code is buggy.

<rule name="Complex Task Execution Protocol">
  <condition>User request is complex, involves multiple steps, or can be parallelized.</condition>
  <enforcement>
    <step number="1">The main orchestrator MUST invoke the `parallel-worker` agent with the high-level goal.</step>
    <step number="2">For extremely complex or ambiguous goals, the `cofounder` can be used first to generate a strategic brief file, which is then passed to the planning phase.</step>
    <step number="3">The `parallel-worker` is responsible for all subsequent planning, subagent dispatch, and monitoring.</step>
  </enforcement>
</rule>