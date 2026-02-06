#!/usr/bin/env node

// Hook: Stop event
// Checks if a milestone was just completed by reading todo.md
// and looking for in-progress milestones with all tasks checked.
// Outputs context reminding Claude to update docs and offer a git commit.

const fs = require('fs');
const path = require('path');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
  const todoPath = path.join(projectDir, 'todo.md');

  if (!fs.existsSync(todoPath)) {
    process.exit(0);
  }

  const content = fs.readFileSync(todoPath, 'utf-8');

  // Check if there's a current milestone section with unchecked items
  const hasUnchecked = content.includes('- [ ]');
  const hasChecked = content.includes('- [x]');

  // Look for an in-progress milestone header (various emoji/text formats)
  const currentMilestoneMatch = content.match(/## (?:Current Milestone|⏳|🔄)[^\n]*?(Milestone \d+ - [^\n]+)/);

  // Also check for completed milestones (✅) - take the most recent (last match)
  const completedMatches = [...content.matchAll(/## ✅ Completed: (Milestone \d+ - [^\n]+)/g)];
  const latestCompleted = completedMatches.length > 0 ? completedMatches[completedMatches.length - 1] : null;

  if (!currentMilestoneMatch && !latestCompleted) {
    // No relevant milestone found
    process.exit(0);
  }

  const milestoneName = currentMilestoneMatch ? currentMilestoneMatch[1] : latestCompleted[1];

  if (hasChecked && !hasUnchecked) {
    // All tasks are checked - milestone appears complete
    const output = {
      hookSpecificOutput: {
        hookEventName: 'Stop',
        additionalContext: `MILESTONE COMPLETION DETECTED: "${milestoneName}" has all tasks checked off in todo.md. You should:\n1. Use the docs-updater agent to mark the milestone as complete in todo.md and update CLAUDE.md\n2. Ask the user if they want to commit and push the milestone changes to git`
      }
    };
    console.log(JSON.stringify(output));
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
