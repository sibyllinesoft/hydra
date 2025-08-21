Of course. The original document is quite detailed, making it more of a manual than a specification. I will condense it significantly, focusing on the core rules and structures that an autonomous agent needs to know. The result will be a concise, machine-readable specification.

Here is the streamlined and XML-enhanced version of the `TEMP-DIRECTORY-MANAGEMENT.md`.

---
# Temporary Directory Management (XML-Enhanced)

**Purpose**: This document defines the mandatory temporary directory structure and management policies for all agent-driven projects.

---

## 1. Directory Structure

All temporary files must be stored under the `.claude-temp/` directory in the project root. The XML below defines the required structure and purpose of each subdirectory.

```xml
<tempDirectoryStructure root=".claude-temp/">
  <directory name="testing" purpose="Test outputs, coverage reports, and debugging logs." />
  <directory name="documentation" purpose="Temporary explanations, analysis, and research notes." />
  <directory name="todos" purpose="Task tracking files, agent coordination plans, and workflow state." />
  <directory name="verification" purpose="Linting reports, type check results, and security scan outputs." />
  <directory name="experiments" purpose="Prototype code, spike solutions, and proof-of-concepts." />
  <directory name="artifacts" purpose="Generated files, screenshots, and other ephemeral build outputs." />
  <directory name="sessions" purpose="Session-specific working files and communication logs." />
</tempDirectoryStructure>
```

---

## 2. File Naming Conventions

Files created in the temporary directory must follow one of these prescribed formats for automated identification and cleanup.

```xml
<namingConventions>
  <convention type="Timestamp" format="[YYYY-MM-DD-HH-MM-SS]-[description].[ext]" />
  <convention type="Purpose" format="[type]-[component]-[description].[ext]" />
  <convention type="Session" format="session-[session-id]-[purpose].[ext]" />
</namingConventions>
```

---

## 3. Lifecycle Management Policy

Temporary files are ephemeral and subject to automated cleanup. The following retention policies are enforced.

```xml
<lifecyclePolicy>
  <default retentionDays="7" description="All files not covered by a specific rule are deleted after 7 days." />
  <rule target=".claude-temp/experiments/" retentionDays="14" description="Experiments are kept longer for review." />
  <rule target=".claude-temp/testing/" retentionDays="2" description="Test outputs are cleaned frequently." />
  <rule target=".claude-temp/artifacts/" retentionDays="1" description="Build artifacts are cleaned very frequently." />
  <rule target=".claude-temp/sessions/" retentionDays="1" description="Session files are cleaned daily." />
</lifecyclePolicy>
```

---

## 4. Agent Integration and Usage

Agents must use the temporary directories according to their function. This ensures separation of concerns and facilitates coordination.

```xml
<agentUsageGuidelines>
  <mapping agentType="Prototyping" directory=".claude-temp/experiments/" />
  <mapping agentType="Testing" directory=".claude-temp/testing/" />
  <mapping agentType="Verification" directory=".claude-temp/verification/" />
  <mapping agentType="Analysis" directory=".claude-temp/documentation/" />
  <mapping agentType="Development" directory=".claude-temp/artifacts/" />
  <handoffProtocol>
    Agent A writes its output to the designated directory. Agent B reads the file to continue the workflow. The file is deleted by Agent B upon successful processing.
  </handoffProtocol>
</agentUsageGuidelines>
```

---

## 5. Repository Integration (`.gitignore`)

The `.claude-temp/` directory must always be excluded from version control.

```xml
<gitignore>
  <![CDATA[
# Claude Code temporary files and backups
.claude-temp/
.claude-temp-backup/

# Agent artifacts and session files
*-verification.log
*-test-results.json
session-*.log
]]>
</gitignore>
```

---

## 6. Mandatory Agent Protocol

All agents must follow this protocol when interacting with the temporary directory.

```xml
<agentProtocol>
  <phase name="Pre-Task">
    <action>Verify the .claude-temp/ structure exists; create it if missing.</action>
    <action>Generate a unique filename in the appropriate subdirectory using naming conventions.</action>
  </phase>
  <phase name="During-Task">
    <action>Save all intermediate outputs and logs to the designated temporary file.</action>
    <action>Coordinate with other agents through shared files in the temp directory.</action>
  </phase>
  <phase name="Post-Task">
    <action>Archive critical results to permanent project locations.</action>
    <action>Delete all non-archived, intermediate files used during the task.</action>
    <action>Log task completion and archive locations to the session log.</action>
  </phase>
  <errorHandling>
    <action>On failure, save error logs and debug information to .claude-temp/testing/ before exiting.</action>
  </errorHandling>
</agentProtocol>
```