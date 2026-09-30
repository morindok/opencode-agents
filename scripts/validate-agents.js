#!/usr/bin/env node
/**
 * validate-agents.js — OpenCode agent frontmatter validator.
 *
 * Enforces the schema documented at https://opencode.ai/docs/agents/ and the
 * live Agent.Info schema served by `opencode api GET /openapi.json`.
 *
 * Checks performed per file in agents/:
 *   1. Well-formed YAML frontmatter delimited by --- ... ---
 *   2. Required fields present: description, mode
 *   3. `mode` is one of: primary | subagent | all
 *   4. DEPRECATED `tools:` key is rejected (use `permission:` instead)
 *   5. A permission block is declared at all
 *   6. `permission: allow` bare string is flagged (auto-approves every call)
 *   7. `steps` is an integer within a sane ceiling
 *   8. Filename is a safe agent identifier (kebab-case, no spaces)
 *   9. Deprecated `maxSteps` key is rejected (renamed to `steps`)
 *
 * Repo-level checks:
 *  10. LICENSE file exists
 *  11. README links to every agent file
 *
 * Usage:
 *   node scripts/validate-agents.js [--strict]
 *
 *   --strict   promote every WARN to an ERROR (use in CI)
 *
 * Exit codes: 0 = pass, 1 = at least one error, 2 = bad invocation.
 * Zero dependencies by design — the gate must not rot from dependency drift.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'agents');
const STRICT = process.argv.includes('--strict');

const VALID_MODES = new Set(['primary', 'subagent', 'all']);
const KNOWN_KEYS = new Set([
  'description', 'mode', 'model', 'temperature', 'topP', 'steps', 'disable',
  'prompt', 'permission', 'permissions', 'tools', 'color', 'hidden', 'name',
]);
const DEPRECATED_KEYS = {
  tools: '`tools:` is deprecated and ignored by current OpenCode. Use `permission:` instead.',
  maxSteps: '`maxSteps:` was renamed to `steps:` and is deprecated.',
};
const STEPS_CEILING = 50;

const findings = [];
const err = (file, check, msg) => findings.push({ level: 'error', file, check, msg });
const warn = (file, check, msg) => findings.push({ level: STRICT ? 'error' : 'warn', file, check, msg });

/**
 * Minimal YAML-subset frontmatter parser.
 * Handles scalars, one level of nesting, and block sequences — which is the
 * full range OpenCode agent frontmatter actually uses. Deliberately not a
 * general YAML parser: a dependency here is a liability in a CI gate.
 */
function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { ok: false, reason: 'no --- delimited frontmatter block' };

  const data = {};
  const lines = m[1].split(/\r?\n/);
  let currentKey = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim() || /^\s*#/.test(raw)) continue;

    const top = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(raw);
    if (top) {
      const [, key, rest] = top;
      currentKey = key;
      if (rest === '') {
        data[key] = {}; // nested block, filled below
      } else {
        data[key] = coerce(rest);
      }
      continue;
    }

    const nested = /^\s+([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(raw);
    if (nested && currentKey && typeof data[currentKey] === 'object') {
      data[currentKey][nested[1]] = coerce(nested[2]);
      continue;
    }

    const seqItem = /^\s+-\s*(.+)$/.exec(raw);
    if (seqItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(coerce(seqItem[1]));
      continue;
    }

    return { ok: false, reason: `unparseable frontmatter line ${i + 2}: ${raw.trim()}` };
  }
  return { ok: true, data };
}

function coerce(v) {
  let s = v.trim();
  if (/^".*"$/.test(s) || /^'.*'$/.test(s)) return s.slice(1, -1);
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s === '#f7931a') return s; // colour hex, keep as string
  return s;
}

// ---------------------------------------------------------------- file checks

function checkFilename(name) {
  const base = path.basename(name, '.md');
  if (/\s/.test(base)) {
    err(name, 'filename', `filename contains a space ("${base}"). OpenCode derives the agent name from the filename, so spaces break @mention and Tab selection. Rename to kebab-case.`);
  }
  if (/[A-Z]/.test(base)) {
    err(name, 'filename', `filename is not lowercase ("${base}"). Use kebab-case so the derived agent id matches how it is invoked.`);
  }
  if (/\.(md|markdown)$/i.test(name) === false) {
    warn(name, 'filename', 'expected a .md extension.');
  }
}

function validateAgentFile(file) {
  const text = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
  checkFilename(file);

  const fm = parseFrontmatter(text);
  if (!fm.ok) {
    err(file, 'frontmatter', fm.reason);
    return;
  }
  const a = fm.data;

  for (const k of Object.keys(a)) {
    if (DEPRECATED_KEYS[k]) err(file, 'deprecated', `${DEPRECATED_KEYS[k]} Found in: ${k}`);
  }

  for (const k of Object.keys(a)) {
    if (!KNOWN_KEYS.has(k)) {
      warn(file, 'unknown-key', `"${k}" is not a documented agent field; it will be ignored.`);
    }
  }

  if (!a.description) err(file, 'required', 'missing required field: description');
  else if (String(a.description).length < 20) {
    warn(file, 'description', 'description is very short; it is what the router matches against.');
  }

  if (!a.mode) err(file, 'required', 'missing required field: mode');
  else if (!VALID_MODES.has(a.mode)) {
    err(file, 'mode', `mode "${a.mode}" is invalid. Expected one of: ${[...VALID_MODES].join(', ')}`);
  }

  const perm = a.permission ?? a.permissions;
  if (perm === undefined) {
    err(file, 'permissions', 'no permission block declared. The agent silently inherits full default tool access. Declare `permission:` explicitly.');
  } else if (typeof perm === 'string' && perm === 'allow') {
    warn(file, 'permissions', '`permission: allow` auto-approves every tool call with no human confirmation. Consider a nested rule set (e.g. `permission:\\n  bash: ask`).');
  } else if (typeof perm === 'string') {
    warn(file, 'permissions', `permission "${perm}" is a bare string; the documented form is a nested rule set.`);
  } else if (typeof perm === 'object' && Object.keys(perm).length === 0) {
    warn(file, 'permissions', 'permission block is empty.');
  }

  if (a.steps !== undefined) {
    if (typeof a.steps !== 'number' || !Number.isInteger(a.steps)) {
      err(file, 'steps', `steps must be an integer, got ${JSON.stringify(a.steps)}`);
    } else if (a.steps > STEPS_CEILING) {
      warn(file, 'steps', `steps: ${a.steps} exceeds the ${STEPS_CEILING}-step ceiling. That is a lot of autonomous file-write and shell iterations.`);
    }
  }

  if (a.temperature !== undefined && typeof a.temperature === 'number') {
    if (a.temperature < 0 || a.temperature > 2) {
      err(file, 'temperature', `temperature ${a.temperature} is outside the 0-2 range.`);
    }
  }

  if (a.color !== undefined && typeof a.color === 'string' && !/^#/.test(a.color)) {
    warn(file, 'color', `color "${a.color}" should be a hex value like "#ff8800".`);
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  if (words > 6000) {
    warn(file, 'size', `${words} words — very large persona. Long system prompts dilute instruction-following; consider splitting capability into skills.`);
  }
}

// ---------------------------------------------------------------- repo checks

function checkRepo() {
  if (!fs.existsSync(path.join(ROOT, 'LICENSE'))) {
    err('(repo)', 'license', 'no LICENSE file. If the README claims a license, ship the file.');
  }
  const readmePath = path.join(ROOT, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    for (const file of fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md'))) {
      const linked = readme.includes(`agents/${file}`) || readme.includes(encodeURI(file));
      if (!linked) err('README.md', 'index', `does not link to agents/${file}.`);
    }
  }
}

// ---------------------------------------------------------------------- main

function main() {
  if (!fs.existsSync(AGENTS_DIR)) {
    console.error(`ERROR: no agents/ directory at ${AGENTS_DIR}`);
    process.exit(2);
  }

  const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md')).sort();
  for (const f of files) validateAgentFile(f);
  checkRepo();

  const errors = findings.filter((f) => f.level === 'error');
  const warns = findings.filter((f) => f.level === 'warn');

  for (const f of findings) {
    const tag = f.level === 'error' ? 'ERROR' : 'WARN ';
    console.log(`${tag} ${f.file}:${f.check}: ${f.msg}`);
  }

  console.log('');
  console.log(`${files.length} agent(s) checked — ${errors.length} error(s), ${warns.length} warning(s)${STRICT ? ' [strict]' : ''}`);
  console.log(errors.length ? 'FAILED' : 'PASSED');
  process.exit(errors.length ? 1 : 0);
}

main();
