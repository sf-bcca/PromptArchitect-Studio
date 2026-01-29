const fs = require('fs');
const path = require('path');

const command = process.argv[2];
const planPath = process.argv[3];
const arg1 = process.argv[4]; // task text or phase name
const arg2 = process.argv[5]; // commit sha (optional)

if (!fs.existsSync(planPath)) {
  console.error(`Error: Plan file not found at ${planPath}`);
  process.exit(1);
}

let content = fs.readFileSync(planPath, 'utf8');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]/g, '\\$&');
}

if (command === 'start') {
  // arg1 is task text
  // Find "- [ ] task text"
  const regex = new RegExp(`- \[ \] ${escapeRegExp(arg1)}`, 'g');
  if (!regex.test(content)) {
    console.error(`Error: Task "- [ ] ${arg1}" not found in ${planPath}`);
    process.exit(1);
  }
  content = content.replace(regex, `- [~] ${arg1}`);
  console.log(`Success: Started task '${arg1}'`);

} else if (command === 'finish') {
  // arg1 is task text, arg2 is sha
  // Find "- [~] task text"
  const regex = new RegExp(`- \[~\] ${escapeRegExp(arg1)}`, 'g');
  if (!regex.test(content)) {
    console.error(`Error: In-progress task "- [~] ${arg1}" not found in ${planPath}`);
    process.exit(1);
  }
  const sha = arg2 ? arg2.substring(0, 7) : 'HEAD';
  content = content.replace(regex, `- [x] ${arg1} <!-- ${sha} -->`);
  console.log(`Success: Finished task '${arg1}' with SHA ${sha}`);

} else if (command === 'checkpoint') {
  // arg1 is phase name, arg2 is sha
  // Find "## Phase Name"
  const regex = new RegExp(`## ${escapeRegExp(arg1)}`, 'g');
  if (!regex.test(content)) {
    console.error(`Error: Phase "## ${arg1}" not found in ${planPath}`);
    process.exit(1);
  }
  const sha = arg2 ? arg2.substring(0, 7) : 'HEAD';
  content = content.replace(regex, `## ${arg1} [checkpoint: ${sha}]`);
  console.log(`Success: Checkpointed phase '${arg1}' with SHA ${sha}`);
} else {
  console.log("Usage: node update_task.cjs [start|finish|checkpoint] <plan_path> <arg1> [arg2]");
}

fs.writeFileSync(planPath, content);
