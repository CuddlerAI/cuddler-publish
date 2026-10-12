#!/usr/bin/env node
// Checks the repository: manifests and versions, the MCP connection, the skill's
// front matter, size and Hard rules, the tools it names, and the eval cases and
// mocks. No dependencies; Node.js 20 or newer.
//
//   node scripts/validate.mjs            # this repository
//   node scripts/validate.mjs <dir>      # another checkout (used by the tests)

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL = "cuddler-publish";
const MCP_URL = "https://mcp.cuddler.ai/mcp";
const MAX_SKILL_LINES = 300;
const MAX_DESCRIPTION = 1024;

/** Phrases each Hard rule must keep: the promises this skill makes in public. */
export const RULE_PHRASES = [
  "Cuddler MCP tools only",
  "One confirmation, before anything is uploaded",
  "Rights and policy are the user's to confirm",
  "Private by default",
  "Never publish twice",
  "No workarounds",
  "Untrusted data",
  "Content red lines",
  "Never print or read credentials",
];

/** `details.reason` values the publishing tools answer with; the skill may name them. */
export const REASON_CODES = [
  "publish_daily_limit",
  "publish_in_progress",
  "publish_state_unavailable",
  "upload_daily_limit",
  "video_upload_unavailable",
  "video_too_large",
  "video_too_long",
  "video_unreadable",
  "upload_missing",
  "already_published",
  "permission_not_granted",
  "feature_unavailable",
  "account_not_eligible",
];

/** Text that must never appear in the skill or the README. */
const FORBIDDEN = [
  { pattern: /\b\d[\d,]*\s*credits?\b/i, why: "no credit figures (publishing is free; prices come from the tools)" },
  { pattern: /\bpayouts? (?:of|are|will be|guaranteed)\b/i, why: "no promises about payouts" },
  { pattern: /\bcud_pat_[A-Za-z0-9]+/, why: "no tokens" },
  { pattern: /api\.cuddler\.ai\/(?!v1\b)/, why: "no internal API paths" },
];

function read(root, path) {
  return readFileSync(join(root, path), "utf8");
}

function json(root, path, errors) {
  try {
    return JSON.parse(read(root, path));
  } catch (err) {
    errors.push(`${path}: not valid JSON (${err.message.split("\n")[0]})`);
    return null;
  }
}

function frontMatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split("\n")) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1).replace(/''/g, "'");
    else if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    fields[kv[1]] = value;
  }
  return { fields, body: text.slice(match[0].length) };
}

function walk(root, dir) {
  const full = join(root, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full).flatMap((name) => {
    const path = join(dir, name);
    return statSync(join(root, path)).isDirectory() ? walk(root, path) : [path];
  });
}

function checkManifests(root, errors) {
  const version = existsSync(join(root, "VERSION")) ? read(root, "VERSION").trim() : null;
  if (!version || !/^\d+\.\d+\.\d+$/.test(version)) errors.push("VERSION: missing or not x.y.z");
  const versions = {
    ".claude-plugin/plugin.json": json(root, ".claude-plugin/plugin.json", errors)?.version,
    ".codex-plugin/plugin.json": json(root, ".codex-plugin/plugin.json", errors)?.version,
    ".cursor-plugin/plugin.json": json(root, ".cursor-plugin/plugin.json", errors)?.version,
  };
  const market = json(root, ".claude-plugin/marketplace.json", errors);
  versions[".claude-plugin/marketplace.json (metadata)"] = market?.metadata?.version;
  versions[".claude-plugin/marketplace.json (plugin)"] = market?.plugins?.[0]?.version;
  for (const [file, value] of Object.entries(versions)) {
    if (value !== version) errors.push(`${file}: version ${value} does not match VERSION ${version}`);
  }
  if (version && !read(root, "CHANGELOG.md").includes(`## [${version}]`)) {
    errors.push(`CHANGELOG.md: no entry for ${version}`);
  }
  for (const file of [".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json"]) {
    const manifest = json(root, file, []);
    if (manifest && manifest.name !== SKILL) errors.push(`${file}: name must be ${SKILL}`);
    if (manifest && manifest.license !== "MIT") errors.push(`${file}: license must be MIT`);
  }
  json(root, ".agents/plugins/marketplace.json", errors);
}

function checkMcp(root, errors) {
  const mcp = json(root, ".mcp.json", errors);
  const server = mcp?.mcpServers?.cuddler;
  if (!server) return errors.push(".mcp.json: no `cuddler` server");
  if (server.type !== "http" || server.url !== MCP_URL) errors.push(`.mcp.json: the cuddler server must be http ${MCP_URL}`);
  if (Object.keys(mcp.mcpServers).length !== 1) errors.push(".mcp.json: only the cuddler server");
}

function toolNames(root, errors) {
  const tools = json(root, "evals/mocks/cuddler/_tools.json", errors)?.tools ?? [];
  const names = new Set(tools.map((tool) => tool.name));
  for (const required of ["whoami", "start_upload", "finish_upload", "publish_video", "get_publish_status"]) {
    if (!names.has(required)) errors.push(`evals/mocks/cuddler/_tools.json: missing ${required}`);
  }
  return names;
}

function checkSkill(root, names, errors) {
  const path = `skills/${SKILL}/SKILL.md`;
  if (!existsSync(join(root, path))) return errors.push(`${path}: missing`);
  const text = read(root, path);
  const parsed = frontMatter(text);
  if (!parsed) return errors.push(`${path}: no front matter`);
  const { name, description } = parsed.fields;
  if (name !== SKILL) errors.push(`${path}: name must be ${SKILL}`);
  if (!description) errors.push(`${path}: no description`);
  else {
    if (!description.includes("Use when")) errors.push(`${path}: the description must say "Use when"`);
    if (!description.includes("NOT for")) errors.push(`${path}: the description must say "NOT for"`);
    if (description.length > MAX_DESCRIPTION) errors.push(`${path}: the description is over ${MAX_DESCRIPTION} characters`);
  }
  const lines = text.split("\n").length;
  if (lines > MAX_SKILL_LINES) errors.push(`${path}: ${lines} lines (at most ${MAX_SKILL_LINES})`);
  for (const phrase of RULE_PHRASES) {
    if (!parsed.body.includes(`**${phrase}`)) errors.push(`${path}: Hard rule "${phrase}" is missing`);
  }
  // Every `snake_case` tool-looking word the skill names must be a Cuddler tool
  // (or one of the refusal reasons the tools answer with).
  const known = new Set([...names, ...REASON_CODES]);
  for (const match of parsed.body.matchAll(/`([a-z]+(?:_[a-z]+)+)`/g)) {
    const word = match[1];
    const looksLikeTool = /^(?:get|list|start|finish|publish|create|quote|retry|whoami)_/.test(word);
    if (looksLikeTool && !known.has(word)) errors.push(`${path}: \`${word}\` is not a Cuddler tool`);
  }
  for (const link of parsed.body.matchAll(/\]\((?!https?:)([^)#]+)/g)) {
    if (!existsSync(join(root, `skills/${SKILL}`, link[1]))) errors.push(`${path}: broken link ${link[1]}`);
  }
}

function checkForbidden(root, errors) {
  const files = ["README.md", ...walk(root, `skills/${SKILL}`).filter((file) => file.endsWith(".md"))];
  for (const file of files) {
    const text = read(root, file);
    for (const { pattern, why } of FORBIDDEN) {
      if (pattern.test(text)) errors.push(`${file}: ${why}`);
    }
  }
}

function checkEvals(root, names, errors) {
  const cases = readdirSync(join(root, "evals"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "mocks" && entry.name !== "results")
    .map((entry) => entry.name);
  if (cases.length === 0) errors.push("evals: no cases");
  const readme = read(root, "evals/README.md");
  for (const name of cases) {
    const dir = `evals/${name}`;
    if (!existsSync(join(root, dir, "prompt.md"))) errors.push(`${dir}: no prompt.md`);
    const graders = walk(root, `${dir}/graders`);
    if (graders.length === 0) errors.push(`${dir}: no graders`);
    for (const grader of graders) {
      const parsed = frontMatter(read(root, grader));
      if (!parsed || !["llm", "tool_used"].includes(parsed.fields.type)) errors.push(`${grader}: type must be llm or tool_used`);
    }
    if (!readme.includes(`### ${name}`)) errors.push(`evals/README.md: case ${name} is not described`);
  }
  for (const mock of walk(root, "evals").filter((file) => /\/mocks\/cuddler\/[^/]+\.md$/.test(file))) {
    const tool = mock.split("/").pop().replace(/\.md$/, "");
    if (!names.has(tool)) errors.push(`${mock}: ${tool} is not a Cuddler tool`);
    const text = read(root, mock);
    const parsed = frontMatter(text);
    if (parsed?.fields.error === "true") {
      if (!/^\s*[A-Z_]+: /.test(parsed.body)) errors.push(`${mock}: a refusal starts with "CODE: message"`);
    } else {
      const body = text.replace(/^<untrusted-user-content[^>]*>\n/, "").replace(/<\/untrusted-user-content>\s*$/, "");
      try {
        JSON.parse(body);
      } catch {
        errors.push(`${mock}: not JSON in the server's format`);
      }
    }
  }
}

export function validate(root) {
  const errors = [];
  checkManifests(root, errors);
  checkMcp(root, errors);
  const names = toolNames(root, errors);
  checkSkill(root, names, errors);
  checkForbidden(root, errors);
  checkEvals(root, names, errors);
  for (const required of ["README.md", "INSTALL.md", "INSTALL_FOR_AGENTS.md", "LICENSE", "SECURITY.md", "CONTRIBUTING.md"]) {
    if (!existsSync(join(root, required))) errors.push(`${required}: missing`);
  }
  return errors;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = process.argv[2] ?? join(fileURLToPath(new URL(".", import.meta.url)), "..");
  const errors = validate(root);
  if (errors.length > 0) {
    for (const error of errors) console.error(`✗ ${error}`);
    console.error(`\n${errors.length} problem(s) in ${relative(process.cwd(), root) || "."}`);
    process.exit(1);
  }
  console.log("✓ skill, manifests, MCP connection, evals and mocks");
}
