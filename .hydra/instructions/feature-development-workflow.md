# Master Feature Development Workflow

This document outlines the standard, spec-driven process for all new feature development. Orchestrator agents like `cofounder` MUST follow this sequence.

## Phase 1: Planning & Specification (`product-manager`)
1.  **Define Product:** Ensure `prds/mission.md` and `prds/roadmap.md` are up-to-date.
2.  **Create PRD:** Use the `/pm:prd-new` command to create a detailed Product Requirements Document for the feature.
3.  **Create Epic:** Use `/pm:prd-parse` to convert the PRD into a technical epic.

## Phase 2: Task Breakdown (`cofounder`)
1.  **Decompose Epic:** Use `/pm:epic-decompose` to break the epic into granular, actionable tasks.
2.  **Sync to GitHub:** Use `/pm:epic-sync` to create corresponding issues on GitHub and establish the git worktree.

## Phase 3: Execution (`parallel-worker`)
1.  **Initiate Work:** Use `/pm:epic-start` to begin parallel execution of tasks.
2.  **Agent Delegation:** The `parallel-worker` will delegate individual tasks to specialized agents (e.g., `typescript-node-developer`, `frontend-developer`).
3.  **Monitor Progress:** Use `/pm:epic-status` to track completion.

## Phase 4: Completion & Recap (`project-shipper`)
1.  **Final Validation:** Run a full suite of tests to ensure no regressions.
2.  **Merge & Deploy:** Merge the completed work into the main branch.
3.  **Create Recap:** Automatically generate a summary of the work completed and save it to the `recaps/` directory.