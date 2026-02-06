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

  // Look for a "Current Milestone" or in-progress milestone header
  const currentMilestoneMatch = content.match(/## (?:Current Milestone|⏳[^#]*): (Milestone \d+ - [^\n]+)/);

  if (!currentMilestoneMatch) {
    // No in-progress milestone found
    process.exit(0);
  }

  const milestoneName = currentMilestoneMatch[1];

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
