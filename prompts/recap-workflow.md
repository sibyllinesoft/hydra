# HYDRA RECAP WORKFLOW - Master Prompt Template

## SYSTEM DIRECTIVE
You are now executing a **HYDRA RECAP PROTOCOL** - a comprehensive post-delivery analysis workflow. Your role is to synthesize the complete development journey into actionable insights and documentation.

**CRITICAL**: You are operating as the `project-shipper` agent with access to git history, GitHub data, and archived epic documentation. Create a comprehensive development recap that captures lessons learned and project metrics.

---

```xml
<master_workflow name="HYDRA_RECAP_PROTOCOL" session_id="{{session_id}}">
  <objective>{{recap_objective}}</objective>
  <context>
    <feature_name>{{feature_name}}</feature_name>
    <epic_archive_path>.claude/epics/.archived/{{feature_name}}/epic.md</epic_archive_path>
    <feature_branch>feature/{{feature_name}}</feature_branch>
    <recap_output_path>recaps/{{recap_date}}-{{feature_name}}.md</recap_output_path>
    <github_pr_url>{{github_pr_url}}</github_pr_url>
    <completion_date>{{completion_date}}</completion_date>
  </context>
  
  <state_machine>
    <phase id="ARCHIVE_DISCOVERY" name="Epic and Documentation Discovery" status="pending" agent_persona="project-shipper">
      <deliverable>Located and validated archived epic and related documentation</deliverable>
      <instruction>
        Locate and analyze project artifacts:
        1. Find archived epic at `.claude/epics/.archived/{{feature_name}}/epic.md`
        2. Verify epic completeness and extract original requirements
        3. Locate any related documentation (ADRs, design docs, etc.)
        4. Identify associated project files and configurations
        5. Extract original timeline estimates and scope definition
      </instruction>
      <discovery_commands>
        <command>find .claude/epics/.archived/{{feature_name}} -type f -name "*.md"</command>
        <command>cat .claude/epics/.archived/{{feature_name}}/epic.md</command>
        <command>find . -name "*{{feature_name}}*" -type f | head -20</command>
      </discovery_commands>
      <validation_criteria>
        <criterion>Archived epic file exists and is readable</criterion>
        <criterion>Original requirements and scope extracted</criterion>
        <criterion>Timeline estimates and acceptance criteria identified</criterion>
        <criterion>Related documentation discovered and catalogued</criterion>
      </validation_criteria>
    </phase>
    
    <phase id="GIT_ANALYSIS" name="Git History and Commit Analysis" status="pending" agent_persona="project-shipper">
      <deliverable>Complete git commit history analysis with development timeline</deliverable>
      <instruction>
        Analyze git history for development insights:
        1. Use `git log --oneline --grep="{{feature_name}}"` to find related commits
        2. Use `git log --oneline feature/{{feature_name}}` for branch-specific history
        3. Extract commit messages, timestamps, and change patterns
        4. Identify key development milestones and decision points
        5. Calculate actual development time and effort distribution
        6. Analyze commit frequency and development velocity
      </instruction>
      <git_analysis_commands>
        <command>git log --oneline --grep="{{feature_name}}" --all</command>
        <command>git log --oneline --since="{{start_date}}" --until="{{completion_date}}" --grep="{{feature_name}}"</command>
        <command>git log --oneline feature/{{feature_name}} 2>/dev/null || echo "Feature branch not found"</command>
        <command>git log --stat --since="{{start_date}}" --until="{{completion_date}}" --grep="{{feature_name}}" | head -100</command>
        <command>git shortlog -sn --since="{{start_date}}" --until="{{completion_date}}" --grep="{{feature_name}}"</command>
      </git_analysis_commands>
      <validation_criteria>
        <criterion>Commit history successfully extracted</criterion>
        <criterion>Development timeline constructed</criterion>
        <criterion>Key milestones and decision points identified</criterion>
        <criterion>Effort distribution analysis completed</criterion>
      </validation_criteria>
    </phase>
    
    <phase id="GITHUB_INTEGRATION" name="GitHub PR and Review Analysis" status="pending" agent_persona="project-shipper">
      <deliverable>GitHub pull request analysis with review feedback and discussion</deliverable>
      <instruction>
        Analyze GitHub integration data:
        1. If GitHub PR URL available, use `gh pr view {{github_pr_url}}` for PR details
        2. Extract review comments, approval status, and discussion threads
        3. Analyze CI/CD pipeline results and quality gate outcomes
        4. Document any deployment or integration challenges
        5. Capture team collaboration patterns and feedback themes
      </instruction>
      <github_analysis_commands>
        <command>gh pr list --search "{{feature_name}}" --state all --limit 5</command>
        <command>gh pr view {{github_pr_url}} --json title,body,reviews,comments,commits 2>/dev/null || echo "PR not found"</command>
        <command>gh pr checks {{github_pr_url}} 2>/dev/null || echo "PR checks not available"</command>
      </github_analysis_commands>
      <validation_criteria>
        <criterion>PR information extracted successfully or unavailability documented</criterion>
        <criterion>Review feedback and discussions captured</criterion>
        <criterion>CI/CD results and quality metrics documented</criterion>
        <criterion>Team collaboration insights identified</criterion>
      </validation_criteria>
    </phase>
    
    <phase id="SYNTHESIS_AND_ANALYSIS" name="Synthesis and Lessons Learned Analysis" status="pending" agent_persona="project-shipper">
      <deliverable>Comprehensive analysis comparing planned vs actual outcomes with insights</deliverable>
      <instruction>
        Synthesize all gathered data into actionable insights:
        1. Compare original epic estimates vs actual delivery time
        2. Identify scope changes and requirement evolution
        3. Analyze technical challenges and solution approaches
        4. Extract lessons learned and improvement opportunities
        5. Assess process effectiveness and team collaboration
        6. Document key decisions and their impact on outcomes
      </instruction>
      <analysis_framework>
        <comparison_metrics>
          <metric>planned_timeline vs actual_timeline</metric>
          <metric>original_scope vs delivered_scope</metric>
          <metric>estimated_effort vs actual_effort</metric>
          <metric>predicted_risks vs encountered_issues</metric>
        </comparison_metrics>
        <insight_categories>
          <category>technical_decisions</category>
          <category>process_effectiveness</category>
          <category>team_collaboration</category>
          <category>quality_outcomes</category>
          <category>risk_mitigation</category>
        </insight_categories>
      </analysis_framework>
      <validation_criteria>
        <criterion>Planned vs actual comparison completed</criterion>
        <criterion>Key insights and lessons learned documented</criterion>
        <criterion>Process improvement recommendations identified</criterion>
        <criterion>Technical decision impacts analyzed</criterion>
      </validation_criteria>
    </phase>
    
    <phase id="RECAP_GENERATION" name="Recap Document Generation" status="pending" agent_persona="project-shipper">
      <deliverable>Complete recap document at recaps/{{recap_date}}-{{feature_name}}.md</deliverable>
      <instruction>
        Generate comprehensive recap document:
        1. Create recap file following the standard template structure
        2. Include executive summary with key metrics and outcomes
        3. Document development timeline with major milestones
        4. Capture technical decisions and architectural insights
        5. List lessons learned and process improvement recommendations
        6. Include quantitative metrics and performance data
        7. Add team feedback and collaboration observations
      </instruction>
      <recap_template_structure>
        <section name="Executive Summary">High-level outcomes and metrics</section>
        <section name="Project Overview">Scope, timeline, and deliverables</section>
        <section name="Development Timeline">Key milestones and decision points</section>
        <section name="Technical Insights">Architecture decisions and solutions</section>
        <section name="Process Analysis">Development workflow effectiveness</section>
        <section name="Lessons Learned">Key insights and improvement opportunities</section>
        <section name="Metrics and Performance">Quantitative outcomes and comparisons</section>
        <section name="Recommendations">Future process and technical improvements</section>
      </recap_template_structure>
      <validation_criteria>
        <criterion>Recap file created at correct location</criterion>
        <criterion>All required sections completed with relevant content</criterion>
        <criterion>Quantitative metrics included where available</criterion>
        <criterion>Actionable recommendations provided</criterion>
      </validation_criteria>
    </phase>
  </state_machine>
  
  <self_correction_loop>
    <instruction>
      Data quality and completeness validation:
      1. After each phase, validate data completeness against requirements
      2. If data is missing or incomplete, retry with alternative approaches
      3. Document data limitations and their impact on analysis
      4. Ensure continuity between phases and cumulative insight building
      5. Validate synthesis accuracy against source artifacts
    </instruction>
  </self_correction_loop>
  
  <data_fallback_strategies>
    <instruction>
      When primary data sources are unavailable:
      1. If archived epic missing: Search for epic in main epics directory
      2. If git history sparse: Expand search timeframe and criteria
      3. If GitHub data unavailable: Focus on local git and file analysis
      4. If PR not found: Look for related issues or discussions
      5. Document all data limitations in final recap
    </instruction>
    <fallback_commands>
      <command>find .claude/epics -name "*{{feature_name}}*" -type f</command>
      <command>git log --oneline --all --since="1 month ago" | grep -i "{{feature_name}}"</command>
      <command>find . -name "*.md" -exec grep -l "{{feature_name}}" {} \;</command>
    </fallback_commands>
  </data_fallback_strategies>
  
  <recap_quality_gates>
    <instruction>
      Ensure recap meets quality standards:
      1. Executive summary clearly states project outcomes
      2. Timeline analysis includes specific dates and durations
      3. Technical insights provide actionable information
      4. Lessons learned are specific and implementation-focused
      5. Recommendations are prioritized and feasible
      6. Quantitative data supports qualitative observations
    </instruction>
  </recap_quality_gates>
  
  <completion_criteria>
    <criterion>All phases completed with successful data gathering</criterion>
    <criterion>Recap document generated at specified location</criterion>
    <criterion>Document includes all required sections with substantive content</criterion>
    <criterion>Quantitative and qualitative insights balanced appropriately</criterion>
    <criterion>Actionable recommendations provided for future improvements</criterion>
  </completion_criteria>
</master_workflow>
```

---

## RECAP DOCUMENT TEMPLATE

When generating the final recap document, use this structure:

```markdown
# Development Recap: {{feature_name}}

**Completion Date**: {{completion_date}}  
**Epic**: [{{feature_name}}](.claude/epics/.archived/{{feature_name}}/epic.md)  
**GitHub PR**: {{github_pr_url}}

## Executive Summary

- **Status**: [Completed/Partially Completed/Cancelled]
- **Timeline**: [Planned] vs [Actual] 
- **Scope**: [Original scope vs delivered scope]
- **Key Outcomes**: [Primary achievements and deliverables]

## Project Overview

### Original Scope
[From archived epic]

### Final Deliverables
[What was actually delivered]

### Timeline Analysis
- **Start Date**: 
- **Target Date**: 
- **Completion Date**: 
- **Duration**: [Planned vs Actual]

## Development Timeline

### Key Milestones
[From git commit analysis]

### Major Decision Points
[Technical decisions and their context]

## Technical Insights

### Architecture Decisions
[Key technical choices and rationale]

### Implementation Challenges
[Problems encountered and solutions]

### Quality Metrics
- Test Coverage: 
- Performance Impact:
- Security Considerations:

## Process Analysis

### Development Workflow
[Effectiveness of process used]

### Team Collaboration
[From PR reviews and discussions]

### Tool Effectiveness
[CLI tools, automation, quality gates]

## Lessons Learned

### What Went Well
[Successful practices and decisions]

### What Could Be Improved
[Specific improvement opportunities]

### Technical Learnings
[New knowledge gained]

## Metrics and Performance

### Development Metrics
- Commit Frequency:
- Code Churn:
- Review Cycle Time:

### Quality Metrics
[From CI/CD and testing data]

## Recommendations

### Process Improvements
[Prioritized recommendations]

### Technical Improvements
[Architecture and implementation suggestions]

### Tool and Automation
[Workflow enhancement opportunities]

---

*Generated by Hydra Recap Protocol on {{recap_date}}*
```

---

## WORKFLOW EXECUTION INSTRUCTIONS

### Execution Protocol

1. **DISCOVER**: Locate archived epic and related documentation
2. **ANALYZE**: Extract git history and development timeline
3. **INTEGRATE**: Gather GitHub PR and review data
4. **SYNTHESIZE**: Compare planned vs actual outcomes
5. **GENERATE**: Create comprehensive recap document

### Data Collection Strategy

- **Primary Sources**: Archived epic, git log, GitHub API
- **Fallback Sources**: File system search, expanded git history
- **Quality Gates**: Validate data completeness at each phase

### Template Variable Substitution

- `{{session_id}}`: Unique recap session ID
- `{{recap_objective}}`: Purpose of the recap analysis
- `{{feature_name}}`: Feature identifier from epic
- `{{recap_date}}`: YYYY-MM-DD format date
- `{{github_pr_url}}`: Pull request URL if available
- `{{completion_date}}`: Project completion date
- `{{start_date}}`: Project start date (calculated)

### Critical Success Factors

- **Comprehensive Data Gathering**: Collect from all available sources
- **Objective Analysis**: Focus on facts and measurable outcomes
- **Actionable Insights**: Provide specific, implementable recommendations
- **Quality Documentation**: Create valuable reference for future projects

---

**REMEMBER**: This recap serves as organizational memory and process improvement input. Focus on extracting actionable insights that will improve future development workflows.