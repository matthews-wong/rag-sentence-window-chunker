import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const CLI = new URL("../bin/chunk.js", import.meta.url).pathname;
const CORPUS = new URL("../fixtures/corpus.json", import.meta.url).pathname;

test("prints one JSON chunk per line", () => {
  const r = spawnSync("node", [CLI, CORPUS, "--max-chars", "100", "--overlap", "0"], { encoding: "utf8" });
  assert.equal(r.status, 0);
  const lines = r.stdout.trim().split("\n").map((l) => JSON.parse(l));
  assert.ok(lines.length > 1);
  assert.equal(lines[0].id, "corpus.json#0");
});

test("missing file argument exits 2 with usage", () => {
  const r = spawnSync("node", [CLI], { encoding: "utf8" });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /usage/);
});
