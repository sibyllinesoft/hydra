# SOCRATIC-QUESTIONING.md - Requirement Clarification Framework

**Purpose**  
Systematic approach for Claude to clarify user requirements through structured Socratic questioning before implementation. Guidance ensures ambiguity, complexity, or risk triggers clarification rather than blind execution.

---

## 🎯 Decision Tree: When to Apply Socratic Questioning
*The framework specifies automatic triggers, conditional assessments, and skip conditions. Claude uses this to decide whether to ask clarifying questions or proceed directly.*

```xml
<decisionTree>
  <mandatoryQuestioning>
    <ambiguousRequirement>Build me an app</ambiguousRequirement>
    <ambiguousRequirement>Fix this</ambiguousRequirement>
    <ambiguousRequirement>Make it better</ambiguousRequirement>
    <ambiguousRequirement>Add a feature</ambiguousRequirement>

    <highComplexity>
      <indicator>Multiple domains involved</indicator>
      <indicator>Performance/security requirements mentioned</indicator>
      <indicator>Integration with external systems</indicator>
      <indicator>User mentions production or enterprise</indicator>
    </highComplexity>

    <riskIndicators>
      <indicator>Data handling</indicator>
      <indicator>Authentication/authorization</indicator>
      <indicator>Third-party API integrations</indicator>
      <indicator>Deployment/infrastructure concerns</indicator>
    </riskIndicators>
  </mandatoryQuestioning>

  <conditionalQuestioning>
    <mediumComplexity>
      <indicator>Single domain with multiple components</indicator>
      <indicator>Framework/library choices needed</indicator>
      <indicator>Unclear testing strategy</indicator>
      <indicator>Documentation unspecified</indicator>
    </mediumComplexity>
    <contextGaps>
      <indicator>Missing technical constraints</indicator>
      <indicator>Undefined success criteria</indicator>
      <indicator>Unclear personas/use cases</indicator>
      <indicator>No mention of codebase patterns</indicator>
    </contextGaps>
  </conditionalQuestioning>

  <skipQuestioning>
    <clearSimpleTask>Fix typo in line 42</clearSimpleTask>
    <clearSimpleTask>Add console.log to debug function X</clearSimpleTask>
    <clearSimpleTask>Update dependency version</clearSimpleTask>
    <clearSimpleTask>Create basic README template</clearSimpleTask>
    <wellDefinedRequest>Complete specifications provided</wellDefinedRequest>
    <wellDefinedRequest>All technical details clear</wellDefinedRequest>
    <wellDefinedRequest>Explicit success criteria</wellDefinedRequest>
  </skipQuestioning>
</decisionTree>
```

---

## 🗂️ Question Categories & Templates
*Claude categorizes clarifying questions into six domains. Each contains guiding prompts that reduce ambiguity and align expectations.*

```xml
<questionCategories>
  <category id="problem-scope">
    <clarify>What specific problem are you trying to solve?</clarify>
    <clarify>Who experiences this problem and in what context?</clarify>
    <clarify>What happens currently when users try to achieve the goal?</clarify>
    <clarify>What would success look like from the user's perspective?</clarify>
    <boundary>What's included vs deferred to later phases?</boundary>
    <boundary>Systems it must integrate with?</boundary>
    <motivation>What's driving the need now?</motivation>
  </category>

  <category id="success-criteria">
    <clarify>How will you know when this is working?</clarify>
    <clarify>What user behaviors should be observed?</clarify>
    <criterion>Performance benchmarks?</criterion>
    <criterion>Failure conditions?</criterion>
    <validation>How to test before go-live?</validation>
    <ux>What should error handling look like?</ux>
    <ux>Accessibility/usability requirements?</ux>
  </category>

  <category id="technical-constraints">
    <stack>Preferred frameworks or libraries?</stack>
    <stack>Existing tech stack?</stack>
    <stack>Technologies to avoid?</stack>
    <infra>Deployment environment?</infra>
    <infra>CI/CD pipelines?</infra>
    <compatibility>Browsers/devices/platforms required?</compatibility>
  </category>

  <category id="quality-requirements">
    <performance>Response time / throughput requirements?</performance>
    <performance>Concurrent users expected?</performance>
    <security>Authentication/authorization needed?</security>
    <security>Standards to comply with (GDPR, HIPAA)?</security>
    <reliability>Uptime requirements?</reliability>
    <maintainability>Who maintains this code?</maintainability>
  </category>

  <category id="testing-validation">
    <testing>Preferred coverage levels?</testing>
    <testing>Unit vs integration vs end-to-end?</testing>
    <qa>Code review standards?</qa>
    <qa>Linting/formatting rules?</qa>
    <deployment>Staging environment?</deployment>
    <deployment>Rollback procedures?</deployment>
  </category>

  <category id="documentation-communication">
    <documentation>What level of documentation?</documentation>
    <documentation>Who is the target audience?</documentation>
    <knowledgeTransfer>Need to explain to team?</knowledgeTransfer>
    <communication>Preferred communication format?</communication>
    <communication>Progress checkpoints required?</communication>
  </category>
</questionCategories>
```

---

## 🔄 Progressive Questioning Techniques
*Claude asks progressively deeper questions, moving from broad context to risk evaluation, following structured patterns.*

```xml
<progressiveTechniques>
  <layer id="basic">
    <q>What needs to be built/fixed?</q>
    <q>Who will use it?</q>
    <q>What's the expected outcome?</q>
  </layer>
  <layer id="context">
    <q>What's the current situation?</q>
    <q>Technical limitations?</q>
    <q>Success criteria?</q>
  </layer>
  <layer id="implementation">
    <q>How should edge cases be handled?</q>
    <q>Performance requirements?</q>
    <q>Maintenance expectations?</q>
  </layer>
  <layer id="risk-quality">
    <q>What could go wrong?</q>
    <q>How to validate it's working?</q>
    <q>Security/compliance requirements?</q>
  </layer>

  <flowPattern id="funnel">
    <step>Broad → Specific → Implementation</step>
  </flowPattern>
  <flowPattern id="validation-loop">
    <step>Assumption → Question → Clarification → Confirmation</step>
  </flowPattern>
  <flowPattern id="risk-assessment">
    <step>Happy Path → Edge Cases → Failure Modes → Recovery</step>
  </flowPattern>
</progressiveTechniques>
```

---

## 📋 Practical Application Templates
*Templates standardize the style of questioning by complexity level. Quick clarifications are light, comprehensive ones involve business context, technical architecture, and risk.*

```xml
<templates>
  <template id="quick-clarification">
    <step>Restate requirement</step>
    <step>Ask 1-2 uncertainties</step>
    <step>Confirm success criteria</step>
  </template>

  <template id="standard-clarification">
    <section>Problem & Scope</section>
    <section>Technical Approach</section>
    <section>Success Criteria</section>
  </template>

  <template id="comprehensive-clarification">
    <section>Business Context</section>
    <section>Technical Architecture</section>
    <section>Quality & Risk</section>
    <section>Implementation Plan</section>
  </template>
</templates>
```

---

## 🎯 Effectiveness Guidelines
*Claude maximizes effectiveness by following question quality principles, timing and flow rules, and defined stop conditions.*

```xml
<guidelines>
  <qualityPrinciples>
    <principle>Specific over general</principle>
    <principle>Open-ended discovery</principle>
    <principle>Assumption-testing</principle>
    <principle>Prioritization-focused</principle>
  </qualityPrinciples>

  <timingFlow>
    <rule>Front-load critical questions</rule>
    <rule>Progressive disclosure</rule>
    <rule>Context-driven follow-ups</rule>
    <rule>Confirmation loops</rule>
  </timingFlow>

  <stopConditions>
    <condition>Sufficient clarity achieved</condition>
    <condition>Diminishing returns</condition>
    <condition>User signals readiness</condition>
    <condition>Simple low-risk task</condition>
  </stopConditions>
</guidelines>
```

---

## 🚀 Implementation Checklist
*Checklist ensures Socratic questioning is applied consistently across tasks and phases.*

```xml
<checklist>
  <phase id="before">
    <item>Apply decision tree</item>
    <item>Identify question category</item>
    <item>Ask 2–5 clarifications</item>
    <item>Confirm understanding</item>
    <item>Document assumptions</item>
  </phase>
  <phase id="during">
    <item>Refer back to clarified requirements</item>
    <item>Highlight links to decisions</item>
    <item>Flag new uncertainties</item>
  </phase>
  <phase id="after">
    <item>Validate against clarified requirements</item>
    <item>Note evolved requirements</item>
    <item>Suggest future follow-ups</item>
  </phase>
</checklist>
```

---

**Remember**  
The goal is not to ask every possible question, but to ask the *right* questions that prevent mismatches, reduce rework, and anchor Claude’s responses in clarified requirements.
