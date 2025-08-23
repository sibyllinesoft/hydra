# HYDRA EXECUTION WORKFLOW - Master Prompt Template

## SYSTEM DIRECTIVE
You are now executing a **HYDRA EXECUTION PROTOCOL** - a stateful, autonomous execution workflow for implementing planned features. This prompt contains an embedded XML state machine that manages parallel execution, monitoring, and delivery phases.

**CRITICAL**: This workflow coordinates multiple specialized agents in parallel execution while maintaining state awareness and autonomous monitoring.

---

```xml
<master_workflow name="HYDRA_EXECUTION_PROTOCOL" session_id="{{session_id}}">
  <objective>{{execution_objective}}</objective>
  <context>
    <feature_name>{{feature_name}}</feature_name>
    <epic_path>.claude/epics/{{feature_name}}/epic.md</epic_path>
    <target_branch>feature/{{feature_name}}</target_branch>
    <execution_mode>{{execution_mode}}</execution_mode>
    <quality_gates>{{quality_gates}}</quality_gates>
  </context>
  
  <state_machine>
    <phase id="GITHUB_SYNC" name="GitHub Integration Setup" status="pending" agent_persona="project-manager">
      <deliverable>GitHub issue and project tracking synchronized with epic</deliverable>
      <instruction>
        Execute GitHub synchronization protocol:
        1. Run `/pm:epic-sync` command to create GitHub issue from epic
        2. Verify issue creation and proper labeling
        3. Link epic to GitHub project board if configured
        4. Set up milestone and assignment if specified
        5. Initialize branch protection and review requirements
      </instruction>
      <automation_command>/pm:epic-sync --epic={{feature_name}} --create-issue --sync-project</automation_command>
      <validation_criteria>
        <criterion>GitHub issue exists with proper epic linkage</criterion>
        <criterion>Project board updated with new issue</criterion>
        <criterion>Milestone and labels correctly applied</criterion>
        <criterion>Branch protection rules configured</criterion>
      </validation_criteria>
    </phase>
    
    <phase id="PARALLEL_EXECUTION_SETUP" name="Parallel Execution Initialization" status="pending" agent_persona="parallel-worker">
      <deliverable>Autonomous execution environment with active worktree management</deliverable>
      <instruction>
        Initialize parallel execution environment:
        1. Invoke `parallel-worker` agent with epic context
        2. Create and configure feature branch worktree
        3. Establish task queue from epic breakdown
        4. Set up autonomous monitoring and progress tracking
        5. Initialize quality gates and testing pipeline
        6. Configure rollback and recovery mechanisms
      </instruction>
      <agent_invocation>
        <agent>parallel-worker</agent>
        <parameters>
          <epic_path>.claude/epics/{{feature_name}}/epic.md</epic_path>
          <target_branch>feature/{{feature_name}}</target_branch>
          <execution_mode>autonomous</execution_mode>
          <monitoring_interval>300</monitoring_interval>
        </parameters>
      </agent_invocation>
      <validation_criteria>
        <criterion>Feature branch created and worktree established</criterion>
        <criterion>Task queue populated from epic breakdown</criterion>
        <criterion>Monitoring systems active and reporting</criterion>
        <criterion>Quality gates configured and enabled</criterion>
      </validation_criteria>
    </phase>
    
    <phase id="AUTONOMOUS_EXECUTION_MONITORING" name="Autonomous Implementation Monitoring" status="pending" agent_persona="studio-coach">
      <deliverable>Completed feature implementation with continuous quality validation</deliverable>
      <instruction>
        Monitor and coordinate autonomous execution:
        1. Establish monitoring loop for parallel-worker progress
        2. Validate intermediate deliverables against epic requirements
        3. Coordinate specialized agent handoffs as needed
        4. Monitor quality gates and testing pipeline status
        5. Handle escalations and blockers autonomously when possible
        6. Maintain execution state and progress documentation
      </instruction>
      <monitoring_loop>
        <interval_seconds>300</interval_seconds>
        <status_check_commands>
          <command>git status --porcelain</command>
          <command>git log --oneline -10</command>
          <command>npm test -- --passWithNoTests</command>
          <command>cat .claude/epics/{{feature_name}}/progress.md</command>
        </status_check_commands>
      </monitoring_loop>
      <escalation_triggers>
        <trigger condition="test_failures_persistent">Invoke test-writer-fixer agent</trigger>
        <trigger condition="merge_conflicts">Invoke git-workflow agent for resolution</trigger>
        <trigger condition="performance_regression">Invoke performance-benchmarker agent</trigger>
        <trigger condition="security_issues">Invoke security-ninja agent</trigger>
      </escalation_triggers>
      <validation_criteria>
        <criterion>All epic tasks completed and validated</criterion>
        <criterion>Quality gates passing consistently</criterion>
        <criterion>No blocking issues or conflicts</criterion>
        <criterion>Test coverage meets requirements</criterion>
      </validation_criteria>
    </phase>
    
    <phase id="DELIVERY_AND_CLEANUP" name="Feature Delivery and Project Cleanup" status="pending" agent_persona="project-shipper">
      <deliverable>Feature merged to main branch with complete documentation and project cleanup</deliverable>
      <instruction>
        Execute delivery and cleanup protocol:
        1. Invoke `project-shipper` agent for final delivery
        2. Run comprehensive pre-merge validation
        3. Create and merge pull request with proper documentation
        4. Execute post-merge cleanup and archival
        5. Update project tracking and close associated issues
        6. Generate completion report and lessons learned
      </instruction>
      <agent_invocation>
        <agent>project-shipper</agent>
        <parameters>
          <feature_branch>feature/{{feature_name}}</feature_branch>
          <epic_path>.claude/epics/{{feature_name}}/epic.md</epic_path>
          <target_branch>main</target_branch>
          <cleanup_mode>full</cleanup_mode>
        </parameters>
      </agent_invocation>
      <validation_criteria>
        <criterion>Pull request created and merged successfully</criterion>
        <criterion>All tests passing on main branch</criterion>
        <criterion>Epic archived with completion documentation</criterion>
        <criterion>GitHub issue closed with proper resolution</criterion>
      </validation_criteria>
    </phase>
  </state_machine>
  
  <self_correction_loop>
    <instruction>
      Continuous state management protocol:
      1. After each phase completion, update XML status immediately
      2. Validate phase deliverables against success criteria
      3. If validation fails, retry phase with corrected approach
      4. If persistent failures, escalate with detailed diagnostic info
      5. Before starting new phase, confirm all prerequisites met
      6. Maintain execution log for debugging and recovery
    </instruction>
    <state_persistence>
      <file_path>.claude/execution-state/{{feature_name}}-{{session_id}}.xml</file_path>
      <update_frequency>after_each_phase</update_frequency>
    </state_persistence>
  </self_correction_loop>
  
  <autonomous_recovery>
    <instruction>
      Automated error recovery protocols:
      1. Detect failures through monitoring loop status checks
      2. Classify failure type and determine recovery approach
      3. Execute automated recovery if within defined parameters
      4. If recovery successful, continue execution with updated state
      5. If recovery fails, escalate to user with full diagnostic report
      6. Maintain recovery attempt log for analysis
    </instruction>
    <recovery_strategies>
      <strategy type="test_failure">Re-run tests, analyze output, invoke test-writer-fixer if needed</strategy>
      <strategy type="merge_conflict">Attempt auto-resolution, invoke git-workflow agent if complex</strategy>
      <strategy type="build_failure">Check dependencies, validate configuration, retry build</strategy>
      <strategy type="timeout">Increase timeout limits, check resource availability</strategy>
    </recovery_strategies>
  </autonomous_recovery>
  
  <user_checkpoint>
    <trigger>Before final delivery phase</trigger>
    <instruction>
      Before initiating delivery:
      1. Present execution summary with key metrics
      2. Highlight any deviations from original epic
      3. Show test coverage and quality gate status
      4. Request user approval for merge to main branch
      5. Confirm cleanup and archival preferences
    </instruction>
  </user_checkpoint>
  
  <progress_reporting>
    <instruction>
      Maintain continuous progress visibility:
      1. Update progress.md file in epic directory every 15 minutes
      2. Log significant milestones and decisions
      3. Track time to completion against estimates
      4. Document any scope changes or technical decisions
      5. Report blocking issues immediately upon detection
    </instruction>
    <progress_file_template>
      <location>.claude/epics/{{feature_name}}/progress.md</location>
      <update_interval>900</update_interval>
      <include_sections>current_task,completed_tasks,blockers,next_steps,quality_status</include_sections>
    </progress_file_template>
  </progress_reporting>
  
  <completion_criteria>
    <criterion>All phases marked as "completed" with validation passed</criterion>
    <criterion>Feature successfully merged to main branch</criterion>
    <criterion>All quality gates passing on main branch</criterion>
    <criterion>Epic archived with completion documentation</criterion>
    <criterion>Project tracking updated and issues closed</criterion>
  </completion_criteria>
</master_workflow>
```

---

## WORKFLOW EXECUTION INSTRUCTIONS

### Execution Protocol

This workflow operates in **autonomous mode** with strategic checkpoints:

1. **INITIALIZE**: Set up GitHub integration and project tracking
2. **DEPLOY**: Launch parallel execution environment with specialized agents
3. **MONITOR**: Maintain continuous oversight with automated quality validation
4. **DELIVER**: Execute final merge and cleanup with user confirmation
5. **ARCHIVE**: Complete project cleanup and documentation

### State Machine Management

```xml
<!-- Example state progression -->
<phase id="GITHUB_SYNC" status="completed">
<phase id="PARALLEL_EXECUTION_SETUP" status="active">
```

### Agent Coordination Pattern

This workflow coordinates multiple specialized agents:

- **parallel-worker**: Core execution engine managing task queue
- **studio-coach**: Strategic oversight and coordination
- **project-shipper**: Final delivery and cleanup
- **Specialized agents**: Invoked as needed for specific issues

### Autonomous Monitoring Loop

The monitoring phase runs continuous checks:
```bash
# Every 5 minutes:
git status --porcelain
npm test -- --passWithNoTests
cat .claude/epics/{{feature_name}}/progress.md
```

### Quality Gates Integration

- **Pre-commit**: Linting, type checking, unit tests
- **Pre-merge**: Integration tests, security scans
- **Post-merge**: E2E tests, performance validation

### Error Recovery Automation

- **Test Failures**: Auto-retry → Agent escalation → User notification
- **Merge Conflicts**: Auto-resolution → git-workflow agent → Manual escalation
- **Build Issues**: Dependency check → Config validation → Retry with logs

### Template Variable Substitution

- `{{session_id}}`: Unique execution session ID
- `{{execution_objective}}`: High-level execution goal
- `{{feature_name}}`: Feature identifier from epic
- `{{execution_mode}}`: autonomous/supervised/manual
- `{{quality_gates}}`: Enabled quality validation rules

---

**CRITICAL SUCCESS FACTORS**:
- Maintain continuous state awareness through XML updates
- Leverage parallel execution while preserving oversight
- Implement robust error recovery with minimal user intervention
- Ensure quality gates prevent regression introduction
- Complete delivery only after comprehensive validation