// Tests for scripts/validate.mjs, and for skills/cuddler-publish/scripts/check-video.sh
// when ffmpeg is installed (REQUIRE_FFMPEG=1 makes a missing ffmpeg a failure).
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validate } from "./validate.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SKILL = "skills/cuddler-publish/SKILL.md";

/** A scratch copy of the repository, changed by `edit`, then validated. */
function validateCopy(edit) {
  const dir = mkdtempSync(join(tmpdir(), "cuddler-publish-"));
  try {
    cpSync(ROOT, dir, { recursive: true, filter: (src) => !/[/\\](?:\.git|node_modules|evals[/\\]results)(?:[/\\]|$)/.test(src) });
    edit(dir);
    return validate(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function rewrite(dir, path, change) {
  writeFileSync(join(dir, path), change(readFileSync(join(dir, path), "utf8")));
}

test("the repository is valid", () => {
  assert.deepEqual(validate(ROOT), []);
});

test("every manifest carries the VERSION", () => {
  const errors = validateCopy((dir) => writeFileSync(join(dir, "VERSION"), "9.9.9\n"));
  assert.ok(errors.some((e) => e.includes(".claude-plugin/plugin.json: version 0.1.0 does not match VERSION 9.9.9")));
  assert.ok(errors.some((e) => e.includes("CHANGELOG.md: no entry for 9.9.9")));
});

test("the MCP connection is the personal Cuddler server only", () => {
  const errors = validateCopy((dir) =>
    rewrite(dir, ".mcp.json", (text) => text.replace("https://mcp.cuddler.ai/mcp", "https://example.test/mcp")),
  );
  assert.ok(errors.some((e) => e.startsWith(".mcp.json:")));
});

test("a Hard rule cannot be dropped", () => {
  const errors = validateCopy((dir) => rewrite(dir, SKILL, (text) => text.replace("**Private by default.**", "**Public is fine.**")));
  assert.ok(errors.includes(`${SKILL}: Hard rule "Private by default" is missing`));
});

test("the skill names only Cuddler tools", () => {
  const errors = validateCopy((dir) => rewrite(dir, SKILL, (text) => `${text}\nThen call \`publish_everywhere\`.\n`));
  assert.ok(errors.includes(`${SKILL}: \`publish_everywhere\` is not a Cuddler tool`));
});

test("no credit figures or payout promises", () => {
  const errors = validateCopy((dir) =>
    rewrite(dir, "README.md", (text) => `${text}\nEach post earns 50 credits and payouts are guaranteed.\n`),
  );
  assert.ok(errors.some((e) => e.startsWith("README.md: no credit figures")));
  assert.ok(errors.some((e) => e.startsWith("README.md: no promises about payouts")));
});

test("the description says when to use it and when not", () => {
  const errors = validateCopy((dir) => rewrite(dir, SKILL, (text) => text.replace("NOT for:", "Not meant for:")));
  assert.ok(errors.includes(`${SKILL}: the description must say "NOT for"`));
});

test("an eval case needs graders and a line in evals/README.md", () => {
  const errors = validateCopy((dir) => {
    cpSync(join(dir, "evals/confirm-first/prompt.md"), join(dir, "evals/new-case/prompt.md"), { recursive: true });
  });
  assert.ok(errors.includes("evals/new-case: no graders"));
  assert.ok(errors.includes("evals/README.md: case new-case is not described"));
});

test("a mock is in the server's format", () => {
  const errors = validateCopy((dir) =>
    writeFileSync(join(dir, "evals/mocks/cuddler/publish_video.md"), "published!\n"),
  );
  assert.ok(errors.includes("evals/mocks/cuddler/publish_video.md: not JSON in the server's format"));
});

// ─────────────────────────────── check-video.sh ───────────────────────────────

const CHECK = join(ROOT, "skills/cuddler-publish/scripts/check-video.sh");
const hasFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0 && spawnSync("ffprobe", ["-version"]).status === 0;

test("check-video.sh measures type, size and length", { skip: !hasFfmpeg && !process.env.REQUIRE_FFMPEG }, () => {
  assert.ok(hasFfmpeg, "ffmpeg and ffprobe are required (REQUIRE_FFMPEG=1)");
  const dir = mkdtempSync(join(tmpdir(), "check-video-"));
  try {
    const make = (name, seconds) =>
      spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "testsrc=size=160x120:rate=10", "-t", String(seconds), "-pix_fmt", "yuv420p", join(dir, name)]);
    make("ok.mp4", 3);
    make("LONG.MP4", 61);
    writeFileSync(join(dir, "broken.mp4"), "not a video");
    writeFileSync(join(dir, "clip.gif"), "GIF89a");

    const run = (name) => spawnSync("bash", [CHECK, join(dir, name)], { encoding: "utf8" });
    const ok = run("ok.mp4");
    assert.equal(ok.status, 0, ok.stdout + ok.stderr);
    assert.match(ok.stdout, /type: video\/mp4/);
    assert.match(ok.stdout, /seconds: 3/);
    const long = run("LONG.MP4");
    assert.equal(long.status, 1);
    assert.match(long.stdout, /length: OVER the limit/);
    assert.equal(run("broken.mp4").status, 1);
    assert.equal(run("clip.gif").status, 1);
    assert.equal(spawnSync("bash", [CHECK], { encoding: "utf8" }).status, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
