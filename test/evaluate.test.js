import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../src/evaluate.js";
import { chunkBySentences, chunkFixed } from "../src/chunker.js";

const corpus = [{ id: "d", text: "Cats purr softly. Dogs bark loudly at night." }];
const queries = [{ query: "dogs bark", docId: "d", answer: "Dogs bark loudly at night." }];

test("whole-sentence chunks find the answer", () => {
  const r = evaluate(corpus, queries, (d) => chunkBySentences(d.text, { sourceId: d.id, maxChars: 20, overlap: 0 }));
  assert.equal(r.recallAtK, 1);
  assert.equal(r.mrr, 1);
});

test("a chunk that splits the answer sentence scores zero", () => {
  const r = evaluate(corpus, queries, (d) => chunkFixed(d.text, { sourceId: d.id, size: 20 }));
  assert.equal(r.recallAtK, 0);
});

test("reports chunk and query counts", () => {
  const r = evaluate(corpus, queries, (d) => chunkFixed(d.text, { sourceId: d.id, size: 20 }));
  assert.equal(r.queries, 1);
  assert.equal(r.chunks, 3);
});
