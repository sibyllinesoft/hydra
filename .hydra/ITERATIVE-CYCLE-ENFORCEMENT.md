# ITERATIVE-CYCLE-ENFORCEMENT.md (XML-Enhanced)

**Purpose**: To provide a strict, machine-readable enforcement framework for all iterative agents, ensuring that every operational cycle is fully completed and verified.

**Core Principle**: "NO PARTIAL CYCLES - COMPLETE THE LOOP OR DECLARE FAILURE"

```xml
<corePrinciple directive="NO PARTIAL CYCLES - COMPLETE THE LOOP OR DECLARE FAILURE" />
```

---

## 🔒 MANDATORY CYCLE COMPLETION LANGUAGE TEMPLATES

These are universal command templates that can be used to instruct and constrain agent behavior, ensuring adherence to the core principle.

```xml
<cycleLanguageTemplates>
  <category name="CycleStart">
    <template>MANDATORY COMPLETE CYCLE - DO NOT STOP UNTIL [SUCCESS_CONDITION] IS VERIFIED</template>
    <template>MUST execute full [CYCLE_NAME] cycle: [STEP1]→[STEP2]→VERIFY</template>
    <template>CYCLE INCOMPLETE until [EXTERNAL_VERIFICATION] confirms success</template>
  </category>
  <category name="PartialStopPrevention">
    <template>MUST NOT stop after [PARTIAL_STEP] - the cycle is incomplete without [REMAINING_STEPS]</template>
    <template>Analysis/Planning phase complete but ACTION PHASE MANDATORY</template>
    <template>Code changes made but VERIFICATION PHASE MANDATORY</template>
  </category>
  <category name="VerificationEnforcement">
    <template>MUST continue iterating until [ACTUAL_VERIFICATION] shows SUCCESS</template>
    <template>MUST wait for [EXTERNAL_PROCESS] completion and verify [SUCCESS_METRIC]</template>
    <template>MUST capture [EVIDENCE_TYPE] showing real improvement before declaring success</template>
  </category>
  <category name="IterationRequirements">
    <template>IF first iteration fails verification: MUST iterate with a new approach</template>
    <template>Maximum [N] iterations before escalating or declaring systematic failure</template>
  </category>
</cycleLanguageTemplates>
```

---

## 🎯 CYCLE ENFORCEMENT PATTERNS BY AGENT TYPE

Each agent type has a non-negotiable iterative cycle defined below. The XML provides the precise sequence and verification steps for automated enforcement.

### 🚀 DevOps/Infrastructure Agents

This agent's work is not done until the deployment is live and verified as healthy.

```xml
<agentCycleEnforcement type="DevOps/Infrastructure">
  <mandatoryCycle sequence="analyze→fix→commit→push→wait→verify→iterate" />
  <verificationRequirements>
    <requirement>MUST wait a minimum of [X] minutes for deployment propagation.</requirement>
    <requirement>MUST check actual deployment logs for success or failure messages.</requirement>
    <requirement>MUST verify that service health endpoints respond with a success status code.</requirement>
    <requirement>MUST validate that configuration changes have taken effect in the live environment.</requirement>
  </verificationRequirements>
  <preventAntiPatterns>
    <antiPattern>Stopping after 'git push' without deployment verification.</antiPattern>
    <antiPattern>Assuming deployment success without log confirmation.</antiPattern>
    <antiPattern>Skipping health check validation.</antiPattern>
  </preventAntiPatterns>
  <iterationLogic>
    <rule condition="deployment fails" action="analyze logs→fix issues→commit→push→wait→verify" />
    <rule condition="health checks fail" action="rollback→fix→redeploy→verify" />
  </iterationLogic>
</agentCycleEnforcement>
```

### 🎨 UI/Design Agents

This agent's work is not done until a visual change is confirmed with a new screenshot.

```xml
<agentCycleEnforcement type="UI/Design">
  <mandatoryCycle sequence="design→screenshot→analyze→improve→re-screenshot→verify" />
  <verificationRequirements>
    <requirement>MUST capture a fresh screenshot after every UI change.</requirement>
    <requirement>MUST compare before and after visuals for improvement validation.</requirement>
    <requirement>MUST verify responsive behavior across all required viewport sizes.</requirement>
    <requirement>MUST validate accessibility improvements using automated tools (e.g., axe-core).</requirement>
  </verificationRequirements>
  <preventAntiPatterns>
    <antiPattern>Making UI changes without visual verification.</antiPattern>
    <antiPattern>Assuming improvements without a direct screenshot comparison.</antiPattern>
    <antiPattern>Stopping after CSS changes without validating the final render.</antiPattern>
  </preventAntiPatterns>
  <iterationLogic>
    <rule condition="visual improvement insufficient" action="refine design→re-screenshot→verify" />
    <rule condition="accessibility issues detected" action="fix→validate with tool→re-screenshot" />
  </iterationLogic>
</agentCycleEnforcement>
```

### ⚡ Performance Agents

This agent's work is not done until a performance improvement is quantitatively measured.

```xml
<agentCycleEnforcement type="Performance">
  <mandatoryCycle sequence="profile→optimize→deploy→re-profile→verify→iterate" />
  <verificationRequirements>
    <requirement>MUST run a baseline performance test before any optimization.</requirement>
    <requirement>MUST deploy optimizations to a representative testing environment.</requirement>
    <requirement>MUST re-run the identical performance test post-deployment.</requirement>
    <requirement>MUST document the quantitative improvement (e.g., latency reduction %, throughput increase %).</requirement>
  </verificationRequirements>
  <preventAntiPatterns>
    <antiPattern>Optimizing code without measuring the actual performance impact.</antiPattern>
    <antiPattern>Stopping after code changes without running performance tests.</antiPattern>
    <antiPattern>Assuming improvements without providing comparative metrics.</antiPattern>
  </preventAntiPatterns>
  <iterationLogic>
    <rule condition="performance gains insufficient" action="analyze new bottlenecks→optimize→re-test" />
    <rule condition="new bottlenecks introduced" action="address regressions→re-profile→verify" />
  </iterationLogic>
</agentCycleEnforcement>
```

### 🧪 Testing Agents

This agent's work is not done until tests are verifiably passing and stable in the target environment.

```xml
<agentCycleEnforcement type="Testing">
  <mandatoryCycle sequence="create→run→analyze→fix→re-run→verify→iterate" />
  <verificationRequirements>
    <requirement>MUST run tests multiple times (e.g., 3+) to verify stability and rule out flakiness.</requirement>
    <requirement>MUST validate that test coverage metrics have improved or met the target.</requirement>
    <requirement>MUST confirm that the tests pass within the integrated CI/CD pipeline.</requirement>
  </verificationRequirements>
  <preventAntiPatterns>
    <antiPattern>Writing tests without running them to confirm they pass.</antiPattern>
    <antiPattern>Fixing a test without re-running it multiple times to ensure stability.</antiPattern>
    <antiPattern>Stopping after local test success without CI verification.</antiPattern>
  </preventAntiPatterns>
  <iterationLogic>
    <rule condition="tests fail" action="analyze failure→fix code/test→re-run→verify" />
    <rule condition="tests are flaky" action="stabilize test→run multiple times→verify consistency" />
  </iterationLogic>
</agentCycleEnforcement>
```

---

## 🛡️ IMPLEMENTATION REQUIREMENTS

### Mandatory Progress Logging

Agents must log their progress using a structured format.

```xml
<progressLogging>
  <logEvent phase="start" template="🔄 STARTING [CYCLE_NAME] - Target: [SUCCESS_CONDITION]" />
  <logEvent phase="step" template="✅ [STEP_NAME] complete - Next: [NEXT_STEP]" />
  <logEvent phase="verification_start" template="🔍 VERIFICATION PHASE - Measuring [METRIC]" />
  <logEvent phase="verification_result" template="📊 VERIFICATION: [PASS/FAIL] - [MEASUREMENT]" />
  <logEvent phase="iteration_trigger" template="🔁 ITERATION REQUIRED - Reason: [REASON] - Continuing cycle" />
  <logEvent phase="completion" template="🎯 CYCLE COMPLETE - [SUCCESS_CONDITION] ACHIEVED" />
  <requirements>
    <requirement>Log every cycle step with a timestamp.</requirement>
    <requirement>Document all verification attempts and their quantitative results.</requirement>
    <requirement>Track the iteration count and the reason for each new iteration.</requirement>
  </requirements>
</progressLogging>
```

### Mandatory Waiting Periods

Agents must respect external process timings and not proceed prematurely.

```xml
<waitPeriodRequirements>
  <process name="DeploymentPropagation">
    <rule type="minimumWait" unit="minutes" value="5" description="For service restart and initialization." />
    <rule type="monitoringPeriod" unit="minutes" value="10" description="For error detection post-deployment." />
  </process>
  <process name="BuildPipeline">
    <rule type="awaitCompletion" description="Wait for the complete CI/CD pipeline execution." />
  </process>
  <process name="CDNPropagation">
    <rule type="awaitCompletion" description="Wait for global CDN distribution before verifying frontend changes." />
  </process>
</waitPeriodRequirements>
```

---

## 🚫 COMMON ANTI-PATTERNS TO PREVENT

These are forbidden behaviors. An agent's control logic must explicitly prevent them.

```xml
<antiPatternPrevention>
  <scenario name="AnalysisParalysis">
    <description>Problem analysis without subsequent action.</description>
    <forbiddenPattern>Detailed problem analysis is followed by no implementation attempt.</forbiddenPattern>
    <enforcement>Analysis complete - MANDATORY ACTION PHASE is now required.</enforcement>
  </scenario>
  <scenario name="FixWithoutValidation">
    <description>Applying fixes without testing or verification.</description>
    <forbiddenPattern>Code changes are committed without execution in a test environment.</forbiddenPattern>
    <forbiddenPattern>An optimization is applied without performance measurement.</forbiddenPattern>
    <enforcement>Fixes applied - MANDATORY VERIFICATION PHASE is now required.</enforcement>
  </scenario>
  <scenario name="PrematureSuccess">
    <description>Declaring success without external confirmation.</description>
    <forbiddenPattern>Declaring success based on local code changes alone.</forbiddenPattern>
    <forbiddenPattern>Assuming deployment success without checking health endpoints or logs.</forbiddenPattern>
    <enforcement>Local changes are complete - MUST now verify external impact and get confirmation.</enforcement>
  </scenario>
  <scenario name="SkippingWaitPeriods">
    <description>Checking status before an external process could possibly complete.</description>
    <forbiddenPattern>Checking deployment status immediately after a 'git push'.</forbiddenPattern>
    <enforcement>External process initiated - MANDATORY wait period of [TIME] for [PROCESS] is now required.</enforcement>
  </scenario>
</antiPatternPrevention>
```

---

## 🔄 CYCLE COMPLETION VALIDATION

### Success Declaration Template

Upon successful completion of a cycle, an agent must generate a report matching this structure.

```xml
<successReportTemplate>
  <header>🎯 ITERATIVE CYCLE COMPLETION REPORT</header>
  <field name="CycleType">[CYCLE_NAME]</field>
  <field name="Target">[SUCCESS_CONDITION]</field>
  <summary>
    <steps>
      <step name="[STEP1]" status="✅" />
      <step name="[STEP2]" status="✅" />
      <step name="[VERIFICATION]" status="✅" />
    </steps>
    <iterationsRequired>[N]</iterationsRequired>
    <totalDuration>[TIME]</totalDuration>
  </summary>
  <evidence>
    <item type="[VERIFICATION_TYPE]">[RESULT]</item>
    <item type="[METRIC]">[MEASUREMENT]</item>
    <item type="[EXTERNAL_CONFIRMATION]">[STATUS]</item>
  </evidence>
  <finalStatus>COMPLETE</finalStatus>
  <nextActions>[MAINTENANCE/MONITORING/HANDOFF]</nextActions>
</successReportTemplate>
```