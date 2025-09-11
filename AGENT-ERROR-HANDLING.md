# Agent Error Handling & Escalation Protocol

<protocol_version>1.0</protocol_version>
<purpose>To define the mandatory, structured format for reporting failures.</purpose>

<core_principle>When an agent cannot complete its task, it MUST NOT simply state failure. It MUST output a structured JSON error object and NOTHING ELSE. This enables programmatic recovery and analysis.</core_principle>

<error_reporting_schema>
  <field name="error_code" enum="[
    'BLOCKED_BY_DEPENDENCY', 
    'MISSING_INPUT', 
    'TOOL_FAILURE', 
    'MAX_ITERATIONS_REACHED',
    'INSUFFICIENT_CONTEXT',
    'SECURITY_VIOLATION',
    'HUMAN_INTERVENTION_REQUIRED',
    'UNKNOWN_FAILURE'
  ]" description="A machine-readable error category."/>
  <field name="message" type="string" description="A concise, human-readable description of the failure."/>
  <field name="agent_name" type="string" description="The name of the failing agent."/>
  <field name="last_successful_step" type="string" description="The last major action or workflow step that was completed successfully."/>
  <field name="context_summary" type="object" description="Relevant variables or state at the time of failure (e.g., file paths, command that failed)."/>
  <field name="suggested_next_step" type="string" description="A recommendation for the orchestrator (e.g., 'Retry with tool X', 'Escalate to human', 'Invoke agent Y')."/>
</error_reporting_schema>

<example>
```json
{
  "error_code": "TOOL_FAILURE",
  "message": "The 'playwright' MCP server failed to launch a browser instance after 3 retries.",
  "agent_name": "ui-designer",
  "last_successful_step": "Analyzed design requirements",
  "context_summary": {
    "mcp_server": "playwright",
    "action": "capture_screenshot",
    "target_url": "http://localhost:3000"
  },
  "suggested_next_step": "Check if the local development server is running and accessible, then re-invoke 'ui-designer'."
}
```
</example>
