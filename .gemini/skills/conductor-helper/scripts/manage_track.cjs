const fs = require('fs');
const path = require('path');

const command = process.argv[2];
const trackName = process.argv[3];
const rootDir = process.cwd();
const tracksDir = path.join(rootDir, 'conductor', 'tracks');
const tracksIndex = path.join(rootDir, 'conductor', 'tracks.md');

if (!fs.existsSync(tracksDir)) {
  fs.mkdirSync(tracksDir, { recursive: true });
}

function createTrack(name) {
  const safeName = name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const trackPath = path.join(tracksDir, safeName);

  if (fs.existsSync(trackPath)) {
    console.log(`Error: Track '${safeName}' already exists.`);
    process.exit(1);
  }

  fs.mkdirSync(trackPath, { recursive: true });

  const planContent = `# Plan: ${name}\n\n## Phase 1: Inception\n- [ ] Define requirements\n`;
  const specContent = `# Specification: ${name}\n\n## Overview\n`;
  const metadataContent = JSON.stringify({ name: name, created: new Date().toISOString(), status: 'active' }, null, 2);
  const indexContent = `# Track: ${name}\n\n- [Plan](./plan.md)\n- [Spec](./spec.md)\n`;

  fs.writeFileSync(path.join(trackPath, 'plan.md'), planContent);
  fs.writeFileSync(path.join(trackPath, 'spec.md'), specContent);
  fs.writeFileSync(path.join(trackPath, 'metadata.json'), metadataContent);
  fs.writeFileSync(path.join(trackPath, 'index.md'), indexContent);

  // Update tracks.md
  const link = `\n- [${name}](./tracks/${safeName}/index.md)`;
  fs.appendFileSync(tracksIndex, link);

  console.log(`Success: Created track '${safeName}' at ${trackPath}`);
}

function listTracks() {
  if (!fs.existsSync(tracksIndex)) {
    console.log("No tracks found (tracks.md missing).");
    return;
  }
  const content = fs.readFileSync(tracksIndex, 'utf8');
  console.log(content);
}

if (command === 'create') {
  if (!trackName) {
    console.error("Error: Missing track name.");
    process.exit(1);
  }
  createTrack(trackName);
} else if (command === 'list') {
  listTracks();
} else {
  console.log("Usage: node manage_track.cjs [create <name> | list]");
}
