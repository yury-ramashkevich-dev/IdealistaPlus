#!/usr/bin/env node

// Hook: Stop event
// After a milestone is completed and user confirms,
// checks if there are uncommitted changes and reminds to commit.
// This runs as a suggestion - the actual commit requires user approval.

const { execSync } = require('child_process');
const path = require('path');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');

  try {
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', {
      cwd: projectDir,
      encoding: 'utf-8'
    }).trim();

    if (!status) {
      // No changes to commit
      process.exit(0);
    }

    // Count changed files
    const changedFiles = status.split('\n').length;

    // Check recent commit messages to detect milestone pattern
    const lastCommit = execSync('git log --oneline -1 2>/dev/null || echo "none"', {
      cwd: projectDir,
      encoding: 'utf-8'
    }).trim();

    const output = {
      hookSpecificOutput: {
        hookEventName: 'Stop',
        additionalContext: `GIT STATUS: ${changedFiles} uncommitted file(s) detected. Last commit: "${lastCommit}". If a milestone was just completed, suggest committing with a message like "Milestone N: <description>" and ask the user for confirmation before committing.`
      }
    };
    console.log(JSON.stringify(output));
  } catch (e) {
    // Git not available or not a repo - silently skip
    process.exit(0);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
