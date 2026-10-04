import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIndex, search, tokenize } from "../src/bm25.js";

const CHUNKS = [
  { id: "a", text: "redis cache eviction policy" },
  { id: "b", text: "postgres vacuum and autovacuum tuning" },
  { id: "c", text: "cache cache cache everywhere" },
];

test("tokenize lowercases and drops punctuation", () => {
  assert.deepEqual(tokenize("Hello, World-42!"), ["hello", "world", "42"]);
});

test("ranks the chunk that matches the rarer term first", () => {
  const hits = search(buildIndex(CHUNKS), "redis cache");
  assert.equal(hits[0].chunk.id, "a");
});

test("drops chunks with no matching term", () => {
  const hits = search(buildIndex(CHUNKS), "vacuum");
  assert.deepEqual(hits.map((h) => h.chunk.id), ["b"]);
});

test("empty query and empty index return nothing", () => {
  assert.deepEqual(search(buildIndex(CHUNKS), ""), []);
  assert.deepEqual(search(buildIndex([]), "cache"), []);
});

test("respects the limit", () => {
  assert.equal(search(buildIndex(CHUNKS), "cache", 1).length, 1);
});
