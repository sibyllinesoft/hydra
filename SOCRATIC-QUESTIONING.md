# SOCRATIC-QUESTIONING.md - Requirement Clarification Framework

**Purpose**: Systematic approach for Claude to clarify user requirements through structured Socratic questioning before implementation

## 🎯 DECISION TREE: When to Apply Socratic Questioning

### AUTOMATIC TRIGGERS (Always Question)
```yaml
mandatory_questioning:
  ambiguous_requirements:
    - "Build me an app" (no specifics)
    - "Fix this" (unclear scope)
    - "Make it better" (undefined criteria)
    - "Add a feature" (no details)
  
  high_complexity_indicators:
    - Multiple domains involved (frontend + backend + database)
    - Performance/security requirements mentioned
    - Integration with external systems
    - User mentions "production" or "enterprise"
  
  risk_indicators:
    - Data handling mentioned
    - Authentication/authorization needed
    - Third-party API integrations
    - Deployment/infrastructure concerns
```

### CONDITIONAL TRIGGERS (Assess Need)
```yaml
assess_for_questioning:
  medium_complexity:
    - Single domain but multiple components
    - Framework/library choices needed
    - Testing strategy unclear
    - Documentation requirements unspecified
  
  context_gaps:
    - Missing technical constraints
    - Undefined success criteria
    - Unclear user personas/use cases
    - No mention of existing codebase patterns
```

### SKIP QUESTIONING (Proceed Directly)
```yaml
skip_questioning:
  clear_simple_tasks:
    - "Fix typo in line 42"
    - "Add console.log to debug function X"
    - "Update dependency version"
    - "Create basic README template"
  
  well_defined_requests:
    - Complete specifications provided
    - All technical details clear
    - Success criteria explicitly stated
    - No risk/complexity indicators
```

## 🗂️ QUESTION CATEGORIES & TEMPLATES

### 1. PROBLEM DEFINITION & SCOPE

**Clarify the Core Problem:**
- "What specific problem are you trying to solve?"
- "Who is experiencing this problem and in what context?"
- "What happens currently when users try to [achieve goal]?"
- "What would success look like from the user's perspective?"

**Define Boundaries:**
- "What's included in this scope vs. what's for later phases?"
- "Are there any existing systems this needs to integrate with?"
- "What parts of the current system should remain unchanged?"
- "Are there any constraints from business requirements or policies?"

**Understand Motivation:**
- "What's driving the need for this solution now?"
- "How does this relate to your broader goals?"
- "What happens if this isn't implemented?"

### 2. SUCCESS CRITERIA & ACCEPTANCE TESTS

**Measurable Outcomes:**
- "How will you know when this is working correctly?"
- "What specific behaviors should users see?"
- "Are there any performance benchmarks it needs to meet?"
- "What would make you consider this implementation a failure?"

**Validation Methods:**
- "How would you like to test this before it goes live?"
- "Who needs to approve or validate the implementation?"
- "Are there specific scenarios or edge cases I should test?"
- "What data/metrics would help you evaluate success?"

**User Experience:**
- "What should the user journey look like step-by-step?"
- "How should errors or edge cases be handled from a user perspective?"
- "Are there accessibility or usability requirements?"

### 3. TECHNICAL CONSTRAINTS & PREFERENCES

**Technology Stack:**
- "Are there specific technologies, frameworks, or libraries you prefer?"
- "What's your current tech stack that this needs to work with?"
- "Are there any technologies you want to avoid?"
- "Do you have preferences for package managers, build tools, or deployment methods?"

**Infrastructure & Environment:**
- "Where will this be deployed (cloud provider, on-premise, etc.)?"
- "What's your development environment setup?"
- "Are there existing CI/CD pipelines this needs to fit into?"
- "What are your hosting/infrastructure constraints?"

**Compatibility:**
- "What browsers/devices/platforms need to be supported?"
- "Are there backward compatibility requirements?"
- "Do you have existing APIs or data formats this needs to work with?"

### 4. QUALITY REQUIREMENTS

**Performance:**
- "What response time or throughput requirements do you have?"
- "How many concurrent users should this handle?"
- "Are there any resource constraints (memory, CPU, bandwidth)?"
- "Do you have existing performance benchmarks to meet or exceed?"

**Security:**
- "What sensitive data does this handle?"
- "Are there authentication/authorization requirements?"
- "Do you need to comply with specific security standards (GDPR, HIPAA, etc.)?"
- "What's your risk tolerance for security vulnerabilities?"

**Reliability & Maintainability:**
- "What uptime/availability requirements do you have?"
- "How critical is this system to your operations?"
- "Who will be maintaining this code going forward?"
- "Do you have preferences for code style, documentation, or architecture patterns?"

### 5. TESTING & VALIDATION EXPECTATIONS

**Testing Strategy:**
- "What level of test coverage are you looking for?"
- "Do you prefer unit tests, integration tests, or end-to-end tests?"
- "Are there specific testing frameworks you use?"
- "How do you currently handle testing in your workflow?"

**Quality Assurance:**
- "Do you have code review processes I should follow?"
- "Are there linting or formatting standards to maintain?"
- "How do you typically validate new features before release?"
- "Do you need help setting up testing infrastructure?"

**Deployment Validation:**
- "How do you typically deploy and validate changes?"
- "Do you have staging environments for testing?"
- "Are there rollback procedures I should consider?"
- "Do you need monitoring or logging for the new implementation?"

### 6. DOCUMENTATION & COMMUNICATION NEEDS

**Documentation Requirements:**
- "What level of documentation do you need (API docs, user guides, technical specs)?"
- "Who will be reading this documentation?"
- "Do you have existing documentation standards or templates?"
- "Should I include setup/installation instructions?"

**Knowledge Transfer:**
- "Will you need to explain this implementation to others on your team?"
- "Are there specific technical concepts I should explain in detail?"
- "Do you want code comments focusing on any particular aspects?"
- "Should I provide examples or usage patterns?"

**Communication Preferences:**
- "How would you like me to present the solution (step-by-step, all at once, etc.)?"
- "Do you want to review the approach before I start implementation?"
- "Should I explain my technical decisions as I go?"
- "Are there any progress checkpoints you'd like during implementation?"

## 🔄 PROGRESSIVE QUESTIONING TECHNIQUES

### SURFACE LEVEL → DEEPER REQUIREMENTS

**Layer 1: Basic Understanding**
1. What needs to be built/fixed?
2. Who will use it?
3. What's the expected outcome?

**Layer 2: Context & Constraints**
1. What's the current situation?
2. What are the technical limitations?
3. What are the success criteria?

**Layer 3: Implementation Details**
1. How should edge cases be handled?
2. What are the performance requirements?
3. How will this be maintained long-term?

**Layer 4: Risk & Quality**
1. What could go wrong?
2. How will you validate it's working?
3. What are the security/compliance requirements?

### QUESTIONING FLOW PATTERNS

**The Funnel Approach:**
```
Broad → Specific → Implementation Details
- Start with high-level goals
- Narrow to specific requirements  
- Drill down to technical specs
```

**The Validation Loop:**
```
Assumption → Question → Clarification → Confirmation
- State what you understand
- Ask if that's correct
- Get clarification on gaps
- Confirm before proceeding
```

**The Risk Assessment:**
```
Happy Path → Edge Cases → Failure Modes → Recovery
- What should work normally?
- What could go wrong?
- How should failures be handled?
- What are the backup plans?
```

## 📋 PRACTICAL APPLICATION TEMPLATES

### QUICK CLARIFICATION (Simple Tasks)
```
"Before I implement this, let me confirm:
1. [Restate the requirement in my words]
2. [Ask about 1-2 key uncertainties]
3. [Confirm success criteria]
Shall I proceed with this understanding?"
```

### STANDARD CLARIFICATION (Medium Complexity)
```
"To make sure I build exactly what you need:

**Problem & Scope:**
- [Key questions about the problem]

**Technical Approach:**
- [Questions about constraints/preferences]

**Success Criteria:**
- [Questions about validation/acceptance]

Which of these would you like to clarify first?"
```

### COMPREHENSIVE CLARIFICATION (High Complexity)
```
"This looks like a substantial implementation. Let me ask some strategic questions to ensure we build the right solution:

**Business Context:**
- [Problem definition questions]

**Technical Architecture:**  
- [Infrastructure/technology questions]

**Quality & Risk:**
- [Performance/security/reliability questions]

**Implementation Plan:**
- [Approach/timeline/validation questions]

Should we work through these systematically or focus on specific areas first?"
```

## 🎯 EFFECTIVENESS GUIDELINES

### QUESTION QUALITY PRINCIPLES
- **Specific over general**: "What authentication method?" vs "Any security requirements?"
- **Open-ended for discovery**: "How do users currently..." vs "Do users need..."
- **Assumption-testing**: "I'm assuming X, is that correct?"
- **Prioritization-focused**: "What's most important: speed, security, or simplicity?"

### TIMING & FLOW
- **Front-load critical questions**: Ask about major constraints first
- **Progressive disclosure**: Don't overwhelm with all questions at once
- **Context-driven**: Ask follow-ups based on previous answers
- **Confirmation loops**: Summarize understanding before proceeding

### STOP CONDITIONS
- **Sufficient clarity achieved**: All major risks and requirements identified
- **Diminishing returns**: Additional questions won't significantly improve outcome
- **User signals readiness**: "I think you have enough to start" or similar
- **Simple task confirmed**: Low complexity, low risk, clear requirements

## 🚀 IMPLEMENTATION CHECKLIST

**Before Starting Any Implementation:**
- [ ] Applied decision tree to determine questioning need
- [ ] Identified category of questions most relevant
- [ ] Asked 2-5 clarifying questions (unless skipping per decision tree)
- [ ] Received answers that address major uncertainties
- [ ] Confirmed understanding with user
- [ ] Documented any remaining assumptions

**During Implementation:**
- [ ] Refer back to clarified requirements when making decisions
- [ ] Highlight when implementation choices relate to clarified requirements
- [ ] Flag any new uncertainties that arise during implementation

**After Implementation:**
- [ ] Validate against original clarified requirements
- [ ] Note any requirements that evolved during implementation
- [ ] Suggest follow-up questions for future similar tasks

---

**Remember**: The goal is not to ask every possible question, but to ask the *right* questions that prevent the most common implementation mismatches and reduce the need for significant rework.