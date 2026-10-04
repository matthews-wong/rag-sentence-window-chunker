import { test } from "node:test";
import assert from "node:assert/strict";
import { splitSentences } from "../src/sentences.js";

test("splits on terminal punctuation and keeps offsets", () => {
  const text = "First one. Second one! Third?";
  const spans = splitSentences(text);
  assert.deepEqual(spans.map((s) => s.text), ["First one.", "Second one!", "Third?"]);
  for (const s of spans) assert.equal(text.slice(s.start, s.end), s.text);
});

test("does not split after known abbreviations", () => {
  const spans = splitSentences("Use a cache, e.g. Redis. It is fast.");
  assert.equal(spans.length, 2);
});

test("keeps decimals intact", () => {
  assert.equal(splitSentences("Version 3.5 shipped. Done.").length, 2);
});

test("empty and whitespace-only input yield no spans", () => {
  assert.deepEqual(splitSentences(""), []);
  assert.deepEqual(splitSentences("  \n "), []);
});

test("trailing text without a terminator is kept", () => {
  assert.deepEqual(splitSentences("One. two").map((s) => s.text), ["One.", "two"]);
});
