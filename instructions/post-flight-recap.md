# Post-Flight Recap Protocol

Upon successful merge and deployment of an epic, the executing agent (`project-shipper`) MUST perform the following actions.

1.  **Gather Information:**
    *   Read the original `epic.md` to get the feature name and overview.
    *   List all completed task files (`[issue-number].md`) associated with the epic.

2.  **Generate Recap File:**
    *   Create a new markdown file: `recaps/[YYYY-MM-DD]-[epic-name].md`.
    *   Use the `date-checker` agent for the current date.

3.  **Populate Recap Content:**
    *   **Title:** Recap: [Epic Name]
    *   **Summary:** A one-paragraph summary of the feature that was built.
    *   **Key Deliverables:** A bulleted list of the main sub-features or tasks completed.
    *   **Link to Epic:** A reference to the original epic file in the `.claude/epics/.archived/` directory.