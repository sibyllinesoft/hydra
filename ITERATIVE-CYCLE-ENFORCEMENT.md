# ITERATIVE-CYCLE-ENFORCEMENT.md
## Mandatory Completion Patterns for All Iterative Agents

**Core Principle**: "NO PARTIAL CYCLES - COMPLETE THE LOOP OR DECLARE FAILURE"

---

## 🔒 MANDATORY CYCLE COMPLETION LANGUAGE TEMPLATES

### Universal Enforcement Commands
```yaml
CYCLE_START_TEMPLATES:
  - "MANDATORY COMPLETE CYCLE - DO NOT STOP UNTIL [SUCCESS_CONDITION] IS VERIFIED"
  - "MUST execute full [CYCLE_NAME] cycle: [STEP1]→[STEP2]→[STEP3]→VERIFY"
  - "CYCLE INCOMPLETE until [EXTERNAL_VERIFICATION] confirms success"
  - "MUST NOT declare success without [ACTUAL_MEASUREMENT] showing improvement"

PARTIAL_STOP_PREVENTION:
  - "MUST NOT stop after [PARTIAL_STEP] - the cycle is incomplete without [REMAINING_STEPS]"
  - "Analysis/Planning phase complete but ACTION PHASE MANDATORY"
  - "Code changes made but VERIFICATION PHASE MANDATORY"
  - "Local fixes applied but DEPLOYMENT/TESTING PHASE MANDATORY"

VERIFICATION_ENFORCEMENT:
  - "MUST continue iterating until [ACTUAL_VERIFICATION] shows SUCCESS"
  - "MUST [ACTION] for actual [RESULT] completion before declaring success"
  - "MUST wait for [EXTERNAL_PROCESS] completion and verify [SUCCESS_METRIC]"
  - "MUST capture [EVIDENCE_TYPE] showing real improvement"

ITERATION_REQUIREMENTS:
  - "IF first iteration fails verification: MUST iterate with new approach"
  - "IF partial success detected: MUST continue until full success criteria met"
  - "IF external process pending: MUST wait and verify completion"
  - "Maximum [N] iterations before escalating or declaring systematic failure"
```

---

## 🎯 CYCLE ENFORCEMENT PATTERNS BY AGENT TYPE

### 🚀 DevOps/Infrastructure Agents

**MANDATORY CYCLE**: `analyze→fix→commit→push→wait→verify→iterate`

```yaml
devops_enforcement:
  cycle_template: |
    MANDATORY DEVOPS CYCLE - DO NOT STOP UNTIL DEPLOYMENT VERIFIED
    
    MUST execute: analyze→fix→commit→push→wait→verify
    MUST NOT stop after local fixes without deployment verification
    MUST wait for actual build/deployment completion
    MUST check new logs/status after each push
    MUST verify system health metrics post-deployment
    
  verification_requirements:
    - "MUST wait minimum [X] minutes for deployment propagation"
    - "MUST check actual deployment logs for success/failure"
    - "MUST verify service health endpoints respond correctly"
    - "MUST validate configuration changes took effect"
    
  anti_patterns_prevented:
    - "Stopping after git push without deployment verification"
    - "Assuming deployment success without log confirmation"
    - "Skipping health check validation"
    - "Not waiting for propagation delays"
    
  iteration_logic: |
    IF deployment fails: analyze logs→fix issues→commit→push→wait→verify
    IF partial deployment: investigate→complete→verify
    IF health checks fail: rollback→fix→redeploy→verify
```

### 🎨 UI/Design Agents

**MANDATORY CYCLE**: `design→screenshot→analyze→improve→re-screenshot→verify`

```yaml
ui_design_enforcement:
  cycle_template: |
    MANDATORY UI IMPROVEMENT CYCLE - DO NOT STOP UNTIL VISUAL VERIFICATION
    
    MUST execute: design→screenshot→analyze→improve→re-screenshot→verify
    MUST take actual screenshots after each change
    MUST verify visual improvements through new captures
    MUST NOT stop after making changes without visual confirmation
    
  verification_requirements:
    - "MUST capture fresh screenshots after every UI change"
    - "MUST compare before/after visuals for improvement validation"
    - "MUST verify responsive behavior across viewport sizes"
    - "MUST validate accessibility improvements with actual tools"
    
  anti_patterns_prevented:
    - "Making UI changes without visual verification"
    - "Assuming improvements without screenshot comparison"
    - "Stopping after CSS changes without rendering validation"
    - "Skipping cross-device/browser verification"
    
  iteration_logic: |
    IF visual improvement insufficient: refine design→re-screenshot→verify
    IF accessibility issues detected: fix→validate→re-screenshot
    IF responsive issues found: adjust→test viewports→verify
```

### ⚡ Performance Agents

**MANDATORY CYCLE**: `profile→optimize→deploy→re-profile→verify→iterate`

```yaml
performance_enforcement:
  cycle_template: |
    MANDATORY PERFORMANCE CYCLE - DO NOT STOP UNTIL METRICS IMPROVED
    
    MUST execute: profile→optimize→deploy→re-profile→verify
    MUST run actual performance tests after changes
    MUST verify real performance improvements with measurements
    MUST NOT stop after code changes without performance validation
    
  verification_requirements:
    - "MUST run baseline performance tests before optimization"
    - "MUST deploy optimizations to testing environment"
    - "MUST re-run identical performance tests post-deployment"
    - "MUST document quantitative improvement metrics"
    
  anti_patterns_prevented:
    - "Optimizing code without measuring actual impact"
    - "Stopping after code changes without performance testing"
    - "Assuming improvements without comparative metrics"
    - "Skipping deployment verification of optimizations"
    
  iteration_logic: |
    IF performance gains insufficient: analyze bottlenecks→optimize→re-test
    IF new bottlenecks introduced: address→re-profile→verify
    IF improvements inconsistent: investigate→stabilize→verify
```

### 🧪 Testing Agents

**MANDATORY CYCLE**: `create→run→analyze→fix→re-run→verify→iterate`

```yaml
testing_enforcement:
  cycle_template: |
    MANDATORY TESTING CYCLE - DO NOT STOP UNTIL TESTS PASS CONSISTENTLY
    
    MUST execute: create→run→analyze→fix→re-run→verify
    MUST execute actual tests after each fix
    MUST verify test pass rates and stability
    MUST NOT stop after test fixes without execution validation
    
  verification_requirements:
    - "MUST run tests multiple times to verify stability"
    - "MUST validate test coverage improvements"
    - "MUST verify flaky test elimination"
    - "MUST confirm CI/CD pipeline integration"
    
  anti_patterns_prevented:
    - "Writing tests without running them"
    - "Fixing tests without re-execution verification"
    - "Assuming test stability without multiple runs"
    - "Stopping after local test success without CI verification"
    
  iteration_logic: |
    IF tests fail: analyze→fix→re-run→verify
    IF tests flaky: stabilize→run multiple times→verify consistency
    IF coverage insufficient: expand tests→run→verify coverage metrics
```

### ✍️ Content/Writing Agents

**MANDATORY CYCLE**: `write→review→edit→re-review→verify→iterate`

```yaml
content_enforcement:
  cycle_template: |
    MANDATORY CONTENT IMPROVEMENT CYCLE - DO NOT STOP UNTIL QUALITY VERIFIED
    
    MUST execute: write→review→edit→re-review→verify
    MUST validate readability and quality metrics
    MUST verify content improvements through analysis
    MUST NOT stop after edits without quality verification
    
  verification_requirements:
    - "MUST run readability analysis tools on final content"
    - "MUST verify grammar/style improvements with tools"
    - "MUST validate content structure and flow"
    - "MUST confirm target audience alignment"
    
  anti_patterns_prevented:
    - "Editing content without quality measurement"
    - "Stopping after subjective review without objective metrics"
    - "Assuming improvements without readability validation"
    - "Skipping audience-appropriate language verification"
    
  iteration_logic: |
    IF readability scores poor: simplify→re-analyze→verify
    IF structure unclear: reorganize→review→verify flow
    IF audience mismatch: adjust tone→validate→verify alignment
```

---

## 🛡️ IMPLEMENTATION REQUIREMENTS

### Mandatory Progress Logging
```yaml
progress_tracking:
  cycle_start: "🔄 STARTING [CYCLE_NAME] - Target: [SUCCESS_CONDITION]"
  step_completion: "✅ [STEP_NAME] complete - Next: [NEXT_STEP]"
  verification_start: "🔍 VERIFICATION PHASE - Measuring [METRIC]"
  verification_result: "📊 VERIFICATION: [PASS/FAIL] - [MEASUREMENT]"
  iteration_trigger: "🔁 ITERATION REQUIRED - [REASON] - Continuing cycle"
  cycle_completion: "🎯 CYCLE COMPLETE - [SUCCESS_CONDITION] ACHIEVED"
  
logging_requirements:
  - Log every cycle step with timestamp
  - Document verification attempts and results
  - Track iteration count and reasons
  - Record external process wait times
  - Capture success/failure evidence
```

### Verification Steps with External Validation
```yaml
external_validation_types:
  deployment_verification:
    - Service health endpoints respond
    - Logs show successful startup
    - Configuration changes active
    - Performance metrics stable
    
  visual_verification:
    - Screenshots capture actual changes
    - Cross-browser rendering confirmed
    - Responsive behavior validated
    - Accessibility tools pass
    
  performance_verification:
    - Benchmark tests executed
    - Metrics show quantitative improvement
    - No performance regressions detected
    - Resource usage within limits
    
  test_verification:
    - Tests execute without errors
    - Pass rate meets requirements
    - No flaky test behavior
    - CI/CD integration successful
    
  content_verification:
    - Readability metrics improved
    - Grammar/style tools pass
    - Target audience alignment confirmed
    - Content structure validated
```

### Clear Success Conditions
```yaml
success_condition_templates:
  quantitative_metrics:
    - "Performance improvement ≥[X]% verified"
    - "Test pass rate ≥[Y]% sustained over [Z] runs"
    - "Readability score ≥[SCORE] achieved"
    - "Deployment success rate ≥[%] maintained"
    
  qualitative_verification:
    - "Visual improvements confirmed via screenshot comparison"
    - "User experience enhanced based on [CRITERIA]"
    - "Code quality improved per [STANDARDS]"
    - "Content clarity enhanced for [AUDIENCE]"
    
  external_confirmation:
    - "Service responds to health checks"
    - "CI/CD pipeline passes all stages"
    - "Automated tests execute successfully"
    - "Quality tools report improvements"
```

### Mandatory Waiting Periods
```yaml
wait_period_requirements:
  deployment_propagation:
    minimum_wait: "5 minutes for service restart"
    verification_delay: "2 minutes for health check stability"
    monitoring_period: "10 minutes for error detection"
    
  build_processes:
    ci_pipeline: "Wait for complete pipeline execution"
    asset_generation: "Wait for build artifact creation"
    cache_invalidation: "Wait for cache refresh completion"
    
  external_services:
    api_rate_limits: "Respect rate limiting between verification attempts"
    third_party_webhooks: "Wait for webhook delivery confirmation"
    cdn_propagation: "Wait for global CDN distribution"
```

---

## 🚫 COMMON ANTI-PATTERNS TO PREVENT

### Problem Analysis Without Action
```yaml
analysis_paralysis_prevention:
  forbidden_patterns:
    - "Detailed problem analysis followed by no implementation"
    - "Multiple solution options presented without execution"
    - "Root cause identified but fixes not applied"
    
  enforcement_language:
    - "Analysis complete - MANDATORY ACTION PHASE beginning"
    - "MUST implement [SOLUTION] before cycle completion"
    - "Problem identified - MUST NOT stop without resolution attempt"
```

### Fixes Without Testing/Verification
```yaml
fix_without_validation_prevention:
  forbidden_patterns:
    - "Code changes made without execution testing"
    - "Configuration updated without restart verification"
    - "Optimization applied without performance measurement"
    
  enforcement_language:
    - "Fixes applied - MANDATORY VERIFICATION PHASE required"
    - "MUST test changes before declaring success"
    - "Implementation complete - MUST verify actual improvement"
```

### Success Declaration Without External Confirmation
```yaml
premature_success_prevention:
  forbidden_patterns:
    - "Declaring success based on code changes alone"
    - "Assuming deployment success without confirmation"
    - "Claiming improvement without measurement"
    
  enforcement_language:
    - "Local changes complete - MUST verify external impact"
    - "CANNOT declare success without [EXTERNAL_CONFIRMATION]"
    - "Implementation phase done - MUST complete verification phase"
```

### Skipping Wait Periods for External Processes
```yaml
wait_period_enforcement:
  forbidden_patterns:
    - "Checking deployment status immediately after push"
    - "Testing changes before propagation completion"
    - "Verifying improvements before processing completion"
    
  enforcement_language:
    - "MUST wait [TIME] for [PROCESS] completion before verification"
    - "External process initiated - MANDATORY wait period required"
    - "CANNOT verify until [EXTERNAL_PROCESS] has sufficient time"
```

---

## 🔄 CYCLE COMPLETION VALIDATION

### Final Verification Checklist
```yaml
completion_requirements:
  all_steps_executed: "Every cycle step documented and completed"
  external_verification: "Independent confirmation of success obtained"
  metrics_improved: "Quantitative or qualitative improvement demonstrated"
  stability_confirmed: "Changes remain stable over monitoring period"
  documentation_updated: "Cycle execution and results documented"
  
failure_escalation:
  max_iterations: "After [N] iterations, escalate to human or supervisor agent"
  systematic_failure: "If fundamental approach fails, declare systematic issue"
  resource_constraints: "If external dependencies block completion, document constraints"
  timeout_conditions: "If cycle exceeds [TIME] limit, summarize progress and escalate"
```

### Success Declaration Template
```yaml
success_template: |
  🎯 ITERATIVE CYCLE COMPLETION REPORT
  
  Cycle Type: [CYCLE_NAME]
  Target: [SUCCESS_CONDITION]
  
  Execution Summary:
  - Steps Completed: [STEP1] ✅ [STEP2] ✅ [STEP3] ✅ [VERIFICATION] ✅
  - Iterations Required: [N]
  - Total Duration: [TIME]
  
  Verification Evidence:
  - [VERIFICATION_TYPE]: [RESULT]
  - [METRIC]: [MEASUREMENT]
  - [EXTERNAL_CONFIRMATION]: [STATUS]
  
  Success Criteria Met: ✅
  Cycle Status: COMPLETE
  
  Next Actions: [MAINTENANCE/MONITORING/HANDOFF]
```

---

**ENFORCEMENT DIRECTIVE**: All iterative agents MUST adopt these patterns. No partial cycles permitted. Complete the loop or declare systematic failure.