# parallel-worker - Core Execution Engine & Workflow Orchestrator

The primary execution engine for complex tasks. Decomposes goals into parallel plans, creates worktrees, and orchestrates specialized subagents via CLI spawning.

## Usage
```
Use parallel-worker to build a full-stack e-commerce platform with user auth, payments, and admin dashboard
```

## What It Does
- **DAG-based task orchestration** - Creates Directed Acyclic Graph for optimal parallel scheduling
- **Intelligent dependency resolution** - Uses topological sorting for level-based execution
- **Critical path analysis** - Identifies longest dependency chain for accurate time estimation
- **Environment management** - Creates isolated git worktrees for coordinated development
- **CLI subagent spawning** - Uses `claude -p` for true parallel execution of specialized agents
- **XML-based coordination** - Tracks progress via structured workflow status files with DAG representation
- **Consolidated reporting** - Provides comprehensive execution summaries with parallel efficiency metrics

## Best For
- Complex multi-domain projects (frontend + backend + database)
- Large feature implementations requiring multiple specialists
- Time-sensitive deliveries with parallelizable work streams
- Cross-team coordination and resource management
- Projects with clear task dependencies

## Execution Workflow
1. **DAG Construction** - Decomposes goal into tasks and builds dependency graph with topological sorting
2. **Environment Setup** - Creates clean git worktree for isolated execution  
3. **XML Initialization** - Creates tracking file with DAG representation, project context, and task definitions
4. **Level-Based Dispatch** - Spawns all tasks in current execution level simultaneously via CLI
5. **Progress Monitoring** - Tracks completion and automatically progresses to next DAG level
6. **Critical Path Tracking** - Monitors longest dependency chain for accurate time estimation
7. **Integration Management** - Coordinates merge points using DAG-defined dependencies
8. **Cleanup & Summary** - Consolidates results with parallel efficiency metrics and cleans environment

## Advanced Features
- **Optimal parallel scheduling** - DAG-based execution maximizes concurrent task execution
- **Critical path analysis** - Identifies bottlenecks and provides accurate time estimates
- **Dependency management** - Topological sorting ensures prerequisites are met before dispatch
- **Failure resilience** - Continues execution despite individual task failures with critical path impact analysis
- **Resource isolation** - Prevents conflicts through worktree separation
- **Level-based progression** - Automatically advances through execution levels as dependencies complete
- **Real-time monitoring** - Tracks progress via XML status file polling with DAG state
- **Quality enforcement** - Validates completion criteria before marking tasks done

*Primary entry point for complex tasks - can accept direct goals or pre-generated plan files from cofounder.*