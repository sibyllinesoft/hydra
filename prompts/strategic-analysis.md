# HYDRA STRATEGIC ANALYSIS - Cofounder Agent Prompt

## SYSTEM DIRECTIVE
You are executing the **HYDRA NEW** command workflow. You MUST invoke the `cofounder` agent to perform strategic analysis for the feature: **{{feature_name}}**.

**CRITICAL INSTRUCTIONS:**
1. The `cofounder` agent is a **STRATEGIC HEAD** that transforms ambiguous goals into clear Product Requirement Prompts (PRPs)
2. Your output MUST be saved to: `{{strategic_brief_path}}`
3. This is NOT a detailed execution plan - it's a strategic brief for later planning
4. Use Socratic questioning to clarify requirements and business context

---

## COFOUNDER AGENT INVOCATION

Please invoke the `cofounder` agent with the following task:

**TASK**: Perform strategic analysis for feature "{{epic_name}}" and produce a comprehensive Product Requirement Prompt (PRP).

**COFOUNDER AGENT REQUIREMENTS:**
- Use systematic Socratic questioning to understand true business goals
- Define the core problem, user needs, and success metrics
- Create a Product Requirement Prompt (PRP) (NOT a detailed plan)
- Focus on WHAT needs to be built and WHY, not HOW
- Output must be saved to the PRP file path

**PRP OUTPUT REQUIREMENTS:**
The `cofounder` agent must generate a markdown file with this structure:

```markdown
# Product Requirement Prompt (PRP): {{feature_name}}

**Created**: {{timestamp}}  
**Status**: Strategic Analysis Complete  
**Next Phase**: Planning (`hydra plan {{epic_name}}`)

## Executive Summary
[Brief overview of the strategic initiative]

## Problem Statement
[Clear definition of the core business problem being solved]

## Business Context
[Why this is needed now, market conditions, competitive landscape]

## Target Users & Use Cases
[Who will use this and how - specific personas and scenarios]

## Success Criteria & Metrics
[Specific, measurable goals and KPIs that define success]

## Strategic Approach
[High-level solution strategy and rationale - the WHAT, not the HOW]

## Constraints & Requirements
[Technical, business, timeline, and resource constraints]

## Risk Assessment
[Key strategic risks and high-level mitigation approaches]

## Dependencies & Assumptions
[External dependencies and key assumptions made in this analysis]

## Next Steps & Handoff
**Recommended Next Action**: `hydra plan {{epic_name}}`

This Product Requirement Prompt (PRP) should be handed off to a planning agent (plan-generator) to create a detailed execution plan with task DAG and technical specifications.

## Success Criteria for This PRP
- [ ] Core business problem clearly defined
- [ ] Success metrics are specific and measurable  
- [ ] Strategic approach addresses the identified problem
- [ ] Constraints and requirements are documented
- [ ] Ready for handoff to detailed planning phase
```

**MANDATORY OUTPUT LOCATION**: 
The cofounder agent MUST save this PRP to: `{{strategic_brief_path}}`

---

## WORKFLOW CONTEXT

**Current Phase**: Strategic Analysis (Phase 1 of Living Blueprint system)
**Input**: User request for feature "{{feature_name}}"
**Output**: Product Requirement Prompt (PRP) saved to epic directory
**Next Phase**: Planning (`hydra plan {{epic_name}}` will read this PRP)

This strategic analysis is the foundation for the new Living Blueprint system where:
1. **`hydra new`** → `cofounder` produces Product Requirement Prompt (PRP)
2. **`hydra plan`** → `plan-generator` creates detailed execution plan (genesis.xml)  
3. **`hydra run`** → `parallel-worker` executes the plan
4. **`hydra recap`** → `project-shipper` documents completion

---

## VALIDATION REQUIREMENTS

The `cofounder` agent must ensure the PRP:
- ✅ Addresses all ambiguity through Socratic questioning
- ✅ Defines clear problem statement and business context
- ✅ Establishes measurable success criteria
- ✅ Provides strategic direction without implementation details
- ✅ Is saved to the correct file path for later planning phase
- ✅ Includes clear handoff recommendation for next steps

**CRITICAL**: This is a strategic analysis, not a detailed plan. The cofounder agent should focus on the business strategy and high-level approach, leaving detailed task breakdowns and technical specifications for the planning phase.