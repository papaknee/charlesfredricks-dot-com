#!/usr/bin/env node

/**
 * Scans public/content/projects/ for .md files, sorts them descending by date
 * (filename format: YYYY-MM-DD-slug.md), and writes manifest.json.
 *
 * Usage: node scripts/update-manifest.js
 */

const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, '..', 'public', 'content', 'projects');
const manifestPath = path.join(projectsDir, 'manifest.json');

const files = fs.readdirSync(projectsDir)
    .filter(f => f.endsWith('.md') && /^\d{4}-\d{2}-\d{2}-/.test(f))
    .sort((a, b) => b.localeCompare(a)); // descending by filename (date prefix)

fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2) + '\n');
console.log(`manifest.json updated with ${files.length} project(s):`);
files.forEach(f => console.log(`  ${f}`));
