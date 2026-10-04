import { readFile } from "node:fs/promises";
import { chunkBySentences, chunkFixed } from "../src/chunker.js";
import { evaluate } from "../src/evaluate.js";

const SIZE = 200;
const load = async (name) => JSON.parse(await readFile(new URL(`../fixtures/${name}`, import.meta.url), "utf8"));

const corpus = await load("corpus.json");
const queries = await load("queries.json");

const strategies = {
  "fixed-200": (d) => chunkFixed(d.text, { sourceId: d.id, size: SIZE }),
  "sentence-200/0": (d) => chunkBySentences(d.text, { sourceId: d.id, maxChars: SIZE, overlap: 0 }),
  "sentence-200/1": (d) => chunkBySentences(d.text, { sourceId: d.id, maxChars: SIZE, overlap: 1 }),
};

console.log(`fixture: ${corpus.length} docs, ${queries.length} queries (hand-written, not a benchmark)`);
console.log("strategy         chunks  recall@3  mrr");
for (const [name, chunk] of Object.entries(strategies)) {
  const r = evaluate(corpus, queries, chunk);
  console.log(`${name.padEnd(16)} ${String(r.chunks).padStart(6)}  ${r.recallAtK.toFixed(3).padStart(8)}  ${r.mrr.toFixed(3)}`);
}
