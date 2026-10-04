import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkBySentences, chunkFixed } from "../src/chunker.js";

const TEXT = "Alpha is first. Beta is second. Gamma is third. Delta is fourth.";

test("chunks hold whole sentences and offsets round-trip", () => {
  const chunks = chunkBySentences(TEXT, { sourceId: "d", maxChars: 32, overlap: 0 });
  assert.deepEqual(chunks.map((c) => c.text), [
    "Alpha is first. Beta is second.",
    "Gamma is third. Delta is fourth.",
  ]);
  for (const c of chunks) assert.equal(TEXT.slice(c.start, c.end), c.text);
});

test("overlap repeats trailing sentences in the next chunk", () => {
  const chunks = chunkBySentences(TEXT, { sourceId: "d", maxChars: 32, overlap: 1 });
  assert.equal(chunks[1].text.startsWith("Beta is second."), true);
  assert.equal(chunks.at(-1).text.endsWith("Delta is fourth."), true);
});

test("an oversized sentence is kept whole", () => {
  const chunks = chunkBySentences("A very long single sentence here.", { sourceId: "d", maxChars: 5 });
  assert.equal(chunks.length, 1);
});

test("overlap >= window size still terminates", () => {
  const chunks = chunkBySentences(TEXT, { sourceId: "d", maxChars: 16, overlap: 5 });
  assert.equal(chunks.length, 4);
});

test("ids are sequential per source", () => {
  const chunks = chunkBySentences(TEXT, { sourceId: "doc", maxChars: 32, overlap: 0 });
  assert.deepEqual(chunks.map((c) => c.id), ["doc#0", "doc#1"]);
});

test("invalid options name the offending value", () => {
  assert.throws(() => chunkBySentences(TEXT, { sourceId: "d", maxChars: 0 }), /maxChars.*0/);
  assert.throws(() => chunkBySentences(TEXT, { sourceId: "d", overlap: -1 }), /overlap.*-1/);
  assert.throws(() => chunkFixed(TEXT, { sourceId: "d", size: 1.5 }), /size.*1.5/);
});

test("fixed chunker cuts at the size and skips blank tails", () => {
  const chunks = chunkFixed("abcdefghij   ", { sourceId: "d", size: 5 });
  assert.deepEqual(chunks.map((c) => c.text), ["abcde", "fghij"]);
});
