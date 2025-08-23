# Rules System - Quality Assurance & Automation Framework

The `rules/` directory contains the quality enforcement and automation standards that govern how the Hydra agent system operates. These rules ensure consistency, reliability, and maintainability across all agents, commands, and workflows.

## 🎯 What Rules Are

Rules in the Hydra system are **executable standards** that:

- **Enforce quality gates** and prevent common mistakes
- **Standardize patterns** across all agents and commands  
- **Automate best practices** to reduce cognitive load
- **Define failure modes** and recovery strategies
- **Ensure consistency** in outputs and behaviors

Think of rules as the "operating system" for quality assurance - they run in the background, ensuring every agent operation meets established standards.

## 🏗️ Rule Categories

### 1. **Workflow Standards** (`standard-patterns.md`)
**Purpose**: Defines core principles and patterns for all command operations

**Key Standards**:
- **Fail Fast**: Check critical prerequisites, then proceed
- **Trust the System**: Don't over-validate things that rarely fail  
- **Clear Errors**: When something fails, say exactly what and how to fix it
- **Minimal Output**: Show what matters, skip decoration

**Agent Impact**: Every agent must follow these patterns for consistent user experience and reliable error handling.

### 2. **Data Management** (`frontmatter-operations.md`)
**Purpose**: Standardizes YAML frontmatter handling across all markdown files

**Key Rules**:
- Standard fields: `name`, `created`, `updated`, `status`
- Never modify `created` field after initial creation
- Always update `updated` field on modifications
- Consistent status values across file types (PRDs, epics, tasks)

**Agent Impact**: Ensures consistent metadata tracking and proper data lifecycle management across the entire system.

### 3. **External Integration** (`github-operations.md`)
**Purpose**: Standardizes GitHub CLI operations and error handling

**Key Rules**:
- Don't pre-check authentication - run commands and handle failures
- Use `--json` for structured output when parsing
- Keep operations atomic - one gh command per action
- Standard error messages with actionable solutions

**Agent Impact**: Enables reliable GitHub integration without over-engineering authentication checks.

### 4. **Content Processing** (`strip-frontmatter.md`)
**Purpose**: Ensures internal metadata doesn't leak to external systems

**Key Rules**:
- Always strip frontmatter before posting to GitHub
- Use standard `sed` command: `sed '1,/^---$/d; 1,/^---$/d'`
- Create temporary files for cleaned content
- Keep original files intact

**Agent Impact**: Prevents exposing internal system metadata to external users and systems.

### 5. **Quality Assurance** (`test-execution.md`)
**Purpose**: Enforces proper testing patterns and practices

**Key Rules**:
- Always use test-runner agent for consistency
- No mocking - use real services for accurate results
- Verbose output for debugging capability
- Check test structure before assuming code bugs

**Agent Impact**: Ensures reliable, meaningful test results and proper failure diagnosis.

### 6. **Code Analysis** (`use-ast-grep.md`)  
**Purpose**: Promotes structural code analysis over text-based approaches

**Key Rules**:
- Use AST-grep for structural code patterns
- Prefer semantic understanding over regex matching
- Support multiple languages with consistent patterns
- Fall back gracefully when AST-grep is unavailable

**Agent Impact**: Enables more accurate code analysis and safer refactoring operations.

### 7. **Team Coordination** (`agent-coordination.md`, `worktree-operations.md`)
**Purpose**: Defines how agents work together and manage shared resources

**Key Rules**:
- Clear handoff protocols between agents
- Shared resource management (worktrees, temporary files)
- Conflict resolution strategies
- Progress communication standards

**Agent Impact**: Enables complex multi-agent workflows while preventing resource conflicts.

## 🔄 How Agents Use Rules

### **Automatic Enforcement**
Rules are embedded into agent system prompts and command templates, making compliance automatic rather than optional.

### **Quality Gates**
Before executing operations, agents check relevant rules to:
- Validate inputs against standards
- Choose appropriate tools and patterns
- Apply consistent error handling
- Generate standardized outputs

### **Failure Recovery**
When operations fail, rules provide:
- Standard error message formats
- Defined recovery procedures
- Escalation paths for complex failures
- Fallback strategies for missing tools

### **Pattern Reuse**
Rules capture proven patterns that agents can apply consistently:
- File operation templates
- API interaction patterns
- Data transformation procedures
- Output formatting standards

## 🚀 Workflow Integration

### **Development Workflow**
1. **Pre-execution**: Check rule compliance
2. **During execution**: Apply standard patterns  
3. **Post-execution**: Validate against quality gates
4. **On failure**: Follow defined recovery procedures

### **Multi-Agent Coordination**
Rules ensure that when Agent A hands work to Agent B:
- Data formats are consistent
- Required metadata is present
- Quality standards are maintained
- Progress can be tracked reliably

### **Command Execution**
Every command follows rule-based patterns:
- Standard validation steps
- Consistent error handling
- Predictable output formats
- Reliable cleanup procedures

## 📈 Quality Benefits

### **Consistency**
- All agents speak the same "language"
- Predictable behaviors across workflows
- Uniform error messages and recovery

### **Reliability** 
- Proven patterns reduce edge case failures
- Standard error handling prevents cascade failures
- Clear recovery procedures minimize downtime

### **Maintainability**
- Rules document best practices
- Pattern reuse reduces code duplication
- Clear standards ease onboarding

### **Automation**
- Quality checks run automatically
- Standard patterns require no decisions
- Error recovery often happens without human intervention

## 🔧 Extending Rules

### **Adding New Rules**
1. **Identify Pattern**: Find recurring quality issues or manual processes
2. **Define Standard**: Create clear, testable criteria
3. **Document Examples**: Show good and bad patterns
4. **Embed in Agents**: Update relevant system prompts
5. **Test Compliance**: Verify agents follow the new rules

### **Customizing Existing Rules**
1. **Understand Impact**: Rules affect multiple agents and workflows
2. **Maintain Compatibility**: Changes should be backward-compatible when possible
3. **Update Documentation**: Keep examples and patterns current
4. **Test Thoroughly**: Verify no workflows break with changes

### **Rule Categories to Consider**
- **Security patterns** (authentication, data handling)
- **Performance standards** (resource usage, timeouts)
- **Documentation requirements** (API docs, README standards)
- **Integration patterns** (external service interactions)

## 💡 Best Practices

### **For Rule Authors**
- **Be Specific**: Vague rules lead to inconsistent implementation
- **Provide Examples**: Show both correct and incorrect patterns
- **Consider Edge Cases**: Address failure modes and recovery
- **Keep Updated**: Rules should evolve with system capabilities

### **For System Maintainers**
- **Monitor Compliance**: Track how well agents follow rules
- **Gather Feedback**: Learn from rule violations and edge cases
- **Regular Review**: Rules should be living documents
- **Impact Assessment**: Understand how rule changes affect workflows

## 🔍 Rule Effectiveness

### **Success Metrics**
- Reduced error rates across agent operations
- Faster recovery from failures
- More consistent user experiences
- Lower maintenance overhead

### **Quality Indicators**
- Agents rarely need manual intervention
- Error messages are actionable
- Workflows complete reliably
- Output formats are predictable

The rules system transforms quality assurance from a manual, error-prone process into an automated, reliable foundation that enables the Hydra agent system to operate at scale with minimal human oversight.

---

**Remember**: Rules are not constraints - they're enablers that free agents to focus on solving problems rather than reinventing solutions to already-solved quality challenges.