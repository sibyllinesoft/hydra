/**
 * AUTONOMOUS CONTINUATION HOOK v3.0
 *
 * Prevents agents from stopping prematurely with a more robust, score-based system.
 * Implements iterative cycle enforcement and provides context-specific continuation guidance.
 * Includes a "certainty escape hatch" to prevent unwanted loops.
 * NEW: Integrates with local LLM endpoint for intelligent continuation analysis.
 */

const fetch = require('node-fetch');

const TRIGGERS = {
  // Score: 10 (High Confidence Incompleteness)
  INCOMPLETE_TODOS: {
    score: 10,
    patterns: [
      /"status":\s*"(pending|in_progress)"/g, // The most reliable signal
      /I have created a todo list with pending tasks/i,
      /\d+ tasks remaining/i,
      /the following tasks are still open/i,
    ],
    instruction: `
📋 **TODO COMPLETION REQUIRED**
You have open TodoWrite tasks. You MUST continue working on them autonomously until all are marked "completed".
1.  Select the next pending task.
2.  Execute the work required to complete it.
3.  Update its status to "completed".
4.  Repeat until no tasks are pending or in-progress.
`
  },
  // Score: 8 (Strong Signal of Incompleteness)
  ANALYSIS_WITHOUT_ACTION: {
    score: 8,
    patterns: [
      /analysis shows that we need to/i,
      /I've identified the issue, the next step is to/i,
      /the problem is caused by.*we should fix it/i,
      /my recommendation is to implement/i,
    ],
    instruction: `
⚡ **ACTION PHASE REQUIRED**
You have completed analysis but have not yet taken action. Analysis without implementation is an incomplete cycle. You MUST now implement the solution you have identified.
1.  Translate your findings into concrete actions (e.g., using Edit, Write tools).
2.  Apply the fixes or improvements you recommended.
3.  Verify that your changes have resolved the issue.
`
  },
  // Score: 6 (Moderate Signal of Incompleteness)
  ITERATIVE_OPPORTUNITIES: {
    score: 6,
    patterns: [
      /could be further improved/i,
      /the next iteration should/i,
      /for future improvement, we could/i,
      /this can be optimized by/i,
      /more testing is needed/i,
    ],
    instruction: `
🔁 **ITERATIVE CYCLE CONTINUATION REQUIRED**
Your response suggests the result is suboptimal and requires more iteration. You MUST continue the development cycle to achieve a better outcome.
1.  Define the specific improvement for this next iteration.
2.  Implement the change.
3.  Evaluate the result against your success criteria.
4.  Repeat until the result is optimal or you hit a clear technical boundary.
`
  },
  // Score: 4 (Potential Incompleteness)
  PARTIAL_COMPLETION: {
    score: 4,
    patterns: [
      /this is a basic implementation/i,
      /here is the initial version/i,
      /a first draft of the feature/i,
      /this is a starting point/i,
    ],
    instruction: `
✨ **FULL IMPLEMENTATION REQUIRED**
You have described your work as a "draft" or "basic implementation". You MUST continue working to deliver a production-ready, complete feature.
1.  Identify what is missing to make this a complete solution.
2.  Implement the remaining functionality, edge cases, and error handling.
3.  Ensure the final output meets all acceptance criteria.
`
  }
};

const CERTAINTY_ESCAPE_HATCH = `
---
**IMPORTANT**: If you are **absolutely certain** that your work is complete, that you have met all requirements, and that further iteration will not yield a significantly better result, you may stop. To do so, end your response with the single phrase: TASK_COMPLETE.
`;

/**
 * Queries local LLM endpoint for intelligent continuation analysis.
 */
async function queryLocalLLM(response, context = {}) {
  const endpoint = process.env.LOCAL_LLM_ENDPOINT;
  if (!endpoint) {
    return null;
  }

  try {
    const prompt = `You are an AI continuation analyzer. Analyze this Claude response and determine if the agent should continue working or if the task appears complete.

CONTEXT:
- Agent Type: ${context.agentType || 'unknown'}
- User Message: ${context.userMessage || 'not provided'}

CLAUDE'S RESPONSE:
${response}

Your task: Determine if Claude should continue working. Consider:
1. Are there incomplete tasks or todos?
2. Did Claude do analysis but not take action?
3. Are there obvious next steps or improvements needed?
4. Does the response indicate the work is genuinely complete?

Respond with JSON format:
{
  "should_continue": boolean,
  "confidence": number (0-100),
  "reason": "brief explanation",
  "suggested_instruction": "specific next steps if continuation needed, or null"
}`;

    const requestBody = {
      model: "gpt-3.5-turbo", // This will be ignored by most local endpoints
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    };

    const response_llm = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      timeout: 10000 // 10 second timeout
    });

    if (!response_llm.ok) {
      console.error(`[LOCAL-LLM] HTTP error: ${response_llm.status}`);
      return null;
    }

    const data = await response_llm.json();
    const content = data.choices?.[0]?.message?.content || data.response || data.text;
    
    if (!content) {
      console.error('[LOCAL-LLM] No content in response');
      return null;
    }

    // Try to parse JSON response
    try {
      const analysis = JSON.parse(content);
      return analysis;
    } catch (parseError) {
      // Fallback: look for JSON in the response text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('[LOCAL-LLM] Failed to parse JSON from response');
        }
      }
      return null;
    }

  } catch (error) {
    console.error('[LOCAL-LLM] Error querying local LLM:', error.message);
    return null;
  }
}

/**
 * Main hook function that analyzes agent responses and injects continuation instructions.
 */
async function analyzeResponseForContinuation(response, context = {}) {
  const { agentType, conversationHistory, userMessage } = context;

  // Do not trigger if the user is explicitly interacting or guiding.
  if (isUserRequestingStop(userMessage)) {
    return null;
  }

  // Try local LLM analysis first if available
  try {
    const llmAnalysis = await queryLocalLLM(response, context);
    if (llmAnalysis && llmAnalysis.should_continue && llmAnalysis.confidence > 70) {
      console.log(`[LOCAL-LLM] Recommending continuation: ${llmAnalysis.reason}`);
      return {
        type: { name: 'LOCAL_LLM_ANALYSIS' },
        instruction: formatContinuationInstruction(
          llmAnalysis.suggested_instruction || 
          `🤖 **LOCAL LLM CONTINUATION ANALYSIS**\n${llmAnalysis.reason}\n\nYou should continue working to complete the task properly.`
        )
      };
    } else if (llmAnalysis && !llmAnalysis.should_continue && llmAnalysis.confidence > 80) {
      console.log(`[LOCAL-LLM] Task appears complete: ${llmAnalysis.reason}`);
      return null; // Local LLM says task is complete, don't continue
    }
  } catch (error) {
    console.error('[LOCAL-LLM] Error in LLM analysis, falling back to regex patterns');
  }

  // Fallback to original regex-based analysis
  let highestScore = 0;
  let bestTrigger = null;

  // Evaluate the response against all triggers
  for (const key in TRIGGERS) {
    const trigger = TRIGGERS[key];
    if (matchesPatterns(response, trigger.patterns)) {
      if (trigger.score > highestScore) {
        highestScore = trigger.score;
        bestTrigger = trigger;
      }
    }
  }

  // Define a threshold for triggering the continuation.
  const SCORE_THRESHOLD = 5;

  if (highestScore >= SCORE_THRESHOLD) {
    // Special case for analysis without action: check for actual tool usage.
    if (bestTrigger === TRIGGERS.ANALYSIS_WITHOUT_ACTION && hasTakenAction(response)) {
      return null; // The agent analyzed AND acted, so we don't need to intervene.
    }
    
    return {
      type: bestTrigger,
      instruction: formatContinuationInstruction(bestTrigger.instruction)
    };
  }

  return null;
}

// --- Utility Functions ---

function isUserRequestingStop(userMessage) {
  if (!userMessage) return false;
  const stopPatterns = [
    /\b(stop|pause|wait|hold on|that's enough|thanks)\b/i,
    /^(ok|okay|sounds good|looks good|lg|continue|proceed)$/i, // Simple affirmations imply user is in control.
    /what do you think\?$/i, // User is asking for opinion, not action.
    /show me the code/i,
  ];
  return stopPatterns.some(pattern => pattern.test(userMessage));
}

function hasTakenAction(response) {
  // A more robust check for whether the agent has used tools to change the state.
  const actionIndicators = [
    /Edit\(/,
    /Write\(/,

    /MultiEdit\(/,
    /Bash\(/,
    /Task\(/, // Spawning another agent is a significant action.
    /git.git_commit/ // Using a specific MCP tool is a significant action
  ];
  return actionIndicators.some(pattern => pattern.test(response));
}

function matchesPatterns(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

function formatContinuationInstruction(instruction) {
  return `
---
🔄 **AUTONOMOUS CONTINUATION REQUIRED**
Your response indicates that the task is not fully complete. You must continue working autonomously to meet the project standards. Do not stop to ask for confirmation.
${instruction}
${CERTAINTY_ESCAPE_HATCH}
`;
}


module.exports = {
  name: "autonomous-continuation-v3",
  description: "Enhanced continuation hook with local LLM integration for intelligent analysis, plus robust regex fallback.",
  version: "3.0.0",

  beforeResponse: async function (response, context) {
    const continuationResult = await analyzeResponseForContinuation(response, context);

    if (continuationResult) {
      const triggerName = continuationResult.type.name || 'UNKNOWN';
      console.log(`[AUTONOMOUS-CONTINUATION-V3] Triggered: ${triggerName}. Injecting instruction.`);
      // Append the instruction to the end of the agent's response.
      return response + continuationResult.instruction;
    }

    return response;
  },
};